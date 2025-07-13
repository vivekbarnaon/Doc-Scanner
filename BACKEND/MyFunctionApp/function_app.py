import azure.functions as func
import logging
import os
import json
import uuid
import tempfile
import shutil
from datetime import datetime
from pathlib import Path
from HttpTrigger1.logic.imgtocsv import image_to_csv_pipeline
from HttpTrigger1.logic.pdfcsv import pdf_to_csv
from HttpTrigger1.logic.mergecsv import CSVMatcher

app = func.FunctionApp()

# CORS headers for all responses
CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json"
}

def create_response(data, status_code=200, headers=None):
    """Create standardized JSON response with CORS headers"""
    response_headers = CORS_HEADERS.copy()
    if headers:
        response_headers.update(headers)

    return func.HttpResponse(
        json.dumps(data),
        status_code=status_code,
        headers=response_headers
    )

def create_error_response(message, status_code=400):
    """Create standardized error response"""
    return create_response({
        "error": True,
        "message": message,
        "timestamp": datetime.now().isoformat()
    }, status_code)

def ensure_directories():
    """Ensure upload and output directories exist"""
    base_dir = os.path.dirname(os.path.realpath(__file__))
    uploads_dir = os.path.join(base_dir, "uploads")
    outputs_dir = os.path.join(base_dir, "outputs")

    os.makedirs(uploads_dir, exist_ok=True)
    os.makedirs(outputs_dir, exist_ok=True)

    return uploads_dir, outputs_dir

@app.route(route="upload", auth_level=func.AuthLevel.FUNCTION, methods=["POST", "OPTIONS"])
def upload_file(req: func.HttpRequest) -> func.HttpResponse:
    """Handle file upload endpoint"""
    logging.info("File upload endpoint triggered")

    # Handle CORS preflight
    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=200, headers=CORS_HEADERS)

    try:
        # Ensure directories exist
        uploads_dir, outputs_dir = ensure_directories()

        # Get uploaded files
        files = req.files
        if not files:
            return create_error_response("No file uploaded", 400)

        # Get the first file
        file_key = list(files.keys())[0]
        uploaded_file = files[file_key]

        if not uploaded_file.filename:
            return create_error_response("Invalid file", 400)

        # Generate unique file ID and save file
        file_id = str(uuid.uuid4())
        file_extension = os.path.splitext(uploaded_file.filename)[1]
        saved_filename = f"{file_id}{file_extension}"
        file_path = os.path.join(uploads_dir, saved_filename)

        # Save uploaded file
        with open(file_path, 'wb') as f:
            f.write(uploaded_file.read())

        logging.info(f"File uploaded successfully: {saved_filename}")

        return create_response({
            "success": True,
            "file_id": file_id,
            "filename": uploaded_file.filename,
            "saved_as": saved_filename,
            "message": "File uploaded successfully"
        })

    except Exception as e:
        logging.error(f"Upload error: {str(e)}")
        return create_error_response(f"Upload failed: {str(e)}", 500)

@app.route(route="process/image-to-csv", auth_level=func.AuthLevel.FUNCTION, methods=["POST", "OPTIONS"])
def process_image_to_csv(req: func.HttpRequest) -> func.HttpResponse:
    """Process image to CSV"""
    logging.info("Image to CSV processing triggered")

    # Handle CORS preflight
    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=200, headers=CORS_HEADERS)

    try:
        # Get file_id from request
        req_body = req.get_json()
        if not req_body or 'file_id' not in req_body:
            return create_error_response("file_id is required", 400)

        file_id = req_body['file_id']
        uploads_dir, outputs_dir = ensure_directories()

        # Find uploaded file
        uploaded_file = None
        for filename in os.listdir(uploads_dir):
            if filename.startswith(file_id):
                uploaded_file = os.path.join(uploads_dir, filename)
                break

        if not uploaded_file or not os.path.exists(uploaded_file):
            return create_error_response("File not found", 404)

        # Process image to CSV
        output_filename = f"{file_id}_processed.csv"
        output_path = os.path.join(outputs_dir, output_filename)

        # Call the image processing function
        result = image_to_csv_pipeline(uploaded_file, output_path)

        if not os.path.exists(output_path):
            return create_error_response("Processing failed - no output generated", 500)

        # Read CSV content for preview
        with open(output_path, 'r', encoding='utf-8') as f:
            csv_content = f.read()



        return create_response({
            "success": True,
            "file_id": file_id,
            "type": "image-to-csv",
            "output_filename": output_filename,
            "csv_content": csv_content,
            "download_url": f"/api/download/{output_filename}",
            "message": "Image processed successfully"
        })

    except Exception as e:
        logging.error(f"Image processing error: {str(e)}")
        return create_error_response(f"Processing failed: {str(e)}", 500)

