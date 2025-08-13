import { useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

function ChatMessage({ role, content }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} my-2`}>
      <div className={`max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 ${isUser ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
        {content}
      </div>
    </div>
  )
}

export default function App() {
  const [pdfFile, setPdfFile] = useState(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState('')
  const [question, setQuestion] = useState('')
  const [chat, setChat] = useState([])
  const [error, setError] = useState('')

  const onFileChange = (e) => {
    const f = e.target.files?.[0]
    setPdfFile(f || null)
  }

  const handleSummarize = async () => {
    setLoading(true)
    setError('')
    setSummary('')
    try {
      const hasFile = !!pdfFile
      if (!hasFile && !text.trim()) {
        setError('Please upload a PDF or paste some text.')
        return
      }
      let resp
      if (hasFile) {
        const form = new FormData()
        form.append('file', pdfFile)
        resp = await axios.post(`${API_BASE}/api/upload`, form, { withCredentials: true })
      } else {
        resp = await axios.post(`${API_BASE}/api/upload`, { text }, { withCredentials: true })
      }
      setSummary(resp.data.summary || '')
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to summarize.')
    } finally {
      setLoading(false)
    }
  }

  const handleAsk = async () => {
    if (!question.trim()) return
    const userMsg = { role: 'user', content: question }
    setChat((c) => [...c, userMsg])
    setQuestion('')
    try {
      const resp = await axios.post(`${API_BASE}/api/ask`, { question: userMsg.content }, { withCredentials: true })
      const botMsg = { role: 'assistant', content: resp.data.answer || '' }
      setChat((c) => [...c, botMsg])
    } catch (e) {
      const botMsg = { role: 'assistant', content: e?.response?.data?.error || 'Failed to get answer.' }
      setChat((c) => [...c, botMsg])
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Long Document Summarizer & Q&A</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <label className="label">Upload PDF</label>
          <input type="file" accept="application/pdf" onChange={onFileChange} className="mb-4" />

          <label className="label">Or paste text</label>
          <textarea className="input h-48" value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste long article text here..." />

          <button className="btn mt-4" onClick={handleSummarize} disabled={loading}>
            {loading ? 'Summarizing...' : 'Summarize'}
          </button>

          {error && (
            <div className="mt-4 text-sm text-red-600">{error}</div>
          )}
        </div>

        <div className="card">
          <div className="mb-2 font-semibold">Summary</div>
          <div className="prose whitespace-pre-wrap text-sm">{summary || 'No summary yet.'}</div>
        </div>
      </div>

      <div className="card mt-6">
        <div className="mb-2 font-semibold">Q&A</div>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input className="input flex-1" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a question about the uploaded text..." />
            <button className="btn" onClick={handleAsk}>Ask</button>
          </div>
          <div className="mt-4">
            {chat.length === 0 && (
              <div className="text-sm text-gray-500">No Q&A yet.</div>
            )}
            {chat.map((m, i) => (
              <ChatMessage key={i} role={m.role} content={m.content} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
