"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { PDFUpload } from "@/components/pdf-upload"
import { Sparkles, Loader2 } from "lucide-react"

interface HeroSectionProps {
  inputText: string
  setInputText: (text: string) => void
  onSummarize: () => void
  onPDFUpload: (file: File) => void
  isLoading: boolean
}

export function HeroSection({ inputText, setInputText, onSummarize, onPDFUpload, isLoading }: HeroSectionProps) {
  return (
    <section className="text-center py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
            Summarize Any Text
            <br />
            <span className="text-3xl md:text-5xl">Instantly</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transform lengthy documents, articles, and texts into concise, meaningful summaries using advanced AI
            technology.
          </p>
        </div>

        <div className="space-y-6">
          <PDFUpload onFileUpload={onPDFUpload} isLoading={isLoading} />

          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Upload a PDF</span>
              <div className="w-8 h-px bg-gray-300"></div>
              <span>OR</span>
              <div className="w-8 h-px bg-gray-300"></div>
              <span>Paste text below</span>
            </div>
          </div>

          <Card className="p-6 md:p-8 shadow-xl border-0 bg-white/70 backdrop-blur-sm">
            <div className="space-y-6">
              <div className="text-left">
                <label htmlFor="text-input" className="block text-sm font-medium mb-3 text-foreground">
                  Paste your text here
                </label>
                <Textarea
                  id="text-input"
                  placeholder="Enter or paste the text you want to summarize. This could be an article, research paper, blog post, or any long-form content..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[200px] resize-none border-2 focus:border-blue-500 transition-colors"
                  disabled={isLoading}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-muted-foreground">{inputText.length} characters</p>
                  <p className="text-xs text-muted-foreground">Recommended: 500+ characters for best results</p>
                </div>
              </div>

              <Button
                onClick={onSummarize}
                disabled={!inputText.trim() || isLoading}
                size="lg"
                className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Summarizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Summarize Text
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
