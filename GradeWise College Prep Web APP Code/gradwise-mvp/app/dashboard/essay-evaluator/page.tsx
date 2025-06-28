"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, CheckCircle, AlertCircle, Sparkles } from "lucide-react"
import ReactMarkdown from "react-markdown"

export default function EssayEvaluatorPage() {
  const [essayText, setEssayText] = useState("")
  const [evaluating, setEvaluating] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!essayText.trim()) {
      setError("Please enter your essay text")
      return
    }

    setEvaluating(true)
    setError(null)

    try {
      const response = await fetch("/api/essay-evaluator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ essayText }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setFeedback(data.feedback)
      }
    } catch (err) {
      setError("An error occurred while evaluating your essay")
    } finally {
      setEvaluating(false)
    }
  }

  const wordCount = essayText
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Essay Evaluator</h2>
        <p className="text-muted-foreground">Paste your essay below for AI-powered feedback and suggestions</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Your Essay
            </CardTitle>
            <CardDescription>Paste your college essay text below for detailed analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="essay">Essay Text</Label>
              <Textarea
                id="essay"
                value={essayText}
                onChange={(e) => setEssayText(e.target.value)}
                placeholder="Paste your essay here..."
                className="min-h-[300px] resize-none"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Word count: {wordCount}</span>
                <span className={wordCount > 650 ? "text-red-600" : wordCount > 500 ? "text-yellow-600" : ""}>
                  {wordCount > 650 ? "Too long" : wordCount > 500 ? "Getting long" : "Good length"}
                </span>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button onClick={handleSubmit} disabled={!essayText.trim() || evaluating} className="w-full">
              {evaluating ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing Essay...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get AI Feedback
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              AI Feedback
            </CardTitle>
            <CardDescription>Detailed analysis and suggestions for improvement</CardDescription>
          </CardHeader>
          <CardContent>
            {!feedback && !evaluating && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter your essay text to receive detailed feedback</p>
              </div>
            )}
            {evaluating && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Analyzing your essay...</p>
              </div>
            )}
            {feedback && (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{feedback}</ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {feedback && (
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>Recommended actions based on your essay evaluation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Revise & Resubmit</h4>
                <p className="text-sm text-muted-foreground">
                  Make the suggested improvements and analyze again for another review
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Ask Virtual Counselor</h4>
                <p className="text-sm text-muted-foreground">Get specific advice about implementing the feedback</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Schedule Writing Time</h4>
                <p className="text-sm text-muted-foreground">
                  Use the schedule planner to allocate time for essay revisions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
