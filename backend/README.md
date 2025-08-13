# Long Document Summarizer & Q&A Tool - Backend (Django)

## Prerequisites
- Python 3.10+
- Ollama installed and running (for local LLaMA). See [Ollama](https://ollama.com).

## Setup
1. Create a virtual environment and install dependencies:
```bash
python -m venv .venv
. .venv/Scripts/activate  # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Start Ollama and pull a LLaMA model (first time only):
```bash
# Install and run Ollama app, then in a terminal:
ollama pull llama3.1
```
(Optional) choose a different model by setting env var `LLAMA_MODEL` (defaults to `llama3.1`).

3. Run migrations and start server:
```bash
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### API Endpoints
- POST `/api/upload` (multipart or JSON)
  - form-data: `file` (PDF) or JSON: `{ "text": "..." }`
  - response: `{ "summary": "..." }`
- POST `/api/ask` (JSON)
  - `{ "question": "..." }`
  - response: `{ "answer": "..." }`

### Notes
- Stores last uploaded text in session for Q&A.
- Uses `pdfplumber` with fallback to `PyPDF2`.
- Uses local LLaMA via Ollama (`ollama` Python client). Ensure the Ollama service is running.
