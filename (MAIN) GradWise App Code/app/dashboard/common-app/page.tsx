"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, FileText, User, GraduationCap, Award, ExternalLink } from "lucide-react"
import { useState } from "react"

export default function CommonAppPage() {
  const [completedSections, setCompletedSections] = useState<string[]>([])

  const toggleSection = (sectionId: string) => {
    setCompletedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId],
    )
  }

  const sections = [
    {
      id: "personal-info",
      title: "Personal Information",
      icon: User,
      items: ["Basic Information", "Contact Details", "Demographics (Optional)"],
      description: "Basic details and contact information",
    },
    {
      id: "education",
      title: "Education",
      icon: GraduationCap,
      items: ["Current School", "Grades & GPA", "Test Scores"],
      description: "Academic history and achievements",
    },
    {
      id: "activities",
      title: "Activities",
      icon: Award,
      items: ["Extracurricular Activities", "Honors & Awards", "Work Experience"],
      description: "Extracurriculars and achievements",
    },
    {
      id: "essays",
      title: "Essays",
      icon: FileText,
      items: ["Personal Statement", "Additional Information", "School-Specific Essays"],
      description: "Personal statement and supplemental essays",
    },
  ]

  const completionPercentage = (completedSections.length / sections.length) * 100

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Common App Guide</h2>
        <p className="text-muted-foreground">Step-by-step guidance through the Common Application process</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Progress</CardTitle>
          <CardDescription>Track your Common App completion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(completionPercentage)}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon
          const isCompleted = completedSections.includes(section.id)

          return (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {section.title}
                </CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
                <Button
                  variant={isCompleted ? "secondary" : "outline"}
                  className="w-full bg-transparent"
                  onClick={() => toggleSection(section.id)}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Incomplete
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Mark as Complete
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Common App Tips</CardTitle>
          <CardDescription>Essential advice for a successful application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium">Before You Start</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Gather all necessary documents</li>
                <li>• Create a Common App account early</li>
                <li>• Research your target schools</li>
                <li>• Plan your essay topics</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Best Practices</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Save your work frequently</li>
                <li>• Proofread everything carefully</li>
                <li>• Ask for help when needed</li>
                <li>• Submit before deadlines</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>External Resources</CardTitle>
          <CardDescription>Helpful links for your Common App journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Button variant="outline" className="justify-start bg-transparent" asChild>
              <a href="https://www.commonapp.org" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Common Application Website
              </a>
            </Button>
            <Button variant="outline" className="justify-start bg-transparent" asChild>
              <a href="https://www.commonapp.org/help" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Common App Help Center
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
