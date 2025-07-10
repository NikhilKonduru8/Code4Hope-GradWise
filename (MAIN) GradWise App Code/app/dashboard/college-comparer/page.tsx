"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Scale, TrendingUp, DollarSign, Users, GraduationCap, Star } from "lucide-react"
import { createClient } from "@/lib/supabase"

interface CollegeData {
  name: string
  rank: string
  acceptanceRate: string
  tuition: string
  totalCost: string
  medianIncome: string
  location: string
  type: string
  enrollment: string
  satRange: string
  gpaAverage: string
  graduationRate: string
  personalizedPros: string[]
  personalizedCons: string[]
  overallScore: string
}

interface UserProfile {
  location: string
  income_bracket: string
}

export default function CollegeComparerPage() {
  const [colleges, setColleges] = useState<string[]>(["", ""])
  const [loading, setLoading] = useState(false)
  const [comparisonData, setComparisonData] = useState<CollegeData[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Try to get profile from database first
      const { data: profile } = await supabase
        .from("profiles")
        .select("location, income_bracket")
        .eq("id", user.id)
        .single()

      if (profile && profile.location && profile.income_bracket) {
        setUserProfile({
          location: profile.location,
          income_bracket: profile.income_bracket,
        })
      } else {
        // Fallback to user metadata
        const metadata = user.user_metadata
        if (metadata?.location && metadata?.income_bracket) {
          setUserProfile({
            location: metadata.location,
            income_bracket: metadata.income_bracket,
          })
        }
      }
    } catch (error) {
      console.error("Error loading user profile:", error)
    }
  }

  const addCollegeInput = () => {
    if (colleges.length < 5) {
      setColleges([...colleges, ""])
    }
  }

  const removeCollegeInput = (index: number) => {
    if (colleges.length > 2) {
      const newColleges = colleges.filter((_, i) => i !== index)
      setColleges(newColleges)
    }
  }

  const updateCollege = (index: number, value: string) => {
    const newColleges = [...colleges]
    newColleges[index] = value
    setColleges(newColleges)
  }

  const handleCompare = async () => {
    const filledColleges = colleges.filter((college) => college.trim() !== "")

    if (filledColleges.length < 2) {
      alert("Please enter at least 2 colleges to compare")
      return
    }

    setLoading(true)
    setComparisonData([])

    try {
      const response = await fetch("/api/college-comparer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          colleges: filledColleges,
          userProfile: userProfile,
        }),
      })

      const data = await response.json()

      if (data.error) {
        console.error("API Error:", data.error)
        alert("Error comparing colleges. Please try again.")
        return
      }

      setComparisonData(data.comparison)
    } catch (error) {
      console.error("Error:", error)
      alert("Error comparing colleges. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: string) => {
    const numScore = Number.parseFloat(score)
    if (numScore >= 8.5) return "text-green-600 bg-green-50"
    if (numScore >= 7.0) return "text-blue-600 bg-blue-50"
    if (numScore >= 5.5) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const getRankColor = (rank: string) => {
    const numRank = Number.parseInt(rank.replace(/\D/g, ""))
    if (numRank <= 25) return "text-green-600 bg-green-50"
    if (numRank <= 50) return "text-blue-600 bg-blue-50"
    if (numRank <= 100) return "text-yellow-600 bg-yellow-50"
    return "text-gray-600 bg-gray-50"
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">College Comparer</h2>
        <p className="text-muted-foreground">
          Compare colleges side-by-side with personalized insights based on your profile
        </p>
      </div>

      {/* College Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Select Colleges to Compare
          </CardTitle>
          <CardDescription>Enter the names of colleges you want to compare (2-5 colleges)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {colleges.map((college, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor={`college-${index}`}>College {index + 1}</Label>
                  <Input
                    id={`college-${index}`}
                    value={college}
                    onChange={(e) => updateCollege(index, e.target.value)}
                    placeholder="e.g., Harvard University, Stanford University"
                    className="mt-1"
                  />
                </div>
                {colleges.length > 2 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeCollegeInput(index)}
                    className="mt-6 h-10 w-10 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            {colleges.length < 5 && (
              <Button variant="outline" onClick={addCollegeInput} className="bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Add Another College
              </Button>
            )}
            <Button
              onClick={handleCompare}
              disabled={loading || colleges.filter((c) => c.trim()).length < 2}
              className="ml-auto"
            >
              {loading ? (
                <>
                  <Scale className="h-4 w-4 mr-2 animate-spin" />
                  Comparing Colleges...
                </>
              ) : (
                <>
                  <Scale className="h-4 w-4 mr-2" />
                  Compare Colleges
                </>
              )}
            </Button>
          </div>

          {!userProfile && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                💡 <strong>Tip:</strong> Complete your profile to get personalized pros and cons for each college based
                on your location and income bracket.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">Analyzing and comparing your selected colleges...</p>
          <p className="text-sm text-muted-foreground mt-2">This may take a moment as we gather comprehensive data</p>
        </div>
      )}

      {/* Comparison Results */}
      {comparisonData.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <h3 className="text-2xl font-bold">College Comparison Results</h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
              {comparisonData.length} colleges
            </span>
          </div>

          {/* Quick Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Comparison Overview</CardTitle>
              <CardDescription>Key metrics at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">College</th>
                      <th className="text-left p-2 font-medium">Rank</th>
                      <th className="text-left p-2 font-medium">Acceptance Rate</th>
                      <th className="text-left p-2 font-medium">Tuition</th>
                      <th className="text-left p-2 font-medium">Overall Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((college, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{college.name}</td>
                        <td className="p-2">
                          <Badge className={getRankColor(college.rank)}>{college.rank}</Badge>
                        </td>
                        <td className="p-2">{college.acceptanceRate}</td>
                        <td className="p-2">{college.tuition}</td>
                        <td className="p-2">
                          <Badge className={getScoreColor(college.overallScore)}>{college.overallScore}/10</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Detailed College Cards */}
          <div className="grid gap-6">
            {comparisonData.map((college, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl text-blue-900">{college.name}</CardTitle>
                      <CardDescription className="text-blue-700">
                        {college.location} • {college.type}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <Badge className={getScoreColor(college.overallScore)} variant="secondary">
                        <Star className="h-3 w-3 mr-1" />
                        {college.overallScore}/10
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">Overall Score</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Academic & Admission Stats */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-blue-600" />
                        Academic & Admission
                      </h4>
                      <div className="grid gap-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">National Rank</span>
                          <Badge className={getRankColor(college.rank)}>{college.rank}</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">Acceptance Rate</span>
                          <span className="font-semibold">{college.acceptanceRate}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">SAT Range</span>
                          <span className="font-semibold">{college.satRange}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">Average GPA</span>
                          <span className="font-semibold">{college.gpaAverage}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">Graduation Rate</span>
                          <span className="font-semibold">{college.graduationRate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Financial & Demographics */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        Financial & Demographics
                      </h4>
                      <div className="grid gap-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">Annual Tuition</span>
                          <span className="font-semibold text-green-700">{college.tuition}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">Total Cost</span>
                          <span className="font-semibold text-green-700">{college.totalCost}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">Graduate Median Income</span>
                          <span className="font-semibold">{college.medianIncome}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">Enrollment</span>
                          <span className="font-semibold">{college.enrollment}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Personalized Pros and Cons */}
                  {userProfile && (
                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-lg flex items-center gap-2 text-green-700">
                          <TrendingUp className="h-5 w-5" />
                          Personalized Pros
                        </h4>
                        <div className="space-y-2">
                          {college.personalizedPros.map((pro, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                              <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm text-green-800">{pro}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold text-lg flex items-center gap-2 text-red-700">
                          <Users className="h-5 w-5" />
                          Personalized Considerations
                        </h4>
                        <div className="space-y-2">
                          {college.personalizedCons.map((con, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                              <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm text-red-800">{con}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Decision Helper */}
          <Card>
            <CardHeader>
              <CardTitle>🎯 Decision Helper</CardTitle>
              <CardDescription>Based on your comparison, here are some key insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 text-green-700">🏆 Best Overall Score</h4>
                  <p className="text-sm text-muted-foreground">
                    {
                      comparisonData.reduce((best, current) =>
                        Number.parseFloat(current.overallScore) > Number.parseFloat(best.overallScore) ? current : best,
                      ).name
                    }
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 text-blue-700">💰 Most Affordable</h4>
                  <p className="text-sm text-muted-foreground">
                    {
                      comparisonData.reduce((cheapest, current) => {
                        const currentCost = Number.parseInt(current.tuition.replace(/\D/g, ""))
                        const cheapestCost = Number.parseInt(cheapest.tuition.replace(/\D/g, ""))
                        return currentCost < cheapestCost ? current : cheapest
                      }).name
                    }
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 text-purple-700">📈 Highest Ranked</h4>
                  <p className="text-sm text-muted-foreground">
                    {
                      comparisonData.reduce((highest, current) => {
                        const currentRank = Number.parseInt(current.rank.replace(/\D/g, ""))
                        const highestRank = Number.parseInt(highest.rank.replace(/\D/g, ""))
                        return currentRank < highestRank ? current : highest
                      }).name
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!loading && comparisonData.length === 0 && (
        <div className="text-center py-12">
          <Scale className="h-16 w-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Ready to Compare Colleges?</h3>
          <p className="text-muted-foreground">
            Enter at least 2 college names above and click "Compare Colleges" to get detailed insights
          </p>
        </div>
      )}
    </div>
  )
}
