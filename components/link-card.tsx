"use client"

import { useEffect, useState } from "react"
import { ExternalLink, Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Link {
  id: string
  sectionId: string
  url: string
  name: string
  description: string
  favicon?: string
}

interface LinkCardProps {
  link: Link
  onDelete: () => void
  onEdit: () => void
}

export default function LinkCard({ link, onDelete, onEdit }: LinkCardProps) {
  const [favicon, setFavicon] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFavicon = async () => {
      try {
        const domain = new URL(link.url).hostname
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
        setFavicon(faviconUrl)
      } catch (e) {
        console.error("Failed to fetch favicon:", e)
      } finally {
        setLoading(false)
      }
    }

    fetchFavicon()
  }, [link.url])

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-background rounded-lg border border-border p-4 hover:border-primary hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-3">
        {/* Favicon */}
        <div className="flex-shrink-0">
          {!loading && favicon ? (
            <img
              src={favicon || "/placeholder.svg"}
              alt={link.name}
              className="w-8 h-8 rounded"
              onError={() => setFavicon("")}
            />
          ) : (
            <div className="w-8 h-8 rounded bg-muted animate-pulse" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {link.name}
            </h4>
            <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {link.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{link.description}</p>}
        </div>

        {/* Delete Button */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              onEdit()
            }}
            className="text-primary hover:text-primary hover:bg-primary/10"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              onDelete()
            }}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </a>
  )
}
