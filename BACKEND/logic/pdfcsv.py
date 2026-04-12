import os
import pandas as pd
import pdfplumber
import google.generativeai as genai
import base64
import io
from PIL import Image
from pdf2image import convert_from_path
from dotenv import load_dotenv

def get_gemini_key():
    load_dotenv()
    return os.environ.get("GEMINI_API_KEY")

def pdf_to_csv(source_path, output_path):
    """
    Extracts tables from a PDF. If traditional extraction fails (e.g., scanned PDF),
    it uses Gemini AI to perform OCR on the first page.
    """
    print(f"Processing PDF: {source_path}")
    
    try:
        all_tables = []
        
        # 🟢 Method 1: Traditional Extraction (for digital PDFs)
        with pdfplumber.open(source_path) as pdf:
            for page in pdf.pages:
                tables = page.extract_tables()
                if tables:
                    all_tables.extend(tables)

        if all_tables:
            print(f"Found {len(all_tables)} tables via traditional method.")
            save_tables_to_csv(all_tables, output_path)
            return

        # 🔴 Method 2: AI OCR (for scanned PDFs)
        print("No traditional tables found. Using AI OCR fallback...")
        api_key = get_gemini_key()
        if not api_key:
            raise ValueError("GEMINI_API_KEY missing for fallback OCR")

        # Convert first page to image
        images = convert_from_path(source_path, first_page=1, last_page=1)
        if not images:
            raise ValueError("Could not convert PDF to image")

        # Prepare image for Gemini
        img_byte_arr = io.BytesIO()
        images[0].save(img_byte_arr, format='JPEG')
        img_data = base64.b64encode(img_byte_arr.getvalue()).decode('utf-8')

        # Call Gemini
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('models/gemini-flash-latest')
        prompt = "Extract all table data from this document image and format it as a pure CSV. Only output raw CSV data."
        
        response = model.generate_content([
            prompt,
            {'mime_type': 'image/jpeg', 'data': img_data}
        ])

        csv_text = response.text.replace('```csv', '').replace('```', '').strip()
        
        with open(output_path, "w", encoding='utf-8') as f:
            f.write(csv_text)
        
        print(f"Successfully saved AI-extracted CSV to: {output_path}")

    except Exception as e:
        print(f"Error in PDF processing: {str(e)}")
        pd.DataFrame().to_csv(output_path, index=False)

def save_tables_to_csv(tables, output_path):
    list_of_dfs = []
    for table in tables:
        if table and len(table) > 0:
            df = pd.DataFrame(table[1:], columns=table[0])
            df = df.fillna("")
            list_of_dfs.append(df)
    
    if list_of_dfs:
        combined_df = pd.concat(list_of_dfs, ignore_index=True)
        combined_df.to_csv(output_path, index=False)
        print(f"Successfully saved combined CSV context to: {output_path}")
    else:
        pd.DataFrame().to_csv(output_path, index=False)