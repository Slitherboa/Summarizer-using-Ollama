const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

async function parseJsonSafe(resp: Response): Promise<any> {
  try {
    return await resp.json()
  } catch {
    return null
  }
}

export async function uploadTextForSummary(text: string): Promise<string> {
  const resp = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ text })
  })
  if (!resp.ok) {
    const data = await parseJsonSafe(resp)
    const message = (data && (data.error || data.detail)) || `Upload failed (${resp.status})`
    throw new Error(message)
  }
  const data = await resp.json()
  return data.summary || ''
}

export async function uploadPdfForSummary(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const resp = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    credentials: 'include',
    body: form
  })
  if (!resp.ok) {
    const data = await parseJsonSafe(resp)
    const message = (data && (data.error || data.detail)) || `PDF upload failed (${resp.status})`
    throw new Error(message)
  }
  const data = await resp.json()
  return data.summary || ''
}

export async function askQuestion(question: string): Promise<string> {
  const resp = await fetch(`${API_BASE}/api/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ question })
  })
  if (!resp.ok) {
    const data = await parseJsonSafe(resp)
    const message = (data && (data.error || data.detail)) || `Ask failed (${resp.status})`
    throw new Error(message)
  }
  const data = await resp.json()
  return data.answer || ''
}


