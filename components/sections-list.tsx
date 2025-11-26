"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, ChevronUp, Plus, Trash2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
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
}

interface SectionsListProps {
  sections: Section[]
  onAddLink: (sectionId: string) => void
  onDeleteLink: (sectionId: string, linkId: string) => void
  onDeleteSection: (sectionId: string) => void
  onReorderLinks?: (sectionId: string, reorderedLinks: Link[]) => void
  onDownloadSection?: (sectionId: string) => void
  onEditLink?: (sectionId: string, linkId: string) => void
  onReorderSections?: (reorderedSections: Section[]) => void
  allSections?: Section[]
}

export default function SectionsList({
  sections,
  onAddLink,
  onDeleteLink,
  onDeleteSection,
  onReorderLinks,
  onDownloadSection,
  onEditLink,
  onReorderSections,
  allSections = [],
}: SectionsListProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(sections.map((s) => s.id)))
  const [draggedLink, setDraggedLink] = useState<{
    sectionId: string
    linkId: string
    index: number
  } | null>(null)
  const [draggedSection, setDraggedSection] = useState<string | null>(null)

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const handleDragStart = (sectionId: string, linkId: string, index: number) => {
    setDraggedLink({ sectionId, linkId, index })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetSectionId: string, targetIndex: number) => {
    e.preventDefault()
    if (!draggedLink) return

    // Only allow reordering within the same section
    if (draggedLink.sectionId !== targetSectionId) {
      setDraggedLink(null)
      return
    }

    const section = sections.find((s) => s.id === targetSectionId)
    if (!section) return

    const newLinks = [...section.links]
    const draggedItem = newLinks[draggedLink.index]
    newLinks.splice(draggedLink.index, 1)
    newLinks.splice(targetIndex, 0, draggedItem)

    onReorderLinks?.(targetSectionId, newLinks)
    setDraggedLink(null)
  }

  const handleDragStartSection = (sectionId: string) => {
    setDraggedSection(sectionId)
  }

  const handleDragOverSection = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDropSection = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault()
    if (!draggedSection || draggedSection === targetSectionId) {
      setDraggedSection(null)
      return
    }

    const draggedIndex = allSections.findIndex((s) => s.id === draggedSection)
    const targetIndex = allSections.findIndex((s) => s.id === targetSectionId)

    const newSections = [...allSections]
    const draggedItem = newSections[draggedIndex]
    newSections.splice(draggedIndex, 1)
    newSections.splice(targetIndex, 0, draggedItem)

    onReorderSections?.(newSections)
    setDraggedSection(null)
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div
          key={section.id}
          draggable
          onDragStart={() => handleDragStartSection(section.id)}
          onDragOver={handleDragOverSection}
          onDrop={(e) => handleDropSection(e, section.id)}
          className={`bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-move ${
            draggedSection === section.id ? "opacity-50" : ""
          }`}
        >
          {/* ... existing section header and content ... */}
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => toggleSection(section.id)}
          >
            <div className="flex items-center gap-3">
              {expandedSections.has(section.id) ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
              <h3 className="text-lg font-semibold text-card-foreground">{section.name}</h3>
              <span className="text-sm text-muted-foreground">({section.links.length})</span>
            </div>

            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <Button size="sm" variant="ghost" onClick={() => onAddLink(section.id)} className="gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Link</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDeleteSection(section.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {expandedSections.has(section.id) && (
            <div className="border-t border-border bg-muted/20 p-4">
              {section.links.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No links yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.links.map((link, index) => (
                    <div
                      key={link.id}
                      draggable
                      onDragStart={() => handleDragStart(section.id, link.id, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, section.id, index)}
                      className={`relative cursor-move transition-all ${
                        draggedLink?.linkId === link.id ? "opacity-50" : ""
                      }`}
                    >
                      <div className="absolute top-2 left-2 z-20 opacity-0 hover:opacity-100 transition-opacity">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <LinkCard
                        link={link}
                        onDelete={() => onDeleteLink(section.id, link.id)}
                        onEdit={() => onEditLink?.(section.id, link.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
