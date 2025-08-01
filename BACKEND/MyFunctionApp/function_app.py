import azure.functions as func
import logging
import os
import json
import uuid
import shutil
from datetime import datetime
from azure.storage.blob import BlobServiceClient

# Aapke logic functions
from HttpTrigger1.logic.imgtocsv import image_to_csv_pipeline
from HttpTrigger1.logic.pdfcsv import pdf_to_csv
from HttpTrigger1.logic.mergecsv import CSVMatcher

app = func.FunctionApp()

# --- Configuration ---
CONNECTION_STRING = os.environ["AzureWebJobsStorage"]
UPLOADS_CONTAINER = "uploads"
OUTPUTS_CONTAINER = "outputs"
blob_service_client = BlobServiceClient.from_connection_string(CONNECTION_STRING)


# --- Standardized Responses ---
CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

def create_response(data, status_code=200):
    """Creates a standardized JSON response."""
    headers = CORS_HEADERS.copy()
    headers["Content-Type"] = "application/json"
    return func.HttpResponse(json.dumps(data), status_code=status_code, headers=headers)

def create_error_response(message, status_code=400):
    """Creates a standardized error JSON response."""
    return create_response({"error": True, "message": message}, status_code)


# --- API Functions ---

@app.route(route="upload", methods=["POST", "OPTIONS"])
def upload_file(req: func.HttpRequest) -> func.HttpResponse:
    """Handles file upload and saves it directly to Azure Blob Storage."""
    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=204, headers=CORS_HEADERS)

    logging.info("Upload endpoint triggered.")
    try:
        uploaded_file = req.files.get('file')
        if not uploaded_file:
            return create_error_response("No file found in the request. Make sure to use 'file' as the key.", 400)

        original_filename = uploaded_file.filename
        file_extension = os.path.splitext(original_filename)[1]
        blob_name = f"{uuid.uuid4()}{file_extension}"

        blob_client = blob_service_client.get_blob_client(container=UPLOADS_CONTAINER, blob=blob_name)
        blob_client.upload_blob(uploaded_file.read(), overwrite=True)

        logging.info(f"File '{original_filename}' uploaded to blob storage as '{blob_name}'.")

        return create_response({
            "success": True,
            "message": "File uploaded successfully.",
            "file_id": blob_name,
            "original_filename": original_filename
        })

    except Exception as e:
        logging.error(f"Upload error: {e}")
        return create_error_response(f"An unexpected error occurred during upload: {e}", 500)


def process_and_upload(file_id: str, source_container: str, dest_container: str, processing_function, file_extension: str):
    """Generic function to download, process, and re-upload a file."""
    source_blob_client = blob_service_client.get_blob_client(container=source_container, blob=file_id)
    if not source_blob_client.exists():
        raise FileNotFoundError(f"File with ID '{file_id}' not found in storage.")
    
    file_bytes = source_blob_client.download_blob().readall()
    temp_dir = "/tmp"
    os.makedirs(temp_dir, exist_ok=True)
    temp_input_path = os.path.join(temp_dir, file_id)
    
    with open(temp_input_path, "wb") as f:
        f.write(file_bytes)

    processed_blob_name = f"{os.path.splitext(file_id)[0]}_processed.csv"
    temp_output_path = os.path.join(temp_dir, processed_blob_name)
    
    processing_function(temp_input_path, temp_output_path)

    dest_blob_client = blob_service_client.get_blob_client(container=dest_container, blob=processed_blob_name)
    with open(temp_output_path, "rb") as data:
        dest_blob_client.upload_blob(data, overwrite=True)
    
    logging.info(f"Processed file '{processed_blob_name}' uploaded to container '{dest_container}'.")

    os.remove(temp_input_path)
    os.remove(temp_output_path)

    return processed_blob_name


@app.route(route="process/image-to-csv", methods=["POST", "OPTIONS"])
def process_image_to_csv(req: func.HttpRequest) -> func.HttpResponse:
    """Processes an image from blob storage."""
    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=204, headers=CORS_HEADERS)
    
    logging.info("Image to CSV processing triggered.")
    try:
        req_body = req.get_json()
        file_id = req_body.get('file_id')
        if not file_id:
            return create_error_response("'file_id' is required in the request body.", 400)

        output_filename = process_and_upload(file_id, UPLOADS_CONTAINER, OUTPUTS_CONTAINER, image_to_csv_pipeline, ".jpg")

        return create_response({
            "success": True,
            "message": "Image processed successfully.",
            "file_id": file_id,
            "output_filename": output_filename,
            "download_url": f"/api/download/{output_filename}"
        })
    except FileNotFoundError as e:
        return create_error_response(str(e), 404)
    except Exception as e:
        return create_error_response(f"An unexpected error occurred: {e}", 500)


