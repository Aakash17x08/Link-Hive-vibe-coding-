"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CreateSectionModalProps {
  onClose: () => void
  onCreate: (name: string) => void
}

export default function CreateSectionModal({ onClose, onCreate }: CreateSectionModalProps) {
  const [name, setName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onCreate(name)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full animate-in zoom-in-95 duration-200 p-6">
        <h2 className="text-xl font-semibold text-card-foreground mb-4">Create New Section</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="section-name" className="block text-sm font-medium text-card-foreground mb-2">
              Section Name
            </label>
            <Input
              id="section-name"
              placeholder="e.g., Jobs, Tools, Courses"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="w-full"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!name.trim()}>
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
