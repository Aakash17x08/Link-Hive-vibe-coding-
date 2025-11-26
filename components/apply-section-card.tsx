"use client"

import { Trash2, Calendar, Briefcase, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ApplyEntry {
  id: string
  title: string
  date: string
  description: string
  role: string
  createdAt: string
}

interface ApplySectionCardProps {
  entry: ApplyEntry
  onDelete: (id: string) => void
}

export default function ApplySectionCard({ entry, onDelete }: ApplySectionCardProps) {
  const formattedDate = new Date(entry.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-all duration-200 group">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4 text-primary" />
            <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
              {entry.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-2 mb-2 text-sm">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">{entry.role}</span>
          </div>

          {entry.description && <p className="text-sm text-muted-foreground mt-2">{entry.description}</p>}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(entry.id)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete entry"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
