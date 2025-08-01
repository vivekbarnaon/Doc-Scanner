import os
import pandas as pd
from gmft.pdf_bindings import PyPDFium2Document
from gmft import TableDetector, AutoTableFormatter, AutoFormatConfig

# Detector ko ek baar hi initialize karna behtar hai
detector = TableDetector()

def pdf_to_csv(source_path, output_path):
    """
    Extracts all tables from a PDF, combines them, and saves to a single CSV file.
    
    Args:
        source_path: Path to the source PDF file.
        output_path: Path where the final single CSV file will be saved.
    """
    print(f"Processing PDF: {source_path}")
    
    try:
        doc = PyPDFium2Document(source_path)
        
        all_tables = []
        for page in doc:
            # detector.extract() ek list return karta hai, isliye += ka istemaal karein
            all_tables += detector.extract(page)

        # Confidence score ke hisaab se tables filter karein
        filtered_tables = [item for item in all_tables if item.confidence_score < 1]

        if not filtered_tables:
            print("No tables found in the PDF.")
            # Ek khaali CSV file bana dein taaki error na aaye
            pd.DataFrame().to_csv(output_path, index=False)
            return

        list_of_dfs = []
        formatter = AutoTableFormatter()
        formatter.config = AutoFormatConfig()

        print(f"Found {len(filtered_tables)} tables. Combining them into one CSV.")
        for table in filtered_tables:
            formatted_table = formatter.extract(table)
            df = formatted_table.df().fillna("")
            list_of_dfs.append(df)
        
        # Saare DataFrames ko ek mein jodein
        if list_of_dfs:
            combined_df = pd.concat(list_of_dfs, ignore_index=True)
            # Final combined CSV ko save karein
            combined_df.to_csv(output_path, index=False)
            print(f"Successfully saved combined CSV to: {output_path}")
        else:
            # Agar koi valid table nahi mili toh khaali CSV banayein
            print("No valid dataframes to combine.")
            pd.DataFrame().to_csv(output_path, index=False)

    except Exception as e:
        print(f"An error occurred during PDF processing: {e}")
        # Error ki sthiti mein bhi ek khaali CSV bana dein taaki process na ruke
        pd.DataFrame().to_csv(output_path, index=False)
        # Error ko dobara raise karein taaki main function use log kar sake
        raise e