"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface Link {
  id: string
  sectionId: string
  url: string
  name: string
  description: string
  favicon?: string
}

interface EditLinkModalProps {
  link: Link
  onClose: () => void
  onSave: (url: string, name: string, description: string) => void
}

export default function EditLinkModal({ link, onClose, onSave }: EditLinkModalProps) {
  const [url, setUrl] = useState(link.url)
  const [name, setName] = useState(link.name)
  const [description, setDescription] = useState(link.description)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!url.trim() || !name.trim()) {
      setError("URL and name are required")
      return
    }

    try {
      new URL(url)
    } catch (e) {
      setError("Please enter a valid URL")
      return
    }

    onSave(url, name, description)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full animate-in zoom-in-95 duration-200 p-6">
        <h2 className="text-xl font-semibold text-card-foreground mb-4">Edit Link</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">{error}</div>}

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-card-foreground mb-2">
              Website URL
            </label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-card-foreground mb-2">
              Custom Name
            </label>
            <Input
              id="name"
              placeholder="e.g., My Favorite Tool"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-card-foreground mb-2">
              Short Description <span className="text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              id="description"
              placeholder="1-2 line description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
