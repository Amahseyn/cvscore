# CVScore - Intelligent PDF Text Extraction

A high-performance PDF text extraction and OCR utility optimized for **low-power systems**. CVScore combines direct digital extraction with intelligent OCR fallback to ensure 100% coverage of your documents.

## 🚀 Features

- **Multi-Engine Extraction**: Supports PyMuPDF (Fastest), pypdf, pdfminer, and pdfplumber.
- **Intelligent OCR Fallback**: Automatically uses Tesseract OCR if digital text extraction fails.
- **FastAPI Backend**: Robust, scalable API for document processing.
- **Premium Next.js Interface**: Clean, modern, and interactive web UI for effortless uploads.
- **Optimized for Efficiency**: Default methods (PyMuPDF) are chosen for minimum resource consumption.

## 📁 Project Structure

```text
cvscore/
├── backend/            # FastAPI Application
│   ├── main.py         # API Gateway & Extraction Logic
│   └── requirements.txt
├── frontend/           # Next.js Application
│   ├── src/app/        # App Router components
│   └── package.json
└── demo/               # CLI & Development Tools
    └── cli_test.py     # Independent CLI Benchmarking tool
```

## 🛠️ Setup & Installation

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **Tesseract OCR**: `sudo apt install tesseract-ocr` (Linux)
- **Poppler Utils**: `sudo apt install poppler-utils` (for PDF-to-image conversion)

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
API will be live at `http://localhost:8000`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Web app will be live at `http://localhost:3000`

### 3. Demo CLI Tool
For quick testing without the web interface:
```bash
python demo/cli_test.py path/to/your/cv.pdf
```

## 📊 Performance Benchmarks (Typical Low-Power System)

| Method | Speed | Recommendation |
| :--- | :--- | :--- |
| **PyMuPDF** | ~30ms | **Primary Choice** - Best for CVs & Digital PDFs. |
| **OCR (Tesseract)** | ~10s | Use only for scanned/image-only PDFs. |

## ⚖️ License
MIT License. Created by Antigravity AI.
