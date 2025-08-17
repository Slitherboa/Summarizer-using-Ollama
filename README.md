# Long Document Summarizer & Q&A Tool

A mini project using Django (REST) + React (Vite) with a local LLaMA model (via Ollama) for summarization and Q&A over long documents.

## Project Structure
- `backend/` Django REST API
- `frontend/` React + Vite + Tailwind UI

## Prerequisites
- Python 3.10+
- Node.js 18+
- One of:
  - OpenAI API key (for GPT-4o mini)
  - Ollama installed and running (for local models) (see [Ollama](https://ollama.com))

## Setup
### Backend
1. Create virtualenv and install deps
```bash
cd backend
python -m venv .venv
. .venv/Scripts/activate  # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```
2. Choose your LLM provider

OpenAI (recommended for GPT-4o mini):
```bash
setx LLM_PROVIDER openai
setx OPENAI_API_KEY your_key_here
```

Ollama (local):
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

### Restricting Q&A to the Uploaded Document (Relevance Gate)
- The backend blocks off-topic questions using embeddings.
- On upload, the document summary is stored in session and embedded. On ask, the question is embedded and compared to the summary via cosine similarity. If similarity is below a threshold, the server responds with a gentle refusal.

Setup:
- OpenAI provider: set env vars and use defaults
  - `OPENAI_MODEL` (default `gpt-4o-mini`)
  - `OPENAI_EMBED_MODEL` (default `text-embedding-3-small`)
- Ollama provider: pull an embedding model (default `nomic-embed-text`):
  ```bash
  ollama pull nomic-embed-text
  ```

Environment variables:
- Common:
  - `LLM_PROVIDER` = `openai` | `ollama` (default `ollama`)
  - `RELEVANCE_THRESHOLD` (default `0.30`, increase to be stricter)
- OpenAI:
  - `OPENAI_API_KEY` (required for `openai`)
  - `OPENAI_MODEL` (default `gpt-4o-mini`)
  - `OPENAI_EMBED_MODEL` (default `text-embedding-3-small`)
- Ollama:
  - `LLAMA_MODEL` (default `smolLM2`)
  - `EMBED_MODEL` (default `nomic-embed-text`)

## Environment
- Backend can use `LLAMA_MODEL` to select which model Ollama serves (default `llama3.1`).
- Frontend can override API base via `VITE_API_BASE`.
