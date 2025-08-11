'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function DebugPage() {
  const [authStatus, setAuthStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test')
      const data = await response.json()
      setAuthStatus(data)
    } catch (error) {
      setAuthStatus({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  const clearCookies = async () => {
    try {
      await fetch('/api/auth/clear', { method: 'POST' })
      alert('Cookies cleared! Please refresh and login again.')
    } catch (error) {
      alert('Error clearing cookies')
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Authentication Status:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm">
            {JSON.stringify(authStatus, null, 2)}
          </pre>
        </div>
        
        <div className="space-x-2">
          <Button onClick={checkAuth}>Refresh Auth Status</Button>
          <Button onClick={clearCookies} variant="destructive">Clear All Cookies</Button>
        </div>
      </div>
    </div>
  )
}