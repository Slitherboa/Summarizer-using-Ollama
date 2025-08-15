# Long Document Summarizer & Q&A Tool

A mini project using Django (REST) + React (Vite) with a local LLaMA model (via Ollama) for summarization and Q&A over long documents.

## Project Structure
- `backend/` Django REST API
- `frontend/` React + Vite + Tailwind UI

## Prerequisites
- Python 3.10+
- Node.js 18+
- Ollama installed and running (see [Ollama](https://ollama.com))

## Setup
### Backend
1. Create virtualenv and install deps
```bash
cd backend
python -m venv .venv
. .venv/Scripts/activate  # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```
2. Pull a model and ensure Ollama is running
```bash
ollama pull llama3.1
```
3. Migrate and run
```bash
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### Frontend
1. Install deps and run dev
```bash
cd ../frontend
npm install
npm run dev
```
2. Open the URL shown (default `http://localhost:5173`). If your backend is not on localhost:8000, create `frontend/.env` and set `VITE_API_BASE` to your backend URL.

## Usage
- Upload a PDF or paste text. Click "Summarize".
- Ask follow-up questions in the Q&A box. The backend uses session to reference the last uploaded text.

## Environment
- Backend can use `LLAMA_MODEL` to select which model Ollama serves (default `smolLM2`).
- Frontend can override API base via `VITE_API_BASE`.
