"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, FileText, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface PDFUploadProps {
  onFileUpload: (file: File) => void
  isLoading?: boolean
}

export function PDFUpload({ onFileUpload, isLoading = false }: PDFUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const intervalRef = useRef<number | null>(null)
  const hasNotifiedRef = useRef(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === "application/pdf") {
        setUploadedFile(file)
        hasNotifiedRef.current = false
        handleFileUpload(file)
      }
    }
  }, [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type === "application/pdf") {
        setUploadedFile(file)
        hasNotifiedRef.current = false
        handleFileUpload(file)
      }
    }
  }, [])

  const handleFileUpload = async (file: File) => {
    // Simulate upload progress
    setUploadProgress(0)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    intervalRef.current = window.setInterval(() => {
      setUploadProgress((prev) => {
        const next = prev + 10
        if (next >= 100) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          return 100
        }
        return next
      })
    }, 200)
  }

  useEffect(() => {
    if (uploadProgress === 100 && uploadedFile && !hasNotifiedRef.current) {
      hasNotifiedRef.current = true
      onFileUpload(uploadedFile)
    }
  }, [uploadProgress, uploadedFile, onFileUpload])

  const removeFile = () => {
    setUploadedFile(null)
    setUploadProgress(0)
    hasNotifiedRef.current = false
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Card className="p-6 shadow-xl border-0 bg-white/70 backdrop-blur-sm">
      <div className="space-y-4">
        <div className="text-left">
          <label className="block text-sm font-medium mb-3 text-foreground">Upload PDF Document</label>
          <p className="text-xs text-muted-foreground mb-4">Upload a PDF file to extract and summarize its content</p>
        </div>

        {!uploadedFile ? (
          <div
            className={cn(
              "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
              dragActive
                ? "border-blue-500 bg-blue-50/50"
                : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/30",
              isLoading && "opacity-50 pointer-events-none",
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isLoading}
            />

            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-white" />
              </div>

              <div>
                <p className="text-lg font-medium text-foreground mb-2">
                  {dragActive ? "Drop your PDF here" : "Drag & drop your PDF here"}
                </p>
                <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>

                <Button
                  type="button"
                  variant="outline"
                  className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 bg-transparent"
                  disabled={isLoading}
                >
                  Choose PDF File
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">Supports PDF files up to 10MB</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{uploadedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(uploadedFile.size)}</p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-gray-500 hover:text-red-500"
                disabled={isLoading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Uploading...</span>
                  <span className="text-blue-600 font-medium">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {uploadProgress === 100 && (
              <div className="flex items-center space-x-2 text-green-600 text-sm">
                <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span>PDF uploaded successfully</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
