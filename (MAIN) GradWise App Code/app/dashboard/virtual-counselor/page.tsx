"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, Bot, User, History, Plus, AlertCircle } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { createClient } from "@/lib/supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

interface ChatSession {
  session_id: string
  last_message: string
  timestamp: Date
  message_count: number
}

export default function VirtualCounselorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your virtual college counselor. I'm here to help you navigate the college admissions process. What questions do you have about college prep, applications, or anything related to your educational journey?",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string>("")
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [tableExists, setTableExists] = useState(true)
  const [showTableWarning, setShowTableWarning] = useState(false)

  useEffect(() => {
    // Generate a new session ID when component mounts
    setCurrentSessionId(crypto.randomUUID())
    loadChatHistory()
  }, [])

  const checkTableExists = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("chat_sessions").select("id").limit(1)

      if (error && error.message.includes("does not exist")) {
        setTableExists(false)
        setShowTableWarning(true)
        return false
      }
      return true
    } catch (error) {
      console.error("Error checking table existence:", error)
      setTableExists(false)
      setShowTableWarning(true)
      return false
    }
  }

  const saveChatMessage = async (content: string, isUser: boolean) => {
    // Skip saving if table doesn't exist
    if (!tableExists) {
      console.log("Skipping chat save - table doesn't exist yet")
      return
    }

    try {
      const supabase = createClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("Error getting user:", userError)
        return
      }

      if (!user) {
        console.error("No user found")
        return
      }

      console.log("Saving message:", {
        user_id: user.id,
        session_id: currentSessionId,
        message_type: isUser ? "user" : "assistant",
      })

      const { data, error } = await supabase.from("chat_sessions").insert({
        user_id: user.id,
        session_id: currentSessionId,
        message_type: isUser ? "user" : "assistant",
        content: content,
      })

      if (error) {
        console.error("Error saving chat message:", error)
        if (error.message.includes("does not exist")) {
          setTableExists(false)
          setShowTableWarning(true)
        }
      } else {
        console.log("Message saved successfully:", data)
      }
    } catch (error) {
      console.error("Error in saveChatMessage:", error)
    }
  }

  const loadChatHistory = async () => {
    try {
      const exists = await checkTableExists()
      if (!exists) {
        console.log("Chat sessions table doesn't exist yet - skipping history load")
        return
      }

      const supabase = createClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error("Error getting user for chat history:", userError)
        return
      }

      console.log("Loading chat history for user:", user.id)

      // Get chat sessions grouped by session_id
      const { data: sessions, error } = await supabase
        .from("chat_sessions")
        .select("session_id, content, timestamp, message_type")
        .eq("user_id", user.id)
        .order("timestamp", { ascending: false })

      if (error) {
        console.error("Error loading chat sessions:", error)
        if (error.message.includes("does not exist")) {
          setTableExists(false)
          setShowTableWarning(true)
        }
        return
      }

      console.log("Loaded sessions:", sessions)

      if (sessions && sessions.length > 0) {
        // Group messages by session_id and get the last message for each session
        const sessionMap = new Map<string, ChatSession>()

        sessions.forEach((msg) => {
          const sessionId = msg.session_id
          if (!sessionMap.has(sessionId)) {
            sessionMap.set(sessionId, {
              session_id: sessionId,
              last_message: msg.content,
              timestamp: new Date(msg.timestamp),
              message_count: 1,
            })
          } else {
            const session = sessionMap.get(sessionId)!
            session.message_count++
            // Keep the most recent message as last_message
            if (new Date(msg.timestamp) > session.timestamp) {
              session.last_message = msg.content
              session.timestamp = new Date(msg.timestamp)
            }
          }
        })

        const sortedSessions = Array.from(sessionMap.values()).sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
        )

        console.log("Processed sessions:", sortedSessions)
        setChatSessions(sortedSessions)
      }
    } catch (error) {
      console.error("Error loading chat history:", error)
    }
  }

  const loadChatSession = async (sessionId: string) => {
    if (!tableExists) return

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: sessionMessages } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("session_id", sessionId)
        .order("timestamp", { ascending: true })

      if (sessionMessages) {
        const loadedMessages: Message[] = sessionMessages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          isUser: msg.message_type === "user",
          timestamp: new Date(msg.timestamp),
        }))

        setMessages(loadedMessages)
        setCurrentSessionId(sessionId)
      }
    } catch (error) {
      console.error("Error loading chat session:", error)
    }
  }

  const startNewChat = () => {
    const newSessionId = crypto.randomUUID()
    setCurrentSessionId(newSessionId)
    setMessages([
      {
        id: "1",
        content:
          "Hello! I'm your virtual college counselor. I'm here to help you navigate the college admissions process. What questions do you have about college prep, applications, or anything related to your educational journey?",
        isUser: false,
        timestamp: new Date(),
      },
    ])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])

    // Save user message if table exists
    if (tableExists) {
      console.log("Saving user message...")
      await saveChatMessage(input, true)
    }

    const userInput = input
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/virtual-counselor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userInput, sessionId: currentSessionId }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON")
      }

      const data = await response.json()

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || "I apologize, but I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])

      // Save AI response if table exists
      if (tableExists) {
        console.log("Saving AI response...")
        await saveChatMessage(aiMessage.content, false)

        // Reload chat history to update the sidebar
        setTimeout(() => {
          loadChatHistory()
        }, 1000)
      }
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Virtual Counselor</h2>
        <p className="text-muted-foreground">Get personalized guidance for your college journey</p>
      </div>

      {showTableWarning && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> Chat history is temporarily unavailable. Your conversations will still work, but
            won't be saved until the database is fully set up. Please run the SQL scripts in your Supabase dashboard to
            enable chat history.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-4">
        {/* Chat History Sidebar */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Chat History
                </CardTitle>
                <Button size="sm" variant="outline" onClick={startNewChat}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {tableExists &&
                    chatSessions.map((session) => (
                      <div
                        key={session.session_id}
                        className={`p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors ${
                          session.session_id === currentSessionId ? "bg-accent border-blue-300" : ""
                        }`}
                        onClick={() => loadChatSession(session.session_id)}
                      >
                        <div className="text-sm font-medium mb-1">
                          {session.last_message.length > 40
                            ? `${session.last_message.substring(0, 40)}...`
                            : session.last_message}
                        </div>
                        <div className="text-xs text-muted-foreground flex justify-between">
                          <span>{session.message_count} messages</span>
                          <span>{session.timestamp.toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  {(!tableExists || chatSessions.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{!tableExists ? "Chat history unavailable" : "No chat history yet"}</p>
                      {!tableExists && <p className="text-xs mt-1">Database setup required</p>}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Area */}
        <div className="md:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat with Your AI Counselor
              </CardTitle>
              <CardDescription>
                Ask questions about college applications, financial aid, essays, and more
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex gap-3 ${message.isUser ? "justify-end" : "justify-start"}`}>
                      <div className={`flex gap-3 max-w-[85%] ${message.isUser ? "flex-row-reverse" : "flex-row"}`}>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.isUser ? "bg-blue-600" : "bg-gray-600"
                          }`}
                        >
                          {message.isUser ? (
                            <User className="h-4 w-4 text-white" />
                          ) : (
                            <Bot className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div
                          className={`rounded-lg p-4 break-words ${
                            message.isUser ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          {message.isUser ? (
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          ) : (
                            <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-900 prose-strong:text-gray-900 prose-ul:text-gray-900 prose-ol:text-gray-900 prose-li:text-gray-900">
                              <ReactMarkdown
                                components={{
                                  h1: ({ children }) => (
                                    <h1 className="text-lg font-bold mb-2 text-gray-900">{children}</h1>
                                  ),
                                  h2: ({ children }) => (
                                    <h2 className="text-base font-semibold mb-2 text-gray-900">{children}</h2>
                                  ),
                                  h3: ({ children }) => (
                                    <h3 className="text-sm font-medium mb-1 text-gray-900">{children}</h3>
                                  ),
                                  p: ({ children }) => <p className="mb-2 text-gray-900 leading-relaxed">{children}</p>,
                                  ul: ({ children }) => (
                                    <ul className="list-disc list-inside mb-2 space-y-1 text-gray-900">{children}</ul>
                                  ),
                                  ol: ({ children }) => (
                                    <ol className="list-decimal list-inside mb-2 space-y-1 text-gray-900">
                                      {children}
                                    </ol>
                                  ),
                                  li: ({ children }) => <li className="text-gray-900">{children}</li>,
                                  strong: ({ children }) => (
                                    <strong className="font-semibold text-gray-900">{children}</strong>
                                  ),
                                  em: ({ children }) => <em className="italic text-gray-900">{children}</em>,
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about college prep..."
                  className="flex-1 min-h-[60px]"
                  disabled={loading}
                />
                <Button type="submit" disabled={loading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
