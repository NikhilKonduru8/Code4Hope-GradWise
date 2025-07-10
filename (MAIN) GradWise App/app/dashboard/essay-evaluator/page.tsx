"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, CheckCircle, AlertCircle, Sparkles, History, Trash2 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { createClient } from "@/lib/supabase"

interface SavedEssay {
  id: string
  title: string
  ai_feedback: string
  status: string
  created_at: string
}

export default function EssayEvaluatorPage() {
  const [essayText, setEssayText] = useState("")
  const [evaluating, setEvaluating] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [savedEssays, setSavedEssays] = useState<SavedEssay[]>([])
  const [selectedEssayId, setSelectedEssayId] = useState<string | null>(null)

  useEffect(() => {
    loadSavedEssays()
  }, [])

  const loadSavedEssays = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Get all saved essays
      const { data: essays, error } = await supabase
        .from("essays")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading essays:", error)
        return
      }

      if (essays && essays.length > 0) {
        setSavedEssays(essays)

        // Load the most recent essay by default
        const latest = essays[0]
        setSelectedEssayId(latest.id)
        setFeedback(latest.ai_feedback)
      }
    } catch (error) {
      console.error("Error loading saved essays:", error)
    }
  }

  const loadSpecificEssay = (essayId: string) => {
    const selectedEssay = savedEssays.find((e) => e.id === essayId)
    if (selectedEssay) {
      setSelectedEssayId(essayId)
      setFeedback(selectedEssay.ai_feedback)
      setEssayText("") // Clear the text area since we're viewing saved feedback
    }
  }

  const deleteEssay = async (essayId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("essays").delete().eq("id", essayId)

      if (error) {
        console.error("Error deleting essay:", error)
        return
      }

      // Reload essays
      await loadSavedEssays()

      // If we deleted the currently selected essay, clear the form
      if (selectedEssayId === essayId) {
        setSelectedEssayId(null)
        setFeedback(null)
        setEssayText("")
      }
    } catch (error) {
      console.error("Error deleting essay:", error)
    }
  }

  const handleSubmit = async () => {
    if (!essayText.trim()) {
      setError("Please enter your essay text")
      return
    }

    setEvaluating(true)
    setError(null)
    setFeedback(null) // Clear current feedback

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
        setSelectedEssayId(null) // Clear selected essay since this is new

        // Reload saved essays to get the latest
        setTimeout(() => {
          loadSavedEssays()
        }, 1000)
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

      {/* Saved Essays Section */}
      {savedEssays.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Your Essay Analysis History ({savedEssays.length})
            </CardTitle>
            <CardDescription>View previous essay evaluations or analyze a new essay</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {savedEssays.map((savedEssay) => (
                <div
                  key={savedEssay.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                    selectedEssayId === savedEssay.id ? "bg-blue-50 border-blue-300" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0" onClick={() => loadSpecificEssay(savedEssay.id)}>
                      <h4 className="font-medium text-sm mb-1">{savedEssay.title || "Essay Analysis"}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <span>{new Date(savedEssay.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="capitalize">{savedEssay.status}</span>
                      </div>
                      {selectedEssayId === savedEssay.id && (
                        <div className="text-xs text-blue-600 font-medium">Currently viewing</div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteEssay(savedEssay.id)
                      }}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                  Get New AI Feedback
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
              {selectedEssayId && (
                <span className="ml-auto text-sm text-muted-foreground font-normal">Viewing saved analysis</span>
              )}
            </CardTitle>
            <CardDescription>Detailed analysis and suggestions for improvement</CardDescription>
          </CardHeader>
          <CardContent>
            {!feedback && !evaluating && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>
                  {savedEssays.length > 0
                    ? "Select a saved analysis or enter new essay text for feedback"
                    : "Enter your essay text to receive detailed feedback"}
                </p>
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
