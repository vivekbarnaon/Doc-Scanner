from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from supabase import create_client, Client
import os
import uuid
import shutil
import logging
from typing import List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# --- Supabase Configuration ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "documents")

if not SUPABASE_URL or not SUPABASE_KEY:
    logging.error("Supabase credentials missing in .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- AAPKE LOGIC FUNCTIONS ---
try:
    from logic.imgtocsv import image_to_csv_pipeline
    from logic.pdfcsv import pdf_to_csv
    from logic.mergecsv import CSVMatcher
except ImportError:
    logging.error("Could not import logic functions. Check folder structure.")

app = FastAPI(title="Doc-Scanner API")

# --- Local Storage Configuration ---
STORAGE_DIR = os.path.join(os.path.dirname(__file__), "storage")
UPLOADS_DIR = os.path.join(STORAGE_DIR, "uploads")
OUTPUTS_DIR = os.path.join(STORAGE_DIR, "outputs")

# Ensure directories exist
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(OUTPUTS_DIR, exist_ok=True)

# --- CORS Configuration for Frontend ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Render pe deploy karne ke baad Specific URL daal sakte ho
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Doc-Scanner FastAPI is running with local storage!"}

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Handles file upload directly to Supabase Storage."""
    try:
        file_extension = os.path.splitext(file.filename)[1]
        file_id = f"{uuid.uuid4()}{file_extension}"
        
        # Read file content
        content = await file.read()
        
        # Upload to Supabase Storage
        # Ensure you have a bucket named 'documents' (or whatever is in SUPABASE_BUCKET)
        res = supabase.storage.from_(SUPABASE_BUCKET).upload(
            path=file_id,
            file=content,
            file_options={"content-type": file.content_type}
        )

        return {
            "success": True,
            "message": "File uploaded successfully to Supabase.",
            "file_id": file_id,
            "original_filename": file.filename
        }
    except Exception as e:
        logging.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/process/{file_id}")
async def process_file(file_id: str, action: str = "img"):
    """Processing endpoint using Supabase and temporary local processing."""
    # 1. Download from Supabase to local temp
    temp_input = os.path.join(UPLOADS_DIR, file_id)
    output_filename = f"{os.path.splitext(file_id)[0]}_processed.csv"
    temp_output = os.path.join(OUTPUTS_DIR, output_filename)

    try:
        # Download file content from Supabase
        with open(temp_input, "wb") as f:
            res = supabase.storage.from_(SUPABASE_BUCKET).download(file_id)
            f.write(res)

        # 2. Logic processing
        if action == "img":
            image_to_csv_pipeline(temp_input, temp_output)
        elif action == "pdf":
            pdf_to_csv(temp_input, temp_output)
        elif action == "merge":
            from logic.mergecsv import CSVMatcher
            # matcher point logic
            matcher = CSVMatcher(data_dir=UPLOADS_DIR, output_dir=OUTPUTS_DIR)
            # Find and process the specific file
            results = matcher.match_input_csv(temp_input)
            if results and len(results) > 0:
                # Use the first merged result as our output
                shutil.copy(results[0], temp_output)
            else:
                # If no merge possible, just use the original file
                shutil.copy(temp_input, temp_output)
            
        # 3. Upload result back to Supabase
        with open(temp_output, "rb") as f:
            supabase.storage.from_(SUPABASE_BUCKET).upload(
                path=f"outputs/{output_filename}",
                file=f,
                file_options={"content-type": "text/csv"}
            )
        
        return {
            "success": True, 
            "message": f"Processing ({action}) complete and stored in Supabase", 
            "output_file": f"outputs/{output_filename}"
        }
    except Exception as e:
        logging.error(f"Processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up temp files
        if os.path.exists(temp_input): os.remove(temp_input)
        if os.path.exists(temp_output): os.remove(temp_output)

@app.get("/api/download/{path:path}")
async def download_file(path: str):
    """Directly download the file from Supabase and serve it to the user."""
    try:
        # Download from Supabase
        res = supabase.storage.from_(SUPABASE_BUCKET).download(path)
        
        # Determine filename and media type
        filename = os.path.basename(path)
        media_type = "text/csv" if filename.endswith('.csv') else "application/octet-stream"
        
        # Return as a downloadable file response
        from fastapi.responses import Response
        return Response(
            content=res,
            media_type=media_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    except Exception as e:
        logging.error(f"Download error: {e}")
        raise HTTPException(status_code=404, detail="File not found in Supabase")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
