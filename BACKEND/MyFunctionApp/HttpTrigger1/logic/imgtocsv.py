# !pip install python-dotenv
import os
import logging
import base64
import requests
from dotenv import load_dotenv
from PIL import Image
import io

def initialize_gemini_model():
    """Initialize the Gemini API key from environment variables"""
    try:
        load_dotenv()
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            logging.warning(" GEMINI_API_KEY not found in environment variables")
            raise ValueError("GEMINI_API_KEY environment variable is required")
        return api_key
    except Exception as e:
        logging.error(f" Failed to initialize Gemini API key: {str(e)}")
        raise

def load_image_data(image_path):
    """Load image data from file path and encode as base64"""
    if not os.path.exists(image_path):
        logging.error(f" Image file not found at {image_path}")
        raise FileNotFoundError(f"Image file not found at {image_path}")
    
    try:
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    except Exception as e:
        logging.error(f" Failed to read image file: {str(e)}")
        raise

def generate_csv_from_image(api_key, image_data, prompt=None):
    """Generate CSV data from image using Gemini REST API"""
    default_prompt = "Convert this image table to CSV format. Only output the raw CSV data without any markdown formatting or additional text."
    
    url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    payload = {
        "contents": [{
            "parts": [
                {"text": prompt or default_prompt},
                {
                    "inline_data": {
                        "mime_type": "image/jpeg",
                        "data": image_data
                    }
                }
            ]
        }]
    }
    
    try:
        response = requests.post(url, json=payload, timeout=60)
        response.raise_for_status()
        result = response.json()
        
        if 'candidates' in result and len(result['candidates']) > 0:
            text = result['candidates'][0]['content']['parts'][0]['text']
            return validate_and_clean_response(text)
        else:
            raise ValueError("No response generated from Gemini API")
    except requests.exceptions.RequestException as e:
        logging.error(f" Gemini API Request Error: {str(e)}")
        raise RuntimeError(f"Failed to process image: {str(e)}") from e
    except Exception as e:
        logging.error(f" Gemini API Error: {str(e)}")
        raise RuntimeError(f"Failed to process image: {str(e)}") from e

def validate_and_clean_response(raw_response):
    """Validate and clean the API response"""
    if not raw_response:
        logging.error(" Empty response from API")
        raise ValueError("Empty response from API")
    
    cleaned = raw_response.replace("```csv", "").replace("```", "").strip()
    logging.info(f" Successfully processed response ({len(cleaned)} chars)")
    return cleaned

def save_output(data, output_path):
    """Save CSV data to output file"""
    if not data:
        logging.error(" No data to save")
        raise ValueError("No data to save")
    
    try:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, "w") as file:
            file.write(data)
        logging.info(f" Saved output to {output_path}")
        return output_path
    except Exception as e:
        logging.error(f" Failed to save output: {str(e)}")
        raise

def image_to_csv_pipeline(image_path, output_path="output.csv"):
    """Main pipeline to convert image to CSV"""
    logging.info(f" Starting image to CSV conversion: {image_path} -> {output_path}")
    try:
        api_key = initialize_gemini_model()
        image_data = load_image_data(image_path)
        csv_data = generate_csv_from_image(api_key, image_data)
        return save_output(csv_data, output_path)
    except Exception as e:
        logging.error(f" Pipeline failed: {str(e)}")
        raise

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    try:
        result_path = image_to_csv_pipeline(
            image_path="test_image.jpg",
            output_path="output/test_output.csv"
        )
        print(f"Successfully generated CSV at: {result_path}")
    except Exception as e:
        print(f"Processing failed: {str(e)}")