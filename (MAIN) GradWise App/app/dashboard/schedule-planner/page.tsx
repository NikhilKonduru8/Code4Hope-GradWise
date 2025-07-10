"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Target, CheckCircle, ChevronLeft, ChevronRight, History, Trash2 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { createClient } from "@/lib/supabase"

interface ScheduleData {
  timeframe: string
  goal: string
  schedule?: string
}

interface SavedSchedule {
  id: string
  goal: string
  timeframe: number
  schedule_content: string
  created_at: string
}

interface CalendarEvent {
  id: string
  title: string
  date: Date
  completed: boolean
  description?: string
  priority: "high" | "medium" | "low"
}

export default function SchedulePlannerPage() {
  const [formData, setFormData] = useState<ScheduleData>({
    timeframe: "",
    goal: "",
  })
  const [loading, setLoading] = useState(false)
  const [schedule, setSchedule] = useState<string | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [savedSchedules, setSavedSchedules] = useState<SavedSchedule[]>([])
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null)

  useEffect(() => {
    loadSavedSchedules()
  }, [])

  const loadSavedSchedules = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Get all saved schedules
      const { data: schedules, error } = await supabase
        .from("schedules")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading schedules:", error)
        return
      }

      if (schedules && schedules.length > 0) {
        setSavedSchedules(schedules)

        // Load the most recent schedule by default
        const latest = schedules[0]
        setSelectedScheduleId(latest.id)
        setFormData({
          timeframe: latest.timeframe.toString(),
          goal: latest.goal,
        })
        setSchedule(latest.schedule_content)

        // Generate calendar events for the saved schedule
        generateCalendarEvents(latest.timeframe)
      }
    } catch (error) {
      console.error("Error loading saved schedules:", error)
    }
  }

  const loadSpecificSchedule = (scheduleId: string) => {
    const selectedSchedule = savedSchedules.find((s) => s.id === scheduleId)
    if (selectedSchedule) {
      setSelectedScheduleId(scheduleId)
      setFormData({
        timeframe: selectedSchedule.timeframe.toString(),
        goal: selectedSchedule.goal,
      })
      setSchedule(selectedSchedule.schedule_content)
      generateCalendarEvents(selectedSchedule.timeframe)
    }
  }

  const deleteSchedule = async (scheduleId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("schedules").delete().eq("id", scheduleId)

      if (error) {
        console.error("Error deleting schedule:", error)
        return
      }

      // Reload schedules
      await loadSavedSchedules()

      // If we deleted the currently selected schedule, clear the form
      if (selectedScheduleId === scheduleId) {
        setSelectedScheduleId(null)
        setFormData({ timeframe: "", goal: "" })
        setSchedule(null)
        setEvents([])
      }
    } catch (error) {
      console.error("Error deleting schedule:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.timeframe || !formData.goal || loading) return

    setLoading(true)
    setSchedule(null) // Clear current schedule
    setEvents([]) // Clear current events

    try {
      const response = await fetch("/api/schedule-planner", {
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

      setSchedule(data.schedule)

      // Generate more frequent calendar events
      generateCalendarEvents(Number.parseInt(formData.timeframe))

      // Reload saved schedules to get the latest
      setTimeout(() => {
        loadSavedSchedules()
      }, 1000)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateCalendarEvents = (months: number) => {
    const sampleEvents: CalendarEvent[] = []
    const startDate = new Date()
    const totalDays = months * 30

    // Create different task categories based on the goal
    const taskCategories = {
      research: [
        "Research 3 colleges online",
        "Compare admission requirements",
        "Check application deadlines",
        "Look up financial aid options",
        "Read college reviews",
      ],
      essays: [
        "Brainstorm essay topics",
        "Write essay outline",
        "Draft first paragraph",
        "Complete first draft",
        "Revise and edit essay",
      ],
      applications: [
        "Fill out personal info section",
        "Complete activities section",
        "Request recommendation letters",
        "Submit test scores",
        "Review application draft",
      ],
      preparation: [
        "Practice interview questions",
        "Prepare for SAT/ACT",
        "Study for 2 hours",
        "Complete practice test",
        "Review weak areas",
      ],
      planning: [
        "Create college list",
        "Set weekly goals",
        "Organize documents",
        "Schedule campus visits",
        "Meet with counselor",
      ],
    }

    // Generate events every 2-3 days instead of weekly
    let dayCounter = 0
    while (dayCounter < totalDays) {
      const eventDate = new Date(startDate)
      eventDate.setDate(startDate.getDate() + dayCounter)

      // Skip weekends for some tasks
      const isWeekend = eventDate.getDay() === 0 || eventDate.getDay() === 6

      if (!isWeekend || Math.random() > 0.7) {
        // Choose task category based on timeline progression
        const progress = dayCounter / totalDays
        let category: keyof typeof taskCategories

        if (progress < 0.3) {
          category = Math.random() > 0.5 ? "research" : "planning"
        } else if (progress < 0.6) {
          category = Math.random() > 0.5 ? "essays" : "preparation"
        } else {
          category = Math.random() > 0.5 ? "applications" : "essays"
        }

        const tasks = taskCategories[category]
        const randomTask = tasks[Math.floor(Math.random() * tasks.length)]

        // Determine priority based on timeline
        let priority: "high" | "medium" | "low" = "medium"
        if (progress > 0.8) priority = "high"
        else if (progress < 0.3) priority = "low"

        sampleEvents.push({
          id: `event-${dayCounter}`,
          title: randomTask,
          date: eventDate,
          completed: false,
          description: `Day ${dayCounter + 1} task for your college prep journey`,
          priority,
        })
      }

      // Increment by 2-4 days for better spacing
      dayCounter += Math.floor(Math.random() * 3) + 2
    }

    setEvents(sampleEvents)
  }

  const toggleEventCompletion = (eventId: string) => {
    setEvents(events.map((event) => (event.id === eventId ? { ...event, completed: !event.completed } : event)))
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => event.date.toDateString() === date.toDateString())
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getPriorityColor = (priority: "high" | "medium" | "low", completed: boolean) => {
    if (completed) return "bg-green-100 text-green-800 line-through"

    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-blue-100 text-blue-800"
      case "low":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-28 border border-gray-200 bg-gray-50"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayEvents = getEventsForDate(date)
      const isToday = date.toDateString() === new Date().toDateString()
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()

      days.push(
        <div
          key={day}
          className={`h-28 border border-gray-200 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
            isToday ? "bg-blue-50 border-blue-300" : ""
          } ${isSelected ? "bg-blue-100 border-blue-400" : ""}`}
          onClick={() => setSelectedDate(date)}
        >
          <div className={`text-sm font-medium mb-2 ${isToday ? "text-blue-600" : ""}`}>{day}</div>
          <div className="space-y-1 overflow-hidden">
            {dayEvents.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className={`text-xs p-1.5 rounded cursor-pointer transition-colors ${getPriorityColor(event.priority, event.completed)}`}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleEventCompletion(event.id)
                }}
                title={event.title} // Full text on hover
              >
                <div className="leading-tight break-words">
                  {event.title.length > 20 ? `${event.title.substring(0, 20)}...` : event.title}
                </div>
              </div>
            ))}
            {dayEvents.length > 2 && <div className="text-xs text-gray-500 px-1">+{dayEvents.length - 2} more</div>}
          </div>
        </div>,
      )
    }

    return days
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Schedule Planner</h2>
        <p className="text-muted-foreground">Create a personalized timeline to achieve your college prep goals</p>
      </div>

      {/* Saved Schedules Section */}
      {savedSchedules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Your Saved Schedules ({savedSchedules.length})
            </CardTitle>
            <CardDescription>Load a previous schedule or create a new one</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {savedSchedules.map((savedSchedule) => (
                <div
                  key={savedSchedule.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                    selectedScheduleId === savedSchedule.id ? "bg-blue-50 border-blue-300" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0" onClick={() => loadSpecificSchedule(savedSchedule.id)}>
                      <h4 className="font-medium text-sm mb-1 truncate">{savedSchedule.goal}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <span>{savedSchedule.timeframe} months</span>
                        <span>•</span>
                        <span>{new Date(savedSchedule.created_at).toLocaleDateString()}</span>
                      </div>
                      {selectedScheduleId === savedSchedule.id && (
                        <div className="text-xs text-blue-600 font-medium">Currently loaded</div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteSchedule(savedSchedule.id)
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
              <Target className="h-5 w-5" />
              Goal Setting
            </CardTitle>
            <CardDescription>Tell us what you want to accomplish and when</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Timeframe</Label>
                <Select
                  value={formData.timeframe}
                  onValueChange={(value) => setFormData({ ...formData, timeframe: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Month</SelectItem>
                    <SelectItem value="2">2 Months</SelectItem>
                    <SelectItem value="3">3 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal">Goal Description</Label>
                <Textarea
                  id="goal"
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  placeholder="Describe what you want to accomplish (e.g., complete college applications, improve SAT scores, write personal essays)"
                  className="min-h-[100px]"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !formData.timeframe || !formData.goal}>
                {loading ? "Generating Schedule..." : "Create New Schedule"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Overview
            </CardTitle>
            <CardDescription>AI-generated timeline based on your goals</CardDescription>
          </CardHeader>
          <CardContent>
            {!schedule && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>
                  {savedSchedules.length > 0
                    ? "Select a saved schedule or create a new one"
                    : "Fill out the form to generate your personalized schedule"}
                </p>
              </div>
            )}
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Creating your schedule...</p>
              </div>
            )}
            {schedule && (
              <div className="prose prose-sm max-w-none max-h-64 overflow-y-auto">
                <ReactMarkdown>{schedule}</ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Interactive Calendar
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-lg font-medium">
                  {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
                <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Click on tasks to mark them as complete.
              <span className="ml-2">
                <span className="inline-block w-3 h-3 bg-red-100 rounded mr-1"></span>High Priority
                <span className="inline-block w-3 h-3 bg-blue-100 rounded mr-1 ml-3"></span>Medium Priority
                <span className="inline-block w-3 h-3 bg-gray-100 rounded mr-1 ml-3"></span>Low Priority
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {events.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-blue-900">
                    📊 This Month:{" "}
                    {
                      events.filter((e) => {
                        const eventMonth = e.date.getMonth()
                        const currentMonth = currentDate.getMonth()
                        const eventYear = e.date.getFullYear()
                        const currentYear = currentDate.getFullYear()
                        return eventMonth === currentMonth && eventYear === currentYear
                      }).length
                    }{" "}
                    tasks scheduled
                  </span>
                  <span className="text-blue-700">
                    {
                      events.filter((e) => {
                        const eventMonth = e.date.getMonth()
                        const currentMonth = currentDate.getMonth()
                        const eventYear = e.date.getFullYear()
                        const currentYear = currentDate.getFullYear()
                        return eventMonth === currentMonth && eventYear === currentYear && e.completed
                      }).length
                    }{" "}
                    completed
                  </span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium border-b border-gray-200">
                  {day}
                </div>
              ))}
              {renderCalendar()}
            </div>

            {selectedDate && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium mb-3 text-lg">
                  📅{" "}
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h4>
                {getEventsForDate(selectedDate).length > 0 ? (
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground mb-3">
                      {getEventsForDate(selectedDate).length} task
                      {getEventsForDate(selectedDate).length !== 1 ? "s" : ""} scheduled
                    </div>
                    {getEventsForDate(selectedDate).map((event, index) => (
                      <div key={event.id} className="flex items-start gap-3 p-3 bg-white border rounded-lg shadow-sm">
                        <input
                          type="checkbox"
                          checked={event.completed}
                          onChange={() => toggleEventCompletion(event.id)}
                          className="rounded mt-1 w-4 h-4"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h5
                              className={`font-medium text-sm leading-relaxed ${event.completed ? "line-through text-gray-500" : "text-gray-900"}`}
                            >
                              {event.title}
                            </h5>
                            <span
                              className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                                event.priority === "high"
                                  ? "bg-red-100 text-red-700"
                                  : event.priority === "medium"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {event.priority}
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{event.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span>
                              Task {index + 1} of {getEventsForDate(selectedDate).length}
                            </span>
                            {event.completed && <span className="text-green-600 font-medium">✓ Completed</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        💡 <strong>Tip:</strong> Click the checkbox next to each task to mark it as complete. Completed
                        tasks will show with a strikethrough and green checkmark.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🎯</div>
                    <p className="text-sm text-muted-foreground">No tasks scheduled for this day</p>
                    <p className="text-xs text-muted-foreground mt-1">Take a well-deserved break!</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {schedule && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Progress Summary
            </CardTitle>
            <CardDescription>Your complete {formData.timeframe}-month action plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{formData.timeframe}</div>
                <div className="text-sm text-muted-foreground">Months to Goal</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{events.length}</div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{events.filter((e) => e.completed).length}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round((events.filter((e) => e.completed).length / events.length) * 100) || 0}%
                </div>
                <div className="text-sm text-muted-foreground">Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
