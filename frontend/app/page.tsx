"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { SummaryDisplay } from "@/components/summary-display"
import { Chatbot } from "@/components/chatbot"
import { uploadPdfForSummary, uploadTextForSummary } from "@/lib/api"

export default function Home() {
  const [inputText, setInputText] = useState("")
  const [summary, setSummary] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSummarize = async () => {
    if (!inputText.trim()) return
    setIsLoading(true)
    try {
      const s = await uploadTextForSummary(inputText)
      setSummary(s)
    } catch (e: any) {
      setSummary(e?.message || 'Failed to summarize')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePDFUpload = async (file: File) => {
    setIsLoading(true)
    try {
      const s = await uploadPdfForSummary(file)
      setSummary(s)
    } catch (e: any) {
      setSummary(e?.message || 'Failed to upload PDF')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <HeroSection
          inputText={inputText}
          setInputText={setInputText}
          onSummarize={handleSummarize}
          onPDFUpload={handlePDFUpload}
          isLoading={isLoading}
        />
        {(summary || isLoading) && <SummaryDisplay summary={summary} isLoading={isLoading} />}
      </main>
      <Chatbot />
    </div>
  )
}
