import pdfplumber
import io

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts text from a PDF file using pdfplumber."""
    text = ""
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        return text
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return ""
