import sys
import os
import time
import fitz  # PyMuPDF
import pytesseract
from pdf2image import convert_from_path
from PIL import Image
from pypdf import PdfReader
from pdfminer.high_level import extract_text as pdfminer_extract_text
import pdfplumber

def benchmark_method(method_name, func, pdf_path):
    """Utility to benchmark an extraction method."""
    print(f"\n--- Testing Method: {method_name} ---")
    start_time = time.time()
    try:
        text = func(pdf_path)
        end_time = time.time()
        duration = end_time - start_time
        text_length = len(text) if text else 0
        print(f"Time taken: {duration:.4f} seconds")
        print(f"Text length: {text_length} characters")
        return {
            "name": method_name,
            "duration": duration,
            "length": text_length,
            "text": text
        }
    except Exception as e:
        print(f"Error in {method_name}: {e}")
        return None

def extract_pymupdf(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def extract_pypdf(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text

def extract_pdfminer(pdf_path):
    return pdfminer_extract_text(pdf_path)

def extract_pdfplumber(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text

def extract_ocr(pdf_path):
    try:
        images = convert_from_path(pdf_path)
        text = ""
        for i, image in enumerate(images):
            text += f"\n--- Page {i + 1} (OCR) ---\n"
            text += pytesseract.image_to_string(image)
        return text
    except Exception as e:
        print(f"OCR Error: {e}")
        return None

def evaluate_methods(pdf_path):
    if not os.path.exists(pdf_path):
        print(f"Error: {pdf_path} not found.")
        return

    results = []
    
    # 1. PyMuPDF (Very fast, low memory)
    res = benchmark_method("PyMuPDF", extract_pymupdf, pdf_path)
    if res: results.append(res)
    
    # 2. pypdf (Pure Python, extremely lightweight)
    res = benchmark_method("pypdf", extract_pypdf, pdf_path)
    if res: results.append(res)
    
    # 3. pdfminer.six (Detailed, but slower)
    res = benchmark_method("pdfminer.six", extract_pdfminer, pdf_path)
    if res: results.append(res)
    
    # 4. pdfplumber (Built on pdfminer, good for tables)
    res = benchmark_method("pdfplumber", extract_pdfplumber, pdf_path)
    if res: results.append(res)

    # 5. Global OCR Check (If all above fail or yield very little text)
    # Usually OCR is most intensive, so we only run it if needed OR for evaluation
    print("\n--- Testing Method: Tesseract OCR (INTENSIVE) ---")
    res = benchmark_method("OCR (Tesseract)", extract_ocr, pdf_path)
    if res: results.append(res)

    # Summary Table
    print("\n" + "="*60)
    print(f"{'Method':<20} | {'Time (s)':<10} | {'Length (char)':<15}")
    print("-" * 60)
    for r in results:
        print(f"{r['name']:<20} | {r['duration']:<10.4f} | {r['length']:<15}")
    print("="*60)

    # Suggestion for low-power systems
    fastest = min(results, key=lambda x: x['duration'])
    most_text = max(results, key=lambda x: x['length'])
    
    print(f"\nRecommendation for low-power systems:")
    print(f"- Fastest: {fastest['name']} ({fastest['duration']:.4f}s)")
    print(f"- Best extraction: {most_text['name']} ({most_text['length']} chars)")
    
    if fastest['name'] == "PyMuPDF":
        print("Tip: PyMuPDF is generally the best balance of speed and accuracy for simple systems.")

    # Save all results to a file for review
    with open("evaluation_results.txt", "w", encoding="utf-8") as f:
        for r in results:
            f.write(f"\n{'='*20} {r['name']} {'='*20}\n")
            f.write(r['text'] or "NO TEXT EXTRACTED")
            f.write("\n\n")

if __name__ == "__main__":
    pdf_to_process = "CVRES.pdf"
    if len(sys.argv) >= 2:
        pdf_to_process = sys.argv[1]
    
    evaluate_methods(pdf_to_process)
