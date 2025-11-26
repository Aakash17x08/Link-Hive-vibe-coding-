"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface CreateApplyModalProps {
  onClose: () => void
  onCreate: (title: string, date: string, description: string, role: string) => void
}

export default function CreateApplyModal({ onClose, onCreate }: CreateApplyModalProps) {
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [description, setDescription] = useState("")
  const [role, setRole] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && date.trim() && role.trim()) {
      onCreate(title, date, description, role)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full animate-in zoom-in-95 duration-200 p-6">
        <h2 className="text-xl font-semibold text-card-foreground mb-4">Create Application Entry</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apply-title" className="block text-sm font-medium text-card-foreground mb-2">
              Company/Position Title
            </label>
            <Input
              id="apply-title"
              placeholder="e.g., Google - Senior Developer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="apply-date" className="block text-sm font-medium text-card-foreground mb-2">
              Application Date
            </label>
            <Input
              id="apply-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="apply-role" className="block text-sm font-medium text-card-foreground mb-2">
              Role
            </label>
            <Input
              id="apply-role"
              placeholder="e.g., Senior Developer, Product Manager"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="apply-description" className="block text-sm font-medium text-card-foreground mb-2">
              Description (Optional)
            </label>
            <Textarea
              id="apply-description"
              placeholder="Add notes about this application..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full"
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!title.trim() || !date.trim() || !role.trim()}>
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
