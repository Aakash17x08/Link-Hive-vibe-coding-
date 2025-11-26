"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Lock, ChevronDown, ChevronUp, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import LinkCard from "./link-card"

interface Link {
  id: string
  sectionId: string
  url: string
  name: string
  description: string
  favicon?: string
}

interface Section {
  id: string
  name: string
  links: Link[]
  isPrivate?: boolean
}

interface PrivacySectionProps {
  sections: Section[]
  onAddLink: (url: string, name: string, description: string) => void
  onDeleteLink: (linkId: string) => void
  setSections: (sections: Section[]) => void
}

const CORRECT_PASSWORD = "privacY"
const TIMEOUT_MINUTES = 100

export default function PrivacySection({ sections, onAddLink, onDeleteLink, setSections }: PrivacySectionProps) {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [lockoutTime, setLockoutTime] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string>("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAddLinkModal, setShowAddLinkModal] = useState(false)
  const [showCreatePrivateSection, setShowCreatePrivateSection] = useState(false)
  const [wrongAttempts, setWrongAttempts] = useState(0)

  const privateSection = sections.find((s) => s.isPrivate)

  // Load lockout state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("linkhive-privacy-lockout")
    if (saved) {
      const lockoutData = JSON.parse(saved)
      const now = Date.now()
      if (now < lockoutData.until) {
        setLockoutTime(lockoutData.until)
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

  // Handle lockout countdown
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
        localStorage.removeItem("linkhive-privacy-attempts")
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
        const until = Date.now() + TIMEOUT_MINUTES * 60 * 1000
        setLockoutTime(until)
        localStorage.setItem("linkhive-privacy-lockout", JSON.stringify({ until }))
      }

      setPasswordInput("")
    }
  }

  const handleCreatePrivateSection = () => {
    if (!privateSection) {
      const newSection: Section = {
        id: `private-${Date.now()}`,
        name: "Private",
        links: [],
        isPrivate: true,
      }
      setSections([...sections, newSection])
    }
    setShowCreatePrivateSection(false)
  }

  const handleDeletePrivateLink = (linkId: string) => {
    onDeleteLink(linkId)
  }

  if (lockoutTime) {
    return (
      <div className="mb-6 bg-destructive/10 border border-destructive rounded-lg p-6 text-center">
        <Lock className="w-12 h-12 mx-auto mb-3 text-destructive" />
        <h3 className="text-lg font-semibold text-destructive mb-2">Privacy Section Locked</h3>
        <p className="text-muted-foreground mb-2">Too many wrong password attempts.</p>
        <p className="text-sm font-mono text-destructive">Try again in: {timeRemaining}</p>
      </div>
    )
  }

  if (!isUnlocked) {
    return (
      <div className="mb-6 bg-card rounded-lg border border-border shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold text-card-foreground">Private Section</h3>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Password</label>
            <div className="flex gap-2">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password to access private section"
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
      </div>
    )
  }

  if (!privateSection) {
    return null
  }

  return (
    <div className="mb-6 bg-card rounded-lg border border-primary/50 shadow-sm overflow-hidden">
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
          <h3 className="text-lg font-semibold text-card-foreground">Private</h3>
          <span className="text-sm text-muted-foreground">({privateSection.links.length})</span>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="ghost" onClick={() => setShowAddLinkModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Link</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsUnlocked(false)}
            className="gap-2"
            title="Lock private section"
          >
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Lock</span>
          </Button>
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

      {/* Add Link Modal */}
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
                  onAddLink(url, name, description)
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
  )
}
