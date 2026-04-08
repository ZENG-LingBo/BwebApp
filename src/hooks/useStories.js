import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : ''

export function useStories() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStories()
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

  async function triggerFetch(count = 10) {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/stories/fetch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchStories()
      }
      return data
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return { stories, loading, error, refetch: fetchStories, triggerFetch }
}
