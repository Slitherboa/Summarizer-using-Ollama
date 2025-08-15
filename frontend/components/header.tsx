import { Button } from "@/components/ui/button"
import { FileText, Menu } from "lucide-react"

export function Header() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SummarizeAI
              </h1>
              <p className="text-xs text-muted-foreground">Intelligent Text Summarization</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-sm font-medium text-foreground hover:text-blue-600 transition-colors">
              Home
            </a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-blue-600 transition-colors">
              Pricing
            </a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-blue-600 transition-colors">
              About
            </a>
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </nav>

          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
