from typing import Optional


def extract_text_from_pdf(file_obj) -> str:
    """Extract text from a PDF file-like object using pdfplumber, fall back to PyPDF2."""
    text_parts = []
    try:
        import pdfplumber  # type: ignore
        with pdfplumber.open(file_obj) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text() or ''
                if page_text:
                    text_parts.append(page_text)
    except Exception:
        try:
            from PyPDF2 import PdfReader  # type: ignore
            file_obj.seek(0)
            reader = PdfReader(file_obj)
            for page in reader.pages:
                page_text = page.extract_text() or ''
                if page_text:
                    text_parts.append(page_text)
        except Exception:
            return ''
    return "\n\n".join(text_parts).strip()
