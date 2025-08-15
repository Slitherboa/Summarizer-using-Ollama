"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Download, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SummaryDisplayProps {
  summary: string
  isLoading: boolean
}

export function SummaryDisplay({ summary, isLoading }: SummaryDisplayProps) {
  const { toast } = useToast()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary)
      toast({
        title: "Copied to clipboard",
        description: "Summary has been copied to your clipboard.",
      })
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually.",
        variant: "destructive",
      })
    }
  }

  const handleDownload = () => {
    const blob = new Blob([summary], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "summary.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Download started",
      description: "Your summary is being downloaded.",
    })
  }

  return (
    <section className="mt-12">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Your Summary</h2>

        <Card className="p-6 md:p-8 shadow-xl border-0 bg-white/70 backdrop-blur-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-muted-foreground">Analyzing and summarizing your text...</p>
                <p className="text-sm text-muted-foreground mt-2">This may take a few moments</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="prose prose-gray max-w-none">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-l-4 border-blue-500">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{summary}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button onClick={handleCopy} variant="outline" className="flex-1 sm:flex-none bg-transparent">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Summary
                </Button>
                <Button onClick={handleDownload} variant="outline" className="flex-1 sm:flex-none bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </section>
  )
}
