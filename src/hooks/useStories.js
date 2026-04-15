import { useState, useEffect } from 'react'

// Empty base in both dev and prod. In dev, Vite's proxy config (vite.config.js)
// forwards /api/* to the Express server on :3001 — that's more reliable than
// hitting :3001 cross-origin (which breaks in sandboxed browser contexts).
const API_BASE = ''

export function useStories() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStories()
    const interval = setInterval(fetchStories, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  async function fetchStories() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/stories/today`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setStories(data.stories || [])
    } catch (err) {
      console.error('Failed to fetch stories:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function refresh() {
    setRefreshing(true)
    try {
      const res = await fetch(`${API_BASE}/api/stories/fetch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 10 }),
      })
      await res.json()
      await fetchStories()
    } catch (err) {
      setError(err.message)
    } finally {
      setRefreshing(false)
    }
  }

  return { stories, loading, refreshing, error, refresh }
}
