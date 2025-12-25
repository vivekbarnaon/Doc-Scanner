import os
import pandas as pd
import gmft
import gmft.pdf_bindings
from gmft.pdf_bindings import PyPDFium2Document
from gmft import TableDetector, AutoTableFormatter, AutoFormatConfig
import base64
import requests
import fitz  # PyMuPDF
from PIL import Image
import io
from dotenv import load_dotenv

load_dotenv()

def pdf_to_csv(source_path, output_path):
    """
    Extract all tables from PDF using GMFT and combine them into a single CSV file.
    
    Args:
        source_path: Path to the source PDF file
        output_path: Path where the final combined CSV file will be saved
    """
    print(f"Processing PDF with GMFT: {source_path}")
    
    try:
        # Initialize table detector
        detector = TableDetector()
        
        # Open PDF document
        doc = PyPDFium2Document(source_path)
        
        # Extract tables from all pages
        all_tables = []
        for page_num, page in enumerate(doc):
            print(f" Extracting tables from page {page_num + 1}...")
            page_tables = detector.extract(page)
            all_tables.extend(page_tables)
        
        print(f"Found {len(all_tables)} potential tables in PDF")
        
        if not all_tables:
            print("No tables detected by GMFT. Trying Gemini AI OCR fallback...")
            return pdf_to_csv_with_gemini(source_path, output_path)
        
        # Log confidence scores for debugging
        for i, table in enumerate(all_tables):
            print(f" Table {i + 1} confidence score: {table.confidence_score:.4f}")
        
        # Log confidence scores for debugging
        for i, table in enumerate(all_tables):
            print(f" Table {i + 1} confidence score: {table.confidence_score:.4f}")
        
        # Format and extract dataframes from all detected tables
        all_dfs = []
        formatter = AutoTableFormatter()
        formatter.config = AutoFormatConfig()
        
        for i, table in enumerate(all_tables):
            print(f" Formatting table {i + 1}/{len(all_tables)}...")
            formatted_table = formatter.extract(table)
            df = formatted_table.df().fillna("")
            
            if not df.empty:
                all_dfs.append(df)
                print(f"   Table {i + 1}: {len(df)} rows, {len(df.columns)} columns")
        
        # Combine all dataframes
        if all_dfs:
            combined_df = pd.concat(all_dfs, ignore_index=True)
            combined_df.to_csv(output_path, index=False)
            print(f"Successfully saved combined CSV with {len(combined_df)} rows to: {output_path}")
        else:
            print("No valid dataframes extracted from tables")
            pd.DataFrame().to_csv(output_path, index=False)
    
    except Exception as e:
        print(f"Error during PDF processing: {e}")
        # Try Gemini AI fallback
        try:
            print("Attempting Gemini AI fallback...")
            return pdf_to_csv_with_gemini(source_path, output_path)
        except Exception as fallback_error:
            print(f"Gemini fallback also failed: {fallback_error}")
            # Create empty CSV on error
            pd.DataFrame().to_csv(output_path, index=False)
            raise e


def pdf_to_csv_with_gemini(source_path, output_path):
    """
    Fallback method: Convert PDF to images and use Gemini AI for OCR-based table extraction.
    Used when GMFT fails to detect tables (e.g., image-based/scanned PDFs).
    """
    print(f"Converting PDF to images for Gemini AI processing: {source_path}")
    
    # Open PDF with PyMuPDF
    doc = fitz.open(source_path)
    num_pages = len(doc)
    print(f"Converting PDF ({num_pages} pages) to images...")
    
    all_rows = []
    
    for page_num in range(num_pages):
        print(f" Processing page {page_num + 1}/{num_pages}...")
        page = doc[page_num]
        
        # Render page to image (300 DPI for better quality)
        pix = page.get_pixmap(matrix=fitz.Matrix(300/72, 300/72))
        img_data = pix.tobytes("png")
        
        # Convert to PIL Image
        img = Image.open(io.BytesIO(img_data))
        
        # Convert image to base64
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        # Call Gemini API
        api_key = os.getenv("GEMINI_API_KEY")
        url = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key={api_key}"
        
        prompt = """Extract ALL data from this image as a CSV table. 
Rules:
1. Identify ALL rows and columns
2. Preserve exact text content
3. Return ONLY raw CSV data (no markdown, no explanations, no code blocks)
4. Use comma as delimiter
5. Include headers if visible
6. Empty cells should be represented as empty strings between commas"""
        
        payload = {
            "contents": [{
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": "image/png",
                            "data": img_base64
                        }
                    }
                ]
            }]
        }
        
        headers = {"Content-Type": "application/json"}
        response = requests.post(url, json=payload, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            csv_text = result['candidates'][0]['content']['parts'][0]['text'].strip()
            
            # Clean CSV text (remove markdown code blocks if present)
            csv_text = csv_text.replace('```csv', '').replace('```', '').strip()
            
            # Parse CSV text into rows
            from io import StringIO
            import csv
            csv_reader = csv.reader(StringIO(csv_text))
            page_rows = list(csv_reader)
            all_rows.extend(page_rows)
            
            print(f"   Extracted {len(page_rows)} rows from page {page_num + 1}")
        else:
            print(f"   Gemini API error for page {page_num + 1}: {response.status_code} - {response.text}")
    
    doc.close()
    
    # Save to CSV
    if all_rows:
        df = pd.DataFrame(all_rows)
        df.to_csv(output_path, index=False, header=False)
        print(f"Successfully saved Gemini-generated CSV with {len(df)} rows to: {output_path}")
    else:
        print("No data extracted from PDF using Gemini AI")
        pd.DataFrame().to_csv(output_path, index=False)