import os
import pandas as pd
import pdfplumber

def pdf_to_csv(source_path, output_path):
    """
    Extracts all tables from a PDF, combines them, and saves to a single CSV file.
    
    Args:
        source_path: Path to the source PDF file.
        output_path: Path where the final single CSV file will be saved.
    """
    print(f"Processing PDF: {source_path}")
    
    try:
        all_tables = []
        
        with pdfplumber.open(source_path) as pdf:
            for page in pdf.pages:
                tables = page.extract_tables()
                if tables:
                    all_tables.extend(tables)

        if not all_tables:
            print("No tables found in the PDF.")
            # Ek khaali CSV file bana dein taaki error na aaye
            pd.DataFrame().to_csv(output_path, index=False)
            return

        list_of_dfs = []
        
        print(f"Found {len(all_tables)} tables. Combining them into one CSV.")
        for table in all_tables:
            if table and len(table) > 0:
                # Convert table to DataFrame
                df = pd.DataFrame(table[1:], columns=table[0])
                df = df.fillna("")
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