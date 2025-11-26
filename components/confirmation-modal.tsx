"use client"

import { Button } from "@/components/ui/button"

interface ConfirmationModalProps {
  type: "download" | "delete"
  onConfirm: () => void
  onCancel: () => void
  data?: any
}

export default function ConfirmationModal({ type, onConfirm, onCancel, data }: ConfirmationModalProps) {
  let title = ""
  let message = ""
  let confirmText = ""

  if (type === "download") {
    if (data.type === "all") {
      title = "Download All Links?"
      message = "This will download all your links from all sections as a text file."
      confirmText = "Download"
    } else if (data.type === "section") {
      title = `Download "${data.section.name}"?`
      message = `This will download all ${data.section.links.length} links from this section as a text file.`
      confirmText = "Download"
    }
  } else if (type === "delete") {
    if (data.type === "link") {
      title = "Delete Link?"
      message = "This action cannot be undone. Are you sure you want to delete this link?"
      confirmText = "Delete"
    } else if (data.type === "section") {
      title = "Delete Section?"
      message = "This will delete the entire section and all its links. This action cannot be undone."
      confirmText = "Delete"
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full animate-in zoom-in-95 duration-200 p-6">
        <h2 className="text-xl font-semibold text-card-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground mb-6">{message}</p>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm} variant={type === "delete" ? "destructive" : "default"}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