@app.route(route="process/pdf-to-csv", auth_level=func.AuthLevel.FUNCTION, methods=["POST", "OPTIONS"])
def process_pdf_to_csv(req: func.HttpRequest) -> func.HttpResponse:
    """Process PDF to CSV"""
    logging.info("PDF to CSV processing triggered")

    # Handle CORS preflight
    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=200, headers=CORS_HEADERS)

    try:
        # Get file_id from request
        req_body = req.get_json()
        if not req_body or 'file_id' not in req_body:
            return create_error_response("file_id is required", 400)

        file_id = req_body['file_id']
        uploads_dir, outputs_dir = ensure_directories()

        # Find uploaded file
        uploaded_file = None
        for filename in os.listdir(uploads_dir):
            if filename.startswith(file_id):
                uploaded_file = os.path.join(uploads_dir, filename)
                break

        if not uploaded_file or not os.path.exists(uploaded_file):
            return create_error_response("File not found", 404)

        # Process PDF to CSV
        output_filename = f"{file_id}_processed.csv"
        output_path = os.path.join(outputs_dir, output_filename)

        # Call the PDF processing function
        result = pdf_to_csv(uploaded_file, output_path)

        if not os.path.exists(output_path):
            return create_error_response("Processing failed - no output generated", 500)

        # Read CSV content for preview
        with open(output_path, 'r', encoding='utf-8') as f:
            csv_content = f.read()



        return create_response({
            "success": True,
            "file_id": file_id,
            "type": "pdf-to-csv",
            "output_filename": output_filename,
            "csv_content": csv_content,
            "download_url": f"/api/download/{output_filename}",
            "message": "PDF processed successfully"
        })

    except Exception as e:
        logging.error(f"PDF processing error: {str(e)}")
        return create_error_response(f"Processing failed: {str(e)}", 500)

@app.route(route="download/{filename}", auth_level=func.AuthLevel.FUNCTION, methods=["GET", "OPTIONS"])
def download_file(req: func.HttpRequest) -> func.HttpResponse:
    """Download processed CSV file"""
    logging.info("Download endpoint triggered")

    # Handle CORS preflight
    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=200, headers=CORS_HEADERS)

    try:
        filename = req.route_params.get('filename')
        if not filename:
            return create_error_response("Filename is required", 400)

        uploads_dir, outputs_dir = ensure_directories()
        file_path = os.path.join(outputs_dir, filename)

        if not os.path.exists(file_path):
            return create_error_response("File not found", 404)

        # Read file content
        with open(file_path, 'rb') as f:
            file_content = f.read()

        # Return file with proper headers
        download_headers = CORS_HEADERS.copy()
        download_headers.update({
            "Content-Type": "text/csv",
            "Content-Disposition": f"attachment; filename={filename}",
            "Content-Length": str(len(file_content))
        })

        return func.HttpResponse(
            file_content,
            status_code=200,
            headers=download_headers
        )

    except Exception as e:
        logging.error(f"Download error: {str(e)}")
        return create_error_response(f"Download failed: {str(e)}", 500)



@app.route(route="processData", auth_level=func.AuthLevel.FUNCTION)
def process_data(req: func.HttpRequest) -> func.HttpResponse:
    logging.info(" Azure Function Triggered")

    # Handle CORS preflight requests
    if req.method == "OPTIONS":
        return func.HttpResponse(
            status_code=200,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        )

    # Create data directory for file operations if needed
    base_dir = os.path.dirname(os.path.realpath(__file__))
    data_dir = os.path.join(base_dir, "data")
    output_dir = os.path.join(base_dir, "output")
    os.makedirs(data_dir, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)

    # Log directories for debugging
    logging.info(f" Base directory: {base_dir}")
    logging.info(f" Data directory: {data_dir}")
    logging.info(f" Output directory: {output_dir}")

    # Get action from query parameters or request body
    action = req.params.get('action')
    if not action:
        try:
            req_body = req.get_json()
            action = req_body.get('action')
        except ValueError:
            pass

    if not action:
        logging.warning(" Missing 'action' parameter")
        return func.HttpResponse(
            json.dumps({"error": "Missing 'action' parameter"}),
            status_code=400,
            mimetype="application/json",
            headers={"Access-Control-Allow-Origin": "*"}
        )

    try:
        if action == 'imgtocsv':
            return handle_imgtocsv(req, output_dir)
        elif action == 'pdfcsv':
            return handle_pdfcsv(req, output_dir)
        elif action == 'mergecsv':
            return handle_mergecsv(req, data_dir, output_dir)
        else:
            logging.warning(f" Invalid action parameter: {action}")
            return func.HttpResponse(
                json.dumps({"error": "Invalid action parameter"}),
                status_code=400,
                mimetype="application/json",
                headers={"Access-Control-Allow-Origin": "*"}
            )

    except Exception as e:
        logging.error(f" Exception occurred: {e}")
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            mimetype="application/json",
            headers={"Access-Control-Allow-Origin": "*"}
        )

def handle_imgtocsv(req: func.HttpRequest, output_dir: str) -> func.HttpResponse:
    """Handle image to CSV conversion"""
    # Check if there's a file in the request
    image_file = req.files.get('file')
    output_file = req.params.get('output_file', f'img_output_{os.urandom(4).hex()}.csv')

    # If no file, try to get image_path from params or body
    if not image_file:
        image_path = req.params.get('image_path')

        if not image_path:
            try:
                req_body = req.get_json()
                image_path = req_body.get('image_path')
                output_file = req_body.get('output_file', output_file)
            except ValueError:
                pass

        if not image_path:
            logging.warning(" Missing image file or 'image_path' parameter")
            return func.HttpResponse(
                json.dumps({"error": "Please provide an image file or 'image_path' parameter"}),
                status_code=400,
                mimetype="application/json",
                headers={"Access-Control-Allow-Origin": "*"}
            )

        # Process using the provided path
        temp_image_path = image_path
    else:
        # Save the uploaded file to a temporary location
        temp_image_path = os.path.join(output_dir, f"temp_image_{os.urandom(4).hex()}.jpg")
        with open(temp_image_path, 'wb') as f:
            f.write(image_file.read())
        logging.info(f" Saved uploaded image to {temp_image_path}")

    # Determine output path
    output_path = os.path.join(output_dir, output_file)

    # Process the image
    try:
        output_csv = image_to_csv_pipeline(image_path=temp_image_path, output_path=output_path)
        logging.info(f" Image converted to CSV at: {output_csv}")

        # Return the CSV content
        with open(output_csv, 'r') as f:
            csv_content = f.read()

        # Clean up temporary file if it was uploaded
        if image_file and os.path.exists(temp_image_path):
            os.remove(temp_image_path)

        return func.HttpResponse(
            csv_content,
            mimetype="text/csv",
            headers={
                "Access-Control-Allow-Origin": "*",
                "Content-Disposition": f"attachment; filename={os.path.basename(output_csv)}"
            }
        )
    except FileNotFoundError:
        logging.error(f" Image file not found: {temp_image_path}")
        return func.HttpResponse(
            json.dumps({"error": f"Image file not found"}),
            status_code=404,
            mimetype="application/json",
            headers={"Access-Control-Allow-Origin": "*"}
        )
    except Exception as e:
        logging.error(f" Error processing image: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": f"Error processing image: {str(e)}"}),
            status_code=500,
            mimetype="application/json",
            headers={"Access-Control-Allow-Origin": "*"}
        )
    finally:
        # Clean up temporary file if it was uploaded
        if image_file and os.path.exists(temp_image_path):
            try:
                os.remove(temp_image_path)
            except:
                pass

def handle_pdfcsv(req: func.HttpRequest, output_dir: str) -> func.HttpResponse:
    """Handle PDF to CSV conversion"""
    # Check if there's a file in the request
    pdf_file = req.files.get('file')

    # If no file, try to get pdf_path from params or body
    if not pdf_file:
        pdf_path = req.params.get('pdf_path')

        if not pdf_path:
            try:
                req_body = req.get_json()
                pdf_path = req_body.get('pdf_path')
            except ValueError:
                pass

        if not pdf_path:
            logging.warning(" Missing PDF file or 'pdf_path' parameter")
            return func.HttpResponse(
                json.dumps({"error": "Please provide a PDF file or 'pdf_path' parameter"}),
                status_code=400,
                mimetype="application/json",
                headers={"Access-Control-Allow-Origin": "*"}
            )

        # Process using the provided path
        temp_pdf_path = pdf_path
    else:
        # Save the uploaded file to a temporary location
        temp_pdf_path = os.path.join(output_dir, f"temp_pdf_{os.urandom(4).hex()}.pdf")
        with open(temp_pdf_path, 'wb') as f:
            f.write(pdf_file.read())
        logging.info(f" Saved uploaded PDF to {temp_pdf_path}")

    # Process the PDF
    try:
        output_paths = pdf_to_csv(temp_pdf_path, output_dir=output_dir)
        logging.info(f" PDF processed successfully. Generated {len(output_paths)} CSV files")

        # If there are multiple CSV files, we'll return the first one for simplicity
        if output_paths and len(output_paths) > 0:
            with open(output_paths[0], 'r') as f:
                csv_content = f.read()

            # Clean up temporary file if it was uploaded
            if pdf_file and os.path.exists(temp_pdf_path):
                os.remove(temp_pdf_path)

            return func.HttpResponse(
                csv_content,
                mimetype="text/csv",
                headers={
                    "Access-Control-Allow-Origin": "*",
                    "Content-Disposition": f"attachment; filename={os.path.basename(output_paths[0])}"
                }
            )
        else:
            return func.HttpResponse(
                json.dumps({"error": "No CSV files were generated from the PDF"}),
                status_code=500,
                mimetype="application/json",
                headers={"Access-Control-Allow-Origin": "*"}
            )
    except FileNotFoundError:
        logging.error(f" PDF file not found: {temp_pdf_path}")
        return func.HttpResponse(
            json.dumps({"error": "PDF file not found"}),
            status_code=404,
            mimetype="application/json",
            headers={"Access-Control-Allow-Origin": "*"}
        )
    except Exception as e:
        logging.error(f" Error processing PDF: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": f"Error processing PDF: {str(e)}"}),
            status_code=500,
            mimetype="application/json",
            headers={"Access-Control-Allow-Origin": "*"}
        )
    finally:
        # Clean up temporary file if it was uploaded
        if pdf_file and os.path.exists(temp_pdf_path):
            try:
                os.remove(temp_pdf_path)
            except:
                pass

