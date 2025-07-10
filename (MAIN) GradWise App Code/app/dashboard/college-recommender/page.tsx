"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, DollarSign, GraduationCap, ExternalLink, History, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase"

interface RecommendationData {
  location: string
  incomeBracket: string
}

interface SavedRecommendation {
  id: string
  location: string
  income_bracket: string
  recommendations: string
  created_at: string
}

interface College {
  name: string
  location: string
  type: string
  tuition: string
  financialAid: string
  keyHighlights: string[]
}

export default function CollegeRecommenderPage() {
  const [formData, setFormData] = useState<RecommendationData>({
    location: "",
    incomeBracket: "",
  })
  const [loading, setLoading] = useState(false)
  const [parsedColleges, setParsedColleges] = useState<College[]>([])
  const [savedRecommendations, setSavedRecommendations] = useState<SavedRecommendation[]>([])
  const [selectedRecommendationId, setSelectedRecommendationId] = useState<string | null>(null)

  useEffect(() => {
    loadSavedRecommendations()
  }, [])

  const loadSavedRecommendations = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Get all saved recommendations
      const { data: recommendations, error } = await supabase
        .from("college_recommendations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading recommendations:", error)
        return
      }

      if (recommendations && recommendations.length > 0) {
        setSavedRecommendations(recommendations)

        // Load the most recent recommendation by default
        const latest = recommendations[0]
        setSelectedRecommendationId(latest.id)
        setFormData({
          location: latest.location,
          incomeBracket: latest.income_bracket,
        })

        // Parse and display the saved recommendations
        const parsed = parseCollegeRecommendations(latest.recommendations)
        setParsedColleges(parsed)
      }
    } catch (error) {
      console.error("Error loading saved recommendations:", error)
    }
  }

  const loadSpecificRecommendation = (recommendationId: string) => {
    const selectedRec = savedRecommendations.find((r) => r.id === recommendationId)
    if (selectedRec) {
      setSelectedRecommendationId(recommendationId)
      setFormData({
        location: selectedRec.location,
        incomeBracket: selectedRec.income_bracket,
      })

      // Parse and display the recommendations
      const parsed = parseCollegeRecommendations(selectedRec.recommendations)
      setParsedColleges(parsed)
    }
  }

  const deleteRecommendation = async (recommendationId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("college_recommendations").delete().eq("id", recommendationId)

      if (error) {
        console.error("Error deleting recommendation:", error)
        return
      }

      // Reload recommendations
      await loadSavedRecommendations()

      // If we deleted the currently selected recommendation, clear the form
      if (selectedRecommendationId === recommendationId) {
        setSelectedRecommendationId(null)
        setFormData({ location: "", incomeBracket: "" })
        setParsedColleges([])
      }
    } catch (error) {
      console.error("Error deleting recommendation:", error)
    }
  }

  const cleanAIResponse = (text: string): string => {
    // Remove introductory paragraphs and explanatory text
    const lines = text.split("\n")
    const cleanedLines = lines.filter((line) => {
      const lowerLine = line.toLowerCase()
      return !(
        lowerLine.includes("here are") ||
        lowerLine.includes("recommendations") ||
        lowerLine.includes("note that") ||
        lowerLine.includes("net price calculator") ||
        lowerLine.includes("financial aid policies") ||
        lowerLine.includes("based on available data") ||
        lowerLine.includes("crucial to use") ||
        line.trim().length < 10
      )
    })
    return cleanedLines.join("\n")
  }

  const parseCollegeRecommendations = (text: string): College[] => {
    const colleges: College[] = []
    const cleanedText = cleanAIResponse(text)

    // Split by numbered college sections more explicitly
    const sections = cleanedText.split(/(?=\*\*\d+\.\s)/gm)

    sections.forEach((section) => {
      if (section.trim().length < 50) return // Skip short sections

      // Extract college name - look for **1. College Name** pattern
      const nameMatch = section.match(/\*\*\d+\.\s*([^*\n]+)\*\*/i)
      if (!nameMatch) return

      const name = nameMatch[1].trim()

      // Extract location
      const locationMatch = section.match(/Location:\s*([^\n]+)/i)
      const location = locationMatch ? locationMatch[1].trim() : "Location not specified"

      // Extract type
      const typeMatch = section.match(/Type:\s*(Public|Private)/i)
      const type = typeMatch ? typeMatch[1] : "Private"

      // Extract tuition
      const tuitionMatch = section.match(/Tuition:\s*([^\n]+)/i)
      const tuition = tuitionMatch ? tuitionMatch[1].trim() : "Contact for pricing"

      // Extract financial aid
      const aidMatch = section.match(/Financial Aid:\s*([^\n]+)/i)
      const financialAid = aidMatch ? aidMatch[1].trim() : "Financial aid available"

      // Extract key highlights
      const highlights: string[] = []
      const bulletPoints = section.match(/•\s*([^\n]+)/g)
      if (bulletPoints) {
        bulletPoints.forEach((point) => {
          const clean = point.replace(/^•\s*/, "").trim()
          if (clean.length > 10) {
            highlights.push(clean)
          }
        })
      }

      // Default highlights if none found
      if (highlights.length === 0) {
        highlights.push(
          "Strong academic programs",
          "Diverse student community",
          "Career support services",
          "Research opportunities",
        )
      }

      colleges.push({
        name,
        location,
        type,
        tuition,
        financialAid,
        keyHighlights: highlights.slice(0, 4),
      })
    })

    return colleges.slice(0, 5) // Ensure exactly 5 colleges
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.location || !formData.incomeBracket || loading) return

    setLoading(true)
    setParsedColleges([]) // Clear current recommendations

    try {
      const response = await fetch("/api/college-recommender", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.error) {
        console.error("API Error:", data.error)
        return
      }

      // Parse the recommendations into structured data
      const parsed = parseCollegeRecommendations(data.recommendations)
      setParsedColleges(parsed)

      // Reload saved recommendations to get the latest
      setTimeout(() => {
        loadSavedRecommendations()
      }, 1000)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">College Recommender</h2>
        <p className="text-muted-foreground">Find colleges that match your location and financial situation</p>
      </div>

      {/* Saved Recommendations Section */}
      {savedRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Your Saved Recommendations ({savedRecommendations.length})
            </CardTitle>
            <CardDescription>Load a previous search or create a new one</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {savedRecommendations.map((savedRec) => (
                <div
                  key={savedRec.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                    selectedRecommendationId === savedRec.id ? "bg-blue-50 border-blue-300" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0" onClick={() => loadSpecificRecommendation(savedRec.id)}>
                      <h4 className="font-medium text-sm mb-1">
                        📍 {savedRec.location} • 💰 {savedRec.income_bracket}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <span>{new Date(savedRec.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>5 colleges</span>
                      </div>
                      {selectedRecommendationId === savedRec.id && (
                        <div className="text-xs text-blue-600 font-medium">Currently loaded</div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteRecommendation(savedRec.id)
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

      {/* Form Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Your Information
          </CardTitle>
          <CardDescription>
            Tell us about your location and financial situation to get 5 personalized recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="location">Location (State or ZIP Code)</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., California or 90210"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Family Income Bracket</Label>
                <Select
                  value={formData.incomeBracket}
                  onValueChange={(value) => setFormData({ ...formData, incomeBracket: value })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select income range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="<20k">Less than $20,000</SelectItem>
                    <SelectItem value="20k-40k">$20,000 - $40,000</SelectItem>
                    <SelectItem value="40k-60k">$40,000 - $60,000</SelectItem>
                    <SelectItem value="60k-80k">$60,000 - $80,000</SelectItem>
                    <SelectItem value="80k+">$80,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={loading || !formData.location || !formData.incomeBracket}
                >
                  {loading ? "Finding Colleges..." : "Get New Recommendations"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">Finding your top 5 college matches...</p>
        </div>
      )}

      {/* College Recommendations */}
      {parsedColleges.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <h3 className="text-2xl font-bold">Your Top 5 College Matches</h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
              {parsedColleges.length} recommendations
            </span>
          </div>

          <div className="grid gap-6">
            {parsedColleges.map((college, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
                          {index + 1}
                        </span>
                        <h3 className="text-xl font-bold text-blue-600">{college.name}</h3>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground ml-11">
                        <MapPin className="h-4 w-4" />
                        <span>{college.location}</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                      {college.type}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 ml-11">
                    {/* Financial Information */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-sm">Tuition:</span>
                        </div>
                        <p className="text-lg font-bold text-green-700">{college.tuition}</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-purple-600" />
                          <span className="font-semibold text-sm">Financial Aid:</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{college.financialAid}</p>
                      </div>
                    </div>

                    {/* Key Highlights */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <GraduationCap className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-sm">Key Highlights:</span>
                      </div>
                      <ul className="space-y-2">
                        {college.keyHighlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Financial Aid Resources */}
      {parsedColleges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Aid Resources
            </CardTitle>
            <CardDescription>Additional resources to help with college costs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">FAFSA Application</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Complete your Free Application for Federal Student Aid
                </p>
                <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                  <a href="https://studentaid.gov/h/apply-for-aid/fafsa" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit FAFSA
                  </a>
                </Button>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Scholarship Search</h4>
                <p className="text-sm text-muted-foreground mb-3">Find scholarships that match your profile</p>
                <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                  <a href="https://www.scholarships.com/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Search Scholarships
                  </a>
                </Button>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Net Price Calculator</h4>
                <p className="text-sm text-muted-foreground mb-3">Estimate your actual college costs</p>
                <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                  <a href="https://collegecost.ed.gov/net-price" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Calculate Costs
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && parsedColleges.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Ready to Find Your Top 5 Colleges?</h3>
          <p className="text-muted-foreground">
            {savedRecommendations.length > 0
              ? "Select a saved search or fill out your information to get new recommendations"
              : "Fill out your information above to get personalized recommendations"}
          </p>
        </div>
      )}
    </div>
  )
}
