"use client"

import { Moon, Sun, Plus, ImageIcon, RotateCcw, Search, X, Menu, Download, Lock, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRef, useState } from "react"
import Link from "next/link"

interface TopNavigationProps {
  isDark: boolean
  onToggleTheme: () => void
  onCreateSection: () => void
  onUploadBackground: (file: File) => void
  onResetBackground: () => void
  hasBackground: boolean
  searchQuery: string
  onSearchChange: (query: string) => void
  onDownloadAllLinks: (selectedSectionId?: string) => void
  sections: Array<{ id: string; name: string }>
  onCreateApply: () => void
  applySearchQuery: string // added apply search query prop
  onApplySearchChange: (query: string) => void // added apply search change handler
}

export default function TopNavigation({
  isDark,
  onToggleTheme,
  onCreateSection,
  onUploadBackground,
  onResetBackground,
  hasBackground,
  searchQuery,
  onSearchChange,
  onDownloadAllLinks,
  sections,
  onCreateApply,
  applySearchQuery,
  onApplySearchChange,
}: TopNavigationProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showSectionSelectModal, setShowSectionSelectModal] = useState(false)
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false) // added dropdown state

  return (
    <>
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <h1 className="text-2xl font-bold tracking-tight text-foreground">LinkHive</h1>

            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search links..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full pl-10 pr-10 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <Link href="/privacy">
                <Button variant="ghost" size="icon" title="Access private section" className="hidden md:flex">
                  <Lock className="w-5 h-5" />
                </Button>
              </Link>

              <div className="relative hidden md:block">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                  title="Download options"
                  className="flex items-center gap-1"
                >
                  <Download className="w-5 h-5" />
                  <ChevronDown className="w-4 h-4" />
                </Button>

                {showDownloadDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50 p-2">
                    <button
                      onClick={() => {
                        onDownloadAllLinks()
                        setShowDownloadDropdown(false)
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-muted rounded-md text-sm"
                    >
                      Download All Links
                    </button>
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => {
                          onDownloadAllLinks(section.id)
                          setShowDownloadDropdown(false)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-muted rounded-md text-sm"
                      >
                        Download {section.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative hidden md:block">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) onUploadBackground(file)
                  }}
                  className="hidden"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload background image"
                >
                  <ImageIcon className="w-5 h-5" />
                </Button>
              </div>

              {hasBackground && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onResetBackground}
                  title="Reset background"
                  className="hidden md:flex"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleTheme}
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>

              <Button
                size="icon"
                onClick={onCreateSection}
                className="rounded-full hidden md:flex"
                title="Create new section or apply"
              >
                <Plus className="w-5 h-5" />
              </Button>

              <div className="relative md:hidden">
                <Button variant="ghost" size="icon" onClick={() => setShowMenu(!showMenu)} title="Menu">
                  <Menu className="w-5 h-5" />
                </Button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50 p-2">
                    <Link href="/privacy" className="block w-full">
                      <button
                        onClick={() => setShowMenu(false)}
                        className="w-full text-left px-4 py-2 hover:bg-muted rounded-md text-sm flex items-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        Private Section
                      </button>
                    </Link>
                    <button
                      onClick={() => {
                        onCreateSection()
                        setShowMenu(false)
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-muted rounded-md text-sm flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create
                    </button>
                    <button
                      onClick={() => {
                        const input = fileInputRef.current
                        if (input) {
                          input.click()
                          setShowMenu(false)
                        }
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-muted rounded-md text-sm flex items-center gap-2"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Upload Background
                    </button>
                    {hasBackground && (
                      <button
                        onClick={() => {
                          onResetBackground()
                          setShowMenu(false)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-muted rounded-md text-sm flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset Background
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onDownloadAllLinks()
                        setShowMenu(false)
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-muted rounded-md text-sm flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download All Links
                    </button>
                    <button
                      onClick={() => {
                        onCreateApply()
                        setShowMenu(false)
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-muted rounded-md text-sm flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Application
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) onUploadBackground(file)
                  }}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {showSectionSelectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-lg shadow-lg max-w-md w-full animate-in zoom-in-95 duration-200 p-6">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">Download Links</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <button
                onClick={() => {
                  onDownloadAllLinks()
                  setShowSectionSelectModal(false)
                }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted transition-colors font-medium text-foreground"
              >
                Download All Sections
              </button>
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    onDownloadAllLinks(section.id)
                    setShowSectionSelectModal(false)
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted transition-colors text-foreground"
                >
                  {section.name}
                </button>
              ))}
            </div>
            <Button variant="outline" onClick={() => setShowSectionSelectModal(false)} className="w-full mt-4">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
