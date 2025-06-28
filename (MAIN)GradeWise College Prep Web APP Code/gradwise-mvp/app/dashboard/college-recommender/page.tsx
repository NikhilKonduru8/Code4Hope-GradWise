"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, DollarSign, GraduationCap, ExternalLink } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface RecommendationData {
  location: string
  incomeBracket: string
}

export default function CollegeRecommenderPage() {
  const [formData, setFormData] = useState<RecommendationData>({
    location: "",
    incomeBracket: "",
  })
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.location || !formData.incomeBracket || loading) return

    setLoading(true)

    try {
      const response = await fetch("/api/college-recommender", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      setRecommendations(data.recommendations)
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Your Information
            </CardTitle>
            <CardDescription>Tell us about your location and financial situation</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location (State or ZIP Code)</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., California or 90210"
                />
              </div>
              <div className="space-y-2">
                <Label>Family Income Bracket</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, incomeBracket: value })}>
                  <SelectTrigger>
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
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !formData.location || !formData.incomeBracket}
              >
                {loading ? "Finding Colleges..." : "Get Recommendations"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              College Recommendations
            </CardTitle>
            <CardDescription>Personalized suggestions based on your criteria</CardDescription>
          </CardHeader>
          <CardContent>
            {!recommendations && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Fill out your information to get personalized college recommendations</p>
              </div>
            )}
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Finding the best colleges for you...</p>
              </div>
            )}
            {recommendations && (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{recommendations}</ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {recommendations && (
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
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit FAFSA
                </Button>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Scholarship Search</h4>
                <p className="text-sm text-muted-foreground mb-3">Find scholarships that match your profile</p>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Search Scholarships
                </Button>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Net Price Calculator</h4>
                <p className="text-sm text-muted-foreground mb-3">Estimate your actual college costs</p>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Calculate Costs
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
