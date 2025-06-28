import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle, Clock, FileText, Users } from "lucide-react"

export default function AdmissionsProcessPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admissions Process Overview</h2>
        <p className="text-muted-foreground">Understand the complete college admissions journey from start to finish</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Junior Year</CardTitle>
            <Badge variant="secondary">Preparation Phase</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Take SAT/ACT</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Research colleges</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span>Build activities list</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span>Start essay brainstorming</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Senior Fall</CardTitle>
            <Badge variant="default">Application Phase</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span>Complete applications</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span>Write essays</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span>Request recommendations</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span>Submit FAFSA</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Senior Spring</CardTitle>
            <Badge variant="outline">Decision Phase</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>Receive decisions</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>Compare aid packages</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>Visit campuses</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>Make final choice</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Summer</CardTitle>
            <Badge variant="secondary">Transition Phase</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-purple-600" />
              <span>Submit deposits</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-purple-600" />
              <span>Register for orientation</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-purple-600" />
              <span>Apply for housing</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-purple-600" />
              <span>Prepare for college</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Application Components
            </CardTitle>
            <CardDescription>Essential parts of your college application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium text-sm">Academic Transcript</h4>
                  <p className="text-xs text-muted-foreground">GPA and course rigor</p>
                </div>
                <Badge variant="secondary">Required</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium text-sm">Standardized Tests</h4>
                  <p className="text-xs text-muted-foreground">SAT/ACT scores</p>
                </div>
                <Badge variant="secondary">Usually Required</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium text-sm">Personal Essays</h4>
                  <p className="text-xs text-muted-foreground">Common App + supplements</p>
                </div>
                <Badge variant="secondary">Required</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium text-sm">Recommendations</h4>
                  <p className="text-xs text-muted-foreground">Teacher/counselor letters</p>
                </div>
                <Badge variant="secondary">Required</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Admission Factors
            </CardTitle>
            <CardDescription>What colleges consider in their decisions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium text-sm">Academic Performance</h4>
                  <p className="text-xs text-muted-foreground">Grades and test scores</p>
                </div>
                <Badge>Very Important</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium text-sm">Extracurriculars</h4>
                  <p className="text-xs text-muted-foreground">Activities and leadership</p>
                </div>
                <Badge variant="secondary">Important</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium text-sm">Essays & Character</h4>
                  <p className="text-xs text-muted-foreground">Personal qualities</p>
                </div>
                <Badge variant="secondary">Important</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium text-sm">Demonstrated Interest</h4>
                  <p className="text-xs text-muted-foreground">Campus visits, contact</p>
                </div>
                <Badge variant="outline">Considered</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Key Deadlines Timeline
          </CardTitle>
          <CardDescription>Important dates to remember throughout the process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Early Action/Decision</h4>
                <p className="text-sm text-muted-foreground mb-2">November 1-15</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Earlier admission decisions</li>
                  <li>• Some are binding (ED)</li>
                  <li>• Higher acceptance rates</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Regular Decision</h4>
                <p className="text-sm text-muted-foreground mb-2">January 1-15</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Most common deadline</li>
                  <li>• More time to prepare</li>
                  <li>• Compare multiple offers</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Rolling Admission</h4>
                <p className="text-sm text-muted-foreground mb-2">Varies by school</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Applications reviewed as received</li>
                  <li>• Earlier is better</li>
                  <li>• Decisions within weeks</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Success Strategies</CardTitle>
          <CardDescription>Tips to strengthen your college applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium">Academic Excellence</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Take challenging courses (AP, IB, Honors)</li>
                <li>• Maintain strong GPA throughout high school</li>
                <li>• Prepare thoroughly for standardized tests</li>
                <li>• Show improvement and growth over time</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Beyond Academics</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Develop meaningful extracurricular activities</li>
                <li>• Show leadership and initiative</li>
                <li>• Demonstrate community involvement</li>
                <li>• Pursue genuine interests and passions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