def handle_mergecsv(req: func.HttpRequest, data_dir: str, output_dir: str) -> func.HttpResponse:
    """Handle CSV matching and merging"""
    # Check if there are files in the request
    base_file = req.files.get('base_file')
    new_file = req.files.get('new_file')

    # If no files, try to get input_path from params or body
    if not base_file or not new_file:
        input_path = req.params.get('input_path')

        if not input_path:
            try:
                req_body = req.get_json()
                input_path = req_body.get('input_path')
            except ValueError:
                pass

        if not input_path:
            logging.warning(" Missing CSV files or 'input_path' parameter")
            return func.HttpResponse(
                json.dumps({"error": "Please provide CSV files or 'input_path' parameter"}),
                status_code=400,
                mimetype="application/json",
                headers={"Access-Control-Allow-Origin": "*"}
            )

        # Process using the provided path
        temp_input_path = input_path
        temp_files_created = []
    else:
        # Save the uploaded files to temporary locations
        temp_base_path = os.path.join(data_dir, f"base_{os.urandom(4).hex()}.csv")
        temp_new_path = os.path.join(output_dir, f"new_{os.urandom(4).hex()}.csv")

        with open(temp_base_path, 'wb') as f:
            f.write(base_file.read())
        logging.info(f" Saved uploaded base CSV to {temp_base_path}")

        with open(temp_new_path, 'wb') as f:
            f.write(new_file.read())
        logging.info(f" Saved uploaded new CSV to {temp_new_path}")

        temp_input_path = temp_new_path
        temp_files_created = [temp_base_path, temp_new_path]

    # Process the CSV
    try:
        matcher = CSVMatcher(data_dir=data_dir, output_dir=output_dir)
        merged_files = matcher.match_input_csv(temp_input_path)

        if merged_files and len(merged_files) > 0:
            logging.info(f" CSV matched and merged. Generated {len(merged_files)} merged files")

            # Return the merged CSV file
            with open(merged_files[0], 'r') as f:
                csv_content = f.read()

            # Clean up temporary files
            for temp_file in temp_files_created:
                if os.path.exists(temp_file):
                    os.remove(temp_file)

            return func.HttpResponse(
                csv_content,
                mimetype="text/csv",
                headers={
                    "Access-Control-Allow-Origin": "*",
                    "Content-Disposition": f"attachment; filename={os.path.basename(merged_files[0])}"
                }
            )
        else:
            logging.info(" CSV analyzed but no matches found to merge")
            return func.HttpResponse(
                json.dumps({"result": "success", "message": "CSV analyzed but no matches found"}),
                mimetype="application/json",
                headers={"Access-Control-Allow-Origin": "*"}
            )
    except FileNotFoundError as e:
        logging.error(f" CSV file not found: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": "CSV file not found"}),
            status_code=404,
            mimetype="application/json",
            headers={"Access-Control-Allow-Origin": "*"}
        )
    except Exception as e:
        logging.error(f" Error processing CSV: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": f"Error processing CSV: {str(e)}"}),
            status_code=500,
            mimetype="application/json",
            headers={"Access-Control-Allow-Origin": "*"}
        )
    finally:
        # Clean up temporary files
        for temp_file in temp_files_created:
            if os.path.exists(temp_file):
                try:
                    os.remove(temp_file)
                except:
                    pass