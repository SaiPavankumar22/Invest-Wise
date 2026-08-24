"""
Document Service — File upload handling, OCR, and AI-powered document analysis.
"""

import io
import logging
import os

import fitz  # PyMuPDF
import pytesseract
from PIL import Image

from services.llm_service import analyze_document

logger = logging.getLogger(__name__)


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from a PDF file using OCR (up to 5 pages)."""
    text_parts: list[str] = []
    try:
        doc = fitz.open(pdf_path)
        pages_to_process = min(5, len(doc))
        for page_num in range(pages_to_process):
            page = doc.load_page(page_num)
            pix = page.get_pixmap()
            img = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
            text_parts.append(pytesseract.image_to_string(img))
    except Exception as e:
        logger.error("PDF Processing Error: %s", e)
        raise
    return "\n".join(text_parts)


def extract_text_from_image(image_path: str) -> str:
    """Extract text from an image file using OCR."""
    try:
        img = Image.open(image_path).convert("RGB")
        return pytesseract.image_to_string(img)
    except Exception as e:
        logger.error("Image Processing Error: %s", e)
        raise


def process_uploaded_file(file_path: str, filename: str) -> str:
    """
    Process an uploaded file: extract text via OCR then analyse with the LLM.

    Returns the analysis text produced by the LLM.

    Raises ``ValueError`` for unsupported file types or empty extractions.
    """
    text = ""

    if filename.lower().endswith(".pdf"):
        text = extract_text_from_pdf(file_path)
    elif filename.lower().endswith((".png", ".jpg", ".jpeg")):
        text = extract_text_from_image(file_path)
    else:
        raise ValueError("Unsupported file type. Please upload a PDF or image.")

    if not text.strip():
        raise ValueError("No readable text found in the file.")

    return analyze_document(text)
