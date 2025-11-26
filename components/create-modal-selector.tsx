"use client"
import { Button } from "@/components/ui/button"
import { Briefcase, FileText } from "lucide-react"

interface CreateModalSelectorProps {
  onSelectSection: () => void
  onSelectApply: () => void
  onClose: () => void
}

export default function CreateModalSelector({ onSelectSection, onSelectApply, onClose }: CreateModalSelectorProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full animate-in zoom-in-95 duration-200 p-6">
        <h2 className="text-xl font-semibold text-card-foreground mb-6">What would you like to create?</h2>

        <div className="space-y-3">
          <button
            onClick={onSelectSection}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-lg border border-border hover:bg-muted transition-colors text-left"
          >
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <div className="font-medium text-foreground">Section</div>
              <div className="text-xs text-muted-foreground">Organize your links</div>
            </div>
          </button>

          <button
            onClick={onSelectApply}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-lg border border-border hover:bg-muted transition-colors text-left"
          >
            <Briefcase className="w-5 h-5 text-primary" />
            <div>
              <div className="font-medium text-foreground">Apply</div>
              <div className="text-xs text-muted-foreground">Track job applications</div>
            </div>
          </button>
        </div>

        <Button variant="outline" onClick={onClose} className="w-full mt-4 bg-transparent">
          Cancel
        </Button>
      </div>
    </div>
  )
}
