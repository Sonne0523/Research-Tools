import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.services.ocr_service import ocr_pdf, create_searchable_pdf

def test_ocr():
    # Read the test PDF file
    pdf_path = "20th-Oct-2022-Evening-45-72.pdf"
    
    if not os.path.exists(pdf_path):
        print(f"Error: File {pdf_path} not found")
        return False
    
    try:
        # Read PDF bytes
        with open(pdf_path, 'rb') as f:
            pdf_bytes = f.read()
        
        print(f"Testing OCR on {pdf_path}...")
        print(f"File size: {len(pdf_bytes)} bytes")
        
        # Test text extraction
        print("\n--- Testing text extraction ---")
        extracted_text = ocr_pdf(pdf_bytes)
        print(f"Extracted text length: {len(extracted_text)} characters")
        print("First 500 characters:")
        print(extracted_text[:500])
        
        # Test searchable PDF creation
        print("\n--- Testing searchable PDF creation ---")
        searchable_pdf_bytes = create_searchable_pdf(pdf_bytes)
        print(f"Searchable PDF size: {len(searchable_pdf_bytes)} bytes")
        
        # Save the searchable PDF for verification
        output_path = "output_searchable.pdf"
        with open(output_path, 'wb') as f:
            f.write(searchable_pdf_bytes)
        print(f"Searchable PDF saved as: {output_path}")
        
        print("\nOCR test completed successfully!")
        return True
        
    except Exception as e:
        print(f"Error during OCR processing: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_ocr()
    sys.exit(0 if success else 1)