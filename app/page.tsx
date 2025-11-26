"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react" // import from lucide-react instead of custom icons
import TopNavigation from "@/components/top-navigation"
import SectionsList from "@/components/sections-list"
import CreateSectionModal from "@/components/create-section-modal"
import AddLinkModal from "@/components/add-link-modal"
import ConfirmationModal from "@/components/confirmation-modal"
import EditLinkModal from "@/components/edit-link-modal"
import CreateModalSelector from "@/components/create-modal-selector"
import CreateApplyModal from "@/components/create-apply-modal"
import ApplySectionCard from "@/components/apply-section-card"

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

interface ApplyEntry {
  id: string
  title: string
  date: string
  description: string
  role: string
  createdAt: string
}

export default function Home() {
  const [sections, setSections] = useState<Section[]>([])
  const [applyEntries, setApplyEntries] = useState<ApplyEntry[]>([])
  const [isDark, setIsDark] = useState(true)
  const [backgroundImage, setBackgroundImage] = useState<string>("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showModalSelector, setShowModalSelector] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [showAddLinkModal, setShowAddLinkModal] = useState(false)
  const [selectedSectionId, setSelectedSectionId] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [applySearchQuery, setApplySearchQuery] = useState<string>("") // added apply search state
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationType, setConfirmationType] = useState<"download" | "delete">("download")
  const [confirmationData, setConfirmationData] = useState<any>(null)
  const [showEditLinkModal, setShowEditLinkModal] = useState(false)
  const [editingLink, setEditingLink] = useState<Link | null>(null)
  const [editingSectionId, setEditingSectionId] = useState<string>("")
  const [draggedSection, setDraggedSection] = useState<string | null>(null)
  const [draggedApply, setDraggedApply] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem("linkhive-data")
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setSections(data.sections || [])
        setApplyEntries(data.applyEntries || [])
        setIsDark(data.isDark !== false)
        setBackgroundImage(data.backgroundImage || "")
      } catch (e) {
        console.error("Failed to load data:", e)
      }
    } else {
      setIsDark(true)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      "linkhive-data",
      JSON.stringify({
        sections,
        applyEntries,
        isDark,
        backgroundImage,
      }),
    )
  }, [sections, applyEntries, isDark, backgroundImage])

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (isDark) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  }, [isDark])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  const filteredSections = sections
    .filter((s) => !s.isPrivate)
    .map((section) => ({
      ...section,
      links: section.links.filter(
        (link) =>
          link.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          link.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          link.url.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((section) => section.name.toLowerCase().includes(searchQuery.toLowerCase()) || section.links.length > 0)

  const filteredApplyEntries = applyEntries.filter(
    (entry) =>
      entry.title.toLowerCase().includes(applySearchQuery.toLowerCase()) ||
      entry.role.toLowerCase().includes(applySearchQuery.toLowerCase()) ||
      entry.description.toLowerCase().includes(applySearchQuery.toLowerCase()),
  )

  const handleCreateSection = (name: string) => {
    const newSection: Section = {
      id: Date.now().toString(),
      name,
      links: [],
    }
    setSections([...sections, newSection])
  }

  const handleCreateApplyEntry = (title: string, date: string, description: string, role: string) => {
    const newEntry: ApplyEntry = {
      id: Date.now().toString(),
      title,
      date,
      description,
      role,
      createdAt: new Date().toISOString(),
    }
    setApplyEntries([newEntry, ...applyEntries])
  }

  const handleDeleteApplyEntry = (id: string) => {
    setApplyEntries(applyEntries.filter((entry) => entry.id !== id))
  }

  const handleAddLink = (url: string, name: string, description: string) => {
    setSections(
      sections.map((section) =>
        section.id === selectedSectionId
          ? {
              ...section,
              links: [
                ...section.links,
                {
                  id: Date.now().toString(),
                  sectionId: selectedSectionId,
                  url,
                  name,
                  description,
                },
              ],
            }
          : section,
      ),
    )
  }

  const handleOpenAddLinkModal = (sectionId: string) => {
    setSelectedSectionId(sectionId)
    setShowAddLinkModal(true)
  }

  const handleOpenCreateModal = () => {
    setShowModalSelector(true)
  }

  const downloadPDF = (filename: string, content: string) => {
    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content))
    element.setAttribute("download", filename)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleDownloadAllLinks = (sectionId?: string) => {
    setConfirmationType("download")
    setConfirmationData({ type: sectionId ? "section" : "all", sectionId })
    setShowConfirmation(true)
  }

  const confirmDownloadAllLinks = () => {
    let content = "LinkHive - All Links\n"
    content += "====================\n\n"

    sections
      .filter((s) => !s.isPrivate)
      .forEach((section) => {
        if (section.links.length > 0) {
          content += `${section.name}\n`
          content += `${"-".repeat(section.name.length)}\n\n`

          section.links.forEach((link) => {
            content += `• ${link.name}\n`
            content += `  URL: ${link.url}\n`
            if (link.description) {
              content += `  Description: ${link.description}\n`
            }
            content += "\n"
          })

          content += "\n"
        }
      })

    downloadPDF("LinkHive-all-links.txt", content)
  }

  const confirmDownloadSection = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    let content = `${section.name}\n`
    content += `${"=".repeat(section.name.length)}\n\n`

    section.links.forEach((link) => {
      content += `• ${link.name}\n`
      content += `  URL: ${link.url}\n`
      if (link.description) {
        content += `  Description: ${link.description}\n`
      }
      content += "\n"
    })

    downloadPDF(`${section.name}.txt`, content)
  }

  const handleConfirm = () => {
    if (confirmationType === "download") {
      if (confirmationData.type === "all") {
        confirmDownloadAllLinks()
      } else if (confirmationData.type === "section" && confirmationData.sectionId) {
        confirmDownloadSection(confirmationData.sectionId)
      }
    } else if (confirmationType === "delete") {
      if (confirmationData.type === "link") {
        confirmDeleteLink(confirmationData.sectionId, confirmationData.linkId)
      } else if (confirmationData.type === "section") {
        confirmDeleteSection(confirmationData.sectionId)
      }
    }
    setShowConfirmation(false)
  }

  const handleDownloadSection = (sectionId: string) => {
    setConfirmationType("download")
    setConfirmationData({ type: "section", sectionId })
    setShowConfirmation(true)
  }

  const handleReorderLinks = (sectionId: string, reorderedLinks: Link[]) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              links: reorderedLinks,
            }
          : section,
      ),
    )
  }

  const handleEditLink = (sectionId: string, linkId: string) => {
    const section = sections.find((s) => s.id === sectionId)
    const link = section?.links.find((l) => l.id === linkId)
    if (link) {
      setEditingLink(link)
      setEditingSectionId(sectionId)
      setShowEditLinkModal(true)
    }
  }

  const handleSaveEditedLink = (url: string, name: string, description: string) => {
    if (!editingLink) return

    setSections(
      sections.map((section) =>
        section.id === editingSectionId
          ? {
              ...section,
              links: section.links.map((link) =>
                link.id === editingLink.id
                  ? {
                      ...link,
                      url,
                      name,
                      description,
                    }
                  : link,
              ),
            }
          : section,
      ),
    )
    setShowEditLinkModal(false)
    setEditingLink(null)
    setEditingSectionId("")
  }

  const handleDeleteLink = (sectionId: string, linkId: string) => {
    setConfirmationType("delete")
    setConfirmationData({ type: "link", sectionId, linkId })
    setShowConfirmation(true)
  }

  const confirmDeleteLink = (sectionId: string, linkId: string) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              links: section.links.filter((link) => link.id !== linkId),
            }
          : section,
      ),
    )
  }

  const handleDeleteSection = (sectionId: string) => {
    setConfirmationType("delete")
    setConfirmationData({ type: "section", sectionId })
    setShowConfirmation(true)
  }

  const confirmDeleteSection = (sectionId: string) => {
    setSections(sections.filter((section) => section.id !== sectionId))
  }

  const handleBackgroundUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setBackgroundImage(result)
    }
    reader.readAsDataURL(file)
  }

  const handleResetBackground = () => {
    setBackgroundImage("")
  }

  const handleReorderSections = (reorderedSections: Section[]) => {
    setSections(reorderedSections)
  }

  const handleReorderApplyEntries = (reorderedEntries: ApplyEntry[]) => {
    setApplyEntries(reorderedEntries)
  }

  return (
    <div
      className="min-h-screen transition-all duration-300"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay to ensure readability */}
      <div className="fixed inset-0 bg-black/40 dark:bg-black/50 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        <TopNavigation
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onCreateSection={handleOpenCreateModal}
          onUploadBackground={handleBackgroundUpload}
          onResetBackground={handleResetBackground}
          hasBackground={!!backgroundImage}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onDownloadAllLinks={handleDownloadAllLinks}
          sections={sections.filter((s) => !s.isPrivate)}
          onCreateApply={() => setShowApplyModal(true)}
          applySearchQuery={applySearchQuery}
          onApplySearchChange={setApplySearchQuery}
        />

        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {applyEntries.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-foreground">Job Applications</h2>
                <Button variant="outline" onClick={() => setShowApplyModal(true)} className="gap-2">
                  + Add Application
                </Button>
              </div>

              {/* Search bar for applications */}
              <div className="mb-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    value={applySearchQuery}
                    onChange={(e) => setApplySearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                  {applySearchQuery && (
                    <button
                      onClick={() => setApplySearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 group/apply">
                {filteredApplyEntries.map((entry, index) => (
                  <div
                    key={entry.id}
                    draggable
                    onDragStart={() => setDraggedApply(entry.id)}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.dataTransfer.dropEffect = "move"
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      if (!draggedApply || draggedApply === entry.id) return
                      const draggedIndex = applyEntries.findIndex((e) => e.id === draggedApply)
                      const newEntries = [...applyEntries]
                      const draggedItem = newEntries[draggedIndex]
                      newEntries.splice(draggedIndex, 1)
                      newEntries.splice(index, 0, draggedItem)
                      handleReorderApplyEntries(newEntries)
                      setDraggedApply(null)
                    }}
                    onDragEnd={() => setDraggedApply(null)}
                    className={`relative transition-all cursor-move ${draggedApply === entry.id ? "opacity-50" : ""}`}
                  >
                    <ApplySectionCard key={entry.id} entry={entry} onDelete={handleDeleteApplyEntry} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredSections.length === 0 ? (
            <div className="flex items-center justify-center min-h-[60vh] text-center">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">
                  {searchQuery ? "No results found" : "No sections yet"}
                </h2>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Create your first section to start organizing your links"}
                </p>
              </div>
            </div>
          ) : (
            <SectionsList
              sections={filteredSections}
              onAddLink={handleOpenAddLinkModal}
              onDeleteLink={handleDeleteLink}
              onDeleteSection={handleDeleteSection}
              onDownloadSection={handleDownloadSection}
              onReorderLinks={handleReorderLinks}
              onEditLink={handleEditLink}
              onReorderSections={handleReorderSections}
              allSections={sections}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      {showModalSelector && (
        <CreateModalSelector
          onSelectSection={() => {
            setShowModalSelector(false)
            setShowCreateModal(true)
          }}
          onSelectApply={() => {
            setShowModalSelector(false)
            setShowApplyModal(true)
          }}
          onClose={() => setShowModalSelector(false)}
        />
      )}

      {showCreateModal && (
        <CreateSectionModal onClose={() => setShowCreateModal(false)} onCreate={handleCreateSection} />
      )}

      {showApplyModal && (
        <CreateApplyModal onClose={() => setShowApplyModal(false)} onCreate={handleCreateApplyEntry} />
      )}

      {showAddLinkModal && (
        <AddLinkModal onClose={() => setShowAddLinkModal(false)} onAdd={handleAddLink} sectionId={selectedSectionId} />
      )}

      {showEditLinkModal && editingLink && (
        <EditLinkModal
          link={editingLink}
          onClose={() => {
            setShowEditLinkModal(false)
            setEditingLink(null)
            setEditingSectionId("")
          }}
          onSave={handleSaveEditedLink}
        />
      )}

      {showConfirmation && (
        <ConfirmationModal
          type={confirmationType}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirmation(false)}
          data={confirmationData}
        />
      )}
    </div>
  )
}