@app.route(route="process/pdf-to-csv", methods=["POST", "OPTIONS"])
def process_pdf_to_csv(req: func.HttpRequest) -> func.HttpResponse:
    """Processes a PDF from blob storage."""
    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=204, headers=CORS_HEADERS)

    logging.info("PDF to CSV processing triggered.")
    try:
        req_body = req.get_json()
        file_id = req_body.get('file_id')
        if not file_id:
            return create_error_response("'file_id' is required in the request body.", 400)
            
        output_filename = process_and_upload(file_id, UPLOADS_CONTAINER, OUTPUTS_CONTAINER, pdf_to_csv, ".pdf")

        return create_response({
            "success": True,
            "message": "PDF processed successfully.",
            "file_id": file_id,
            "output_filename": output_filename,
            "download_url": f"/api/download/{output_filename}"
        })
    except FileNotFoundError as e:
        return create_error_response(str(e), 404)
    except Exception as e:
        return create_error_response(f"An unexpected error occurred: {e}", 500)


@app.route(route="process/merge-csv", methods=["POST", "OPTIONS"])
def process_merge_csv(req: func.HttpRequest) -> func.HttpResponse:
    """Handles merging two CSV files."""
    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=204, headers=CORS_HEADERS)
    
    logging.info("CSV Merge processing triggered.")
    temp_dir = f"/tmp/{uuid.uuid4()}" # Ek unique temporary directory
    try:
        base_file = req.files.get('base_file')
        new_file = req.files.get('new_file')

        if not base_file or not new_file:
            return create_error_response("Please provide both 'base_file' and 'new_file'.", 400)

        # Temporary directories banayein
        temp_data_dir = os.path.join(temp_dir, "data")
        temp_output_dir = os.path.join(temp_dir, "output")
        os.makedirs(temp_data_dir, exist_ok=True)
        os.makedirs(temp_output_dir, exist_ok=True)

        # Temporary files save karein
        temp_base_path = os.path.join(temp_data_dir, base_file.filename)
        temp_new_path = os.path.join(temp_output_dir, new_file.filename)
        
        with open(temp_base_path, "wb") as f: f.write(base_file.read())
        with open(temp_new_path, "wb") as f: f.write(new_file.read())

        # CSVMatcher logic ko call karein
        matcher = CSVMatcher(data_dir=temp_data_dir, output_dir=temp_output_dir)
        merged_files = matcher.match_input_csv(temp_new_path)

        if not merged_files:
            return create_response({"success": False, "message": "No matching rows found to merge."})
        
        # Pehli merged file ko Blob Storage par upload karein
        merged_file_path = merged_files[0]
        merged_blob_name = f"merged_{uuid.uuid4()}.csv"
        
        dest_blob_client = blob_service_client.get_blob_client(container=OUTPUTS_CONTAINER, blob=merged_blob_name)
        with open(merged_file_path, "rb") as data:
            dest_blob_client.upload_blob(data, overwrite=True)
        
        return create_response({
            "success": True,
            "message": "Files merged successfully.",
            "output_filename": merged_blob_name,
            "download_url": f"/api/download/{merged_blob_name}"
        })

    except Exception as e:
        logging.error(f"Merge CSV error: {e}")
        return create_error_response(f"An unexpected error occurred during merge: {e}", 500)
    finally:
        # Hamesha temporary directory ko delete karein
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)


@app.route(route="download/{filename}", methods=["GET"])
def download_file(req: func.HttpRequest) -> func.HttpResponse:
    """Downloads a processed file from Azure Blob Storage."""
    logging.info("Download endpoint triggered.")
    try:
        filename = req.route_params.get('filename')
        if not filename:
            return create_error_response("Filename is required.", 400)

        blob_client = blob_service_client.get_blob_client(container=OUTPUTS_CONTAINER, blob=filename)
        if not blob_client.exists():
            return create_error_response("File not found.", 404)

        file_bytes = blob_client.download_blob().readall()

        return func.HttpResponse(
            body=file_bytes,
            status_code=200,
            headers={
                "Content-Type": "text/csv",
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    except Exception as e:
        logging.error(f"Download error: {e}")
        return create_error_response(f"An unexpected error occurred during download: {e}", 500)