'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, LogOut, Settings as SettingsIcon, Download, Upload, AlertTriangle } from 'lucide-react'

type Message = { kind: 'success' | 'error'; text: string }

export default function SettingsPage() {
  const router = useRouter()
  const fileInput = useRef<HTMLInputElement>(null)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [replace, setReplace] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const handleExport = async () => {
    setExporting(true)
    setMessage(null)
    try {
      const res = await fetch('/api/export')
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition') || ''
      const match = disposition.match(/filename="(.+?)"/)
      const filename = match ? match[1] : 'booknook-export.json'
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setMessage({ kind: 'success', text: 'Export downloaded.' })
    } catch (e) {
      setMessage({ kind: 'error', text: e instanceof Error ? e.message : 'Export failed' })
    } finally {
      setExporting(false)
    }
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file
    if (!file) return

    if (replace && !confirm('Replace all data? This deletes your current books and wishlist, then imports the file.')) {
      return
    }

    setImporting(true)
    setMessage(null)
    try {
      const text = await file.text()
      const mode = replace ? 'replace' : 'append'
      const res = await fetch(`/api/import?mode=${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: text,
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Import failed')
      setMessage({
        kind: 'success',
        text: `Imported ${result.booksImported} book(s) and ${result.wishlistImported} wishlist item(s) (${result.mode}).`,
      })
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Import failed' })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/settings" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <SettingsIcon className="h-6 w-6 md:h-8 md:w-8 text-slate-600" />
              <h1 className="text-xl md:text-3xl font-bold">Settings</h1>
            </Link>
            <div className="flex gap-1 md:gap-2">
              <ThemeToggle />
              <Link href="/">
                <Button size="sm" variant="outline" className="px-2 md:px-4">
                  <BookOpen className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Library</span>
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout} className="px-2 md:px-4">
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline md:ml-2">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-8 max-w-2xl">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Data export &amp; import</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Export your library and wishlist as a JSON file, or import a previous export.
              </p>
            </div>

            {message && (
              <div
                className={`text-sm rounded-md p-3 ${
                  message.kind === 'success'
                    ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleExport} disabled={exporting} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                {exporting ? 'Exporting...' : 'Export data'}
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInput.current?.click()}
                disabled={importing}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                {importing ? 'Importing...' : 'Import data'}
              </Button>
              <input
                ref={fileInput}
                type="file"
                accept="application/json,.json"
                onChange={handleImportFile}
                className="hidden"
              />
            </div>

            <label className="flex items-start gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={replace}
                onChange={(e) => setReplace(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                <span className="font-medium">Replace all data on import</span>
                <span className="block text-muted-foreground">
                  Deletes your current books and wishlist before importing. Leave unchecked to append.
                </span>
              </span>
            </label>

            {replace && (
              <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Replace mode is destructive and cannot be undone.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
