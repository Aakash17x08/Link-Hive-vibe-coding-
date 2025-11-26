"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Lock, ChevronDown, ChevronUp, Plus, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import LinkCard from "@/components/link-card"
import NextLink from "next/link"

interface Section {
  id: string
  name: string
  links: {
    id: string
    sectionId: string
    url: string
    name: string
    description: string
    favicon?: string
  }[]
  isPrivate?: boolean
}

const CORRECT_PASSWORD = "privacY"
const TIMEOUT_SECONDS = 5

export default function PrivacyPage() {
  const [sections, setSections] = useState<Section[]>([])
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [lockoutTime, setLockoutTime] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string>("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAddLinkModal, setShowAddLinkModal] = useState(false)
  const [showCreatePrivateSection, setShowCreatePrivateSection] = useState(false)
  const [wrongAttempts, setWrongAttempts] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem("linkhive-data")
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setSections(data.sections || [])
      } catch (e) {
        console.error("Failed to load data:", e)
      }
    }

    const lockoutData = localStorage.getItem("linkhive-privacy-lockout")
    if (lockoutData) {
      const data = JSON.parse(lockoutData)
      const now = Date.now()
      if (now < data.until) {
        setLockoutTime(data.until)
      } else {
        localStorage.removeItem("linkhive-privacy-lockout")
        setWrongAttempts(0)
      }
    }

    const saved_attempts = localStorage.getItem("linkhive-privacy-attempts")
    if (saved_attempts) {
      setWrongAttempts(Number.parseInt(saved_attempts))
    }
  }, [])

  useEffect(() => {
    if (!lockoutTime) return

    const interval = setInterval(() => {
      const now = Date.now()
      const remaining = lockoutTime - now

      if (remaining <= 0) {
        setLockoutTime(null)
        setTimeRemaining("")
        setWrongAttempts(0)
        localStorage.removeItem("linkhive-privacy-lockout")
        clearInterval(interval)
      } else {
        const minutes = Math.floor(remaining / 60000)
        const seconds = Math.floor((remaining % 60000) / 1000)
        setTimeRemaining(`${minutes}m ${seconds}s`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [lockoutTime])

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (lockoutTime) {
      return
    }

    if (passwordInput === CORRECT_PASSWORD) {
      setIsUnlocked(true)
      setPasswordInput("")
      setWrongAttempts(0)
      localStorage.removeItem("linkhive-privacy-attempts")
    } else {
      const newAttempts = wrongAttempts + 1
      setWrongAttempts(newAttempts)
      localStorage.setItem("linkhive-privacy-attempts", newAttempts.toString())

      if (newAttempts >= 3) {
        const until = Date.now() + TIMEOUT_SECONDS * 1000
        setLockoutTime(until)
        localStorage.setItem("linkhive-privacy-lockout", JSON.stringify({ until }))
      }

      setPasswordInput("")
    }
  }

  const privateSection = sections.find((s) => s.isPrivate)

  const handleCreatePrivateSection = () => {
    if (!privateSection) {
      const newSection: Section = {
        id: `private-${Date.now()}`,
        name: "Private",
        links: [],
        isPrivate: true,
      }
      const updatedSections = [...sections, newSection]
      setSections(updatedSections)
      localStorage.setItem(
        "linkhive-data",
        JSON.stringify({
          sections: updatedSections,
          isDark: localStorage.getItem("linkhive-data")
            ? JSON.parse(localStorage.getItem("linkhive-data")!).isDark
            : true,
          backgroundImage: localStorage.getItem("linkhive-data")
            ? JSON.parse(localStorage.getItem("linkhive-data")!).backgroundImage
            : "",
        }),
      )
    }
    setShowCreatePrivateSection(false)
  }

  const handleAddPrivateLink = (url: string, name: string, description: string) => {
    if (privateSection) {
      const updatedSections = sections.map((section) =>
        section.id === privateSection.id
          ? {
              ...section,
              links: [
                ...section.links,
                {
                  id: Date.now().toString(),
                  sectionId: privateSection.id,
                  url,
                  name,
                  description,
                },
              ],
            }
          : section,
      )
      setSections(updatedSections)
      localStorage.setItem(
        "linkhive-data",
        JSON.stringify({
          sections: updatedSections,
          isDark: JSON.parse(localStorage.getItem("linkhive-data") || "{}").isDark || true,
          backgroundImage: JSON.parse(localStorage.getItem("linkhive-data") || "{}").backgroundImage || "",
        }),
      )
    }
  }

  const handleDeletePrivateLink = (linkId: string) => {
    if (privateSection) {
      const updatedSections = sections.map((section) =>
        section.id === privateSection.id
          ? {
              ...section,
              links: section.links.filter((link) => link.id !== linkId),
            }
          : section,
      )
      setSections(updatedSections)
      localStorage.setItem(
        "linkhive-data",
        JSON.stringify({
          sections: updatedSections,
          isDark: JSON.parse(localStorage.getItem("linkhive-data") || "{}").isDark || true,
          backgroundImage: JSON.parse(localStorage.getItem("linkhive-data") || "{}").backgroundImage || "",
        }),
      )
    }
  }

  if (lockoutTime) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-lg border border-border shadow-lg p-8 max-w-md w-full text-center">
          <Lock className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-semibold text-destructive mb-3">Privacy Section Locked</h2>
          <p className="text-muted-foreground mb-4">Too many wrong password attempts.</p>
          <p className="text-lg font-mono text-destructive mb-6">Try again in: {timeRemaining}</p>
          <NextLink href="/">
            <Button variant="outline" className="w-full bg-transparent">
              Back to Home
            </Button>
          </NextLink>
        </div>
      </div>
    )
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-lg border border-border shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Private Section</h1>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <div className="flex gap-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  autoFocus
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={() => setShowPassword(!showPassword)} className="px-4">
                  {showPassword ? "Hide" : "Show"}
                </Button>
              </div>
              {wrongAttempts > 0 && wrongAttempts < 3 && (
                <p className="text-sm text-destructive mt-2">
                  Wrong password. {3 - wrongAttempts} attempt{3 - wrongAttempts !== 1 ? "s" : ""} remaining.
                </p>
              )}
            </div>

            {!privateSection && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCreatePrivateSection}
                className="w-full bg-transparent"
              >
                Create Private Section
              </Button>
            )}

            <Button type="submit" className="w-full">
              Unlock
            </Button>
          </form>

          <NextLink href="/">
            <Button variant="ghost" className="w-full mt-3 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </NextLink>
        </div>
      </div>
    )
  }

  if (!privateSection) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <NextLink href="/" className="mb-6 inline-block">
          <Button variant="outline" className="gap-2 bg-transparent">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </NextLink>

        <div className="bg-card rounded-lg border border-primary/50 shadow-sm overflow-hidden">
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors bg-primary/5"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-3">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-primary" />
              ) : (
                <ChevronDown className="w-5 h-5 text-primary" />
              )}
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Private</h2>
              <span className="text-sm text-muted-foreground">({privateSection.links.length})</span>
            </div>

            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <Button size="sm" variant="ghost" onClick={() => setShowAddLinkModal(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Link</span>
              </Button>
              <NextLink href="/">
                <Button size="sm" variant="ghost" className="gap-2">
                  <Lock className="w-4 h-4" />
                  <span className="hidden sm:inline">Lock</span>
                </Button>
              </NextLink>
            </div>
          </div>

          {isExpanded && (
            <div className="border-t border-border bg-muted/20 p-4">
              {privateSection.links.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No links yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {privateSection.links.map((link) => (
                    <LinkCard key={link.id} link={link} onDelete={() => handleDeletePrivateLink(link.id)} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {showAddLinkModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-card rounded-lg shadow-lg max-w-md w-full animate-in zoom-in-95 duration-200 p-6">
              <h2 className="text-xl font-semibold text-card-foreground mb-4">Add Link to Private</h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const url = formData.get("url") as string
                  const name = formData.get("name") as string
                  const description = formData.get("description") as string

                  if (url && name) {
                    handleAddPrivateLink(url, name, description)
                    setShowAddLinkModal(false)
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-card-foreground mb-2">
                    URL *
                  </label>
                  <Input id="url" name="url" placeholder="https://example.com" type="url" required />
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-card-foreground mb-2">
                    Name *
                  </label>
                  <Input id="name" name="name" placeholder="Link name" required />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-card-foreground mb-2">
                    Description (optional)
                  </label>
                  <Input id="description" name="description" placeholder="Add a note about this link" />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <Button variant="outline" onClick={() => setShowAddLinkModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Link</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
