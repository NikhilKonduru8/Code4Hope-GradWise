"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { DollarSign, FileText, Calendar, ExternalLink, CheckCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useState } from "react"

export default function FinancialAidPage() {
  const [completedDocuments, setCompletedDocuments] = useState<string[]>(["ssn", "license"])

  const documents = [
    { id: "ssn", name: "Social Security Number", completed: true },
    { id: "license", name: "Driver's License", completed: true },
    { id: "taxes", name: "Tax Returns (Previous Year)", completed: false },
    { id: "bank", name: "Bank Statements", completed: false },
    { id: "investments", name: "Investment Records", completed: false },
  ]

  const toggleDocument = (docId: string) => {
    setCompletedDocuments((prev) => (prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]))
  }

  const completionPercentage = (completedDocuments.length / documents.length) * 100

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Financial Aid (FAFSA)</h2>
        <p className="text-muted-foreground">
          Navigate the financial aid process and maximize your funding opportunities
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> The FAFSA opens on October 1st each year. Submit as early as possible for the best
          aid opportunities.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>FAFSA Progress</CardTitle>
          <CardDescription>Track your financial aid application completion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">FAFSA Completion</span>
              <span className="text-sm text-muted-foreground">{Math.round(completionPercentage)}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Required Documents
            </CardTitle>
            <CardDescription>Gather these documents before starting your FAFSA</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3">
                  <button onClick={() => toggleDocument(doc.id)} className="flex items-center gap-3 w-full text-left">
                    {completedDocuments.includes(doc.id) ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    )}
                    <span className="text-sm">{doc.name}</span>
                  </button>
                </div>
              ))}
            </div>
            <Button className="w-full" asChild>
              <a href="https://studentaid.gov/h/apply-for-aid/fafsa" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Start FAFSA Application
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Important Deadlines
            </CardTitle>
            <CardDescription>Don't miss these critical dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="font-medium text-sm">Federal FAFSA Deadline</div>
                <div className="text-sm text-muted-foreground">June 30, 2025</div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="font-medium text-sm">State Aid Priority Deadline</div>
                <div className="text-sm text-muted-foreground">Varies by state</div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="font-medium text-sm">College Priority Deadlines</div>
                <div className="text-sm text-muted-foreground">Check individual schools</div>
              </div>
            </div>
            <Button variant="outline" className="w-full bg-transparent" asChild>
              <a
                href="https://studentaid.gov/apply-for-aid/fafsa/filling-out/help"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Calendar className="h-4 w-4 mr-2" />
                View FAFSA Help
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Federal Aid Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-medium text-sm">Pell Grants</h4>
              <p className="text-xs text-muted-foreground">Need-based grants (don't repay)</p>
            </div>
            <div>
              <h4 className="font-medium text-sm">Federal Loans</h4>
              <p className="text-xs text-muted-foreground">Low-interest student loans</p>
            </div>
            <div>
              <h4 className="font-medium text-sm">Work-Study</h4>
              <p className="text-xs text-muted-foreground">Part-time job opportunities</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              State Aid Programs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-medium text-sm">State Grants</h4>
              <p className="text-xs text-muted-foreground">Need-based state funding</p>
            </div>
            <div>
              <h4 className="font-medium text-sm">Merit Scholarships</h4>
              <p className="text-xs text-muted-foreground">Academic achievement awards</p>
            </div>
            <div>
              <h4 className="font-medium text-sm">Special Programs</h4>
              <p className="text-xs text-muted-foreground">Career-specific aid</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Institutional Aid
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-medium text-sm">College Grants</h4>
              <p className="text-xs text-muted-foreground">School-specific need aid</p>
            </div>
            <div>
              <h4 className="font-medium text-sm">Merit Scholarships</h4>
              <p className="text-xs text-muted-foreground">Academic excellence rewards</p>
            </div>
            <div>
              <h4 className="font-medium text-sm">Athletic Scholarships</h4>
              <p className="text-xs text-muted-foreground">Sports-based funding</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>FAFSA Tips & Best Practices</CardTitle>
          <CardDescription>Maximize your financial aid opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium">Before Filing</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Create your FSA ID early</li>
                <li>• Gather all required documents</li>
                <li>• Complete taxes before FAFSA</li>
                <li>• Research state deadlines</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">While Filing</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Use the IRS Data Retrieval Tool</li>
                <li>• Double-check all information</li>
                <li>• List schools in priority order</li>
                <li>• Submit as early as possible</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>External Resources</CardTitle>
          <CardDescription>Additional financial aid resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Button variant="outline" className="justify-start bg-transparent" asChild>
              <a href="https://studentaid.gov/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Federal Student Aid
              </a>
            </Button>
            <Button variant="outline" className="justify-start bg-transparent" asChild>
              <a href="https://www.scholarships.com/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Scholarship Search
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
