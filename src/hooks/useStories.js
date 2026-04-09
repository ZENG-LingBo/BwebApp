import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : ''

export function useStories() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStories()
    // Poll every 5 minutes in case server just finished fetching
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

  return { stories, loading, error }
}
