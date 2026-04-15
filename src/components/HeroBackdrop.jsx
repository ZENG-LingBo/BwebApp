import { useEffect, useRef, useState } from 'react'
import './HeroBackdrop.css'

/**
 * HeroBackdrop — persistent, fixed-position hero layer that sits behind the
 * scroll container (z-index 0). At scroll=0 the user sees it in full; as they
 * scroll the card-stack rises over it (via card-stack's padding-top spacer).
 *
 * Source priority:
 *   1. story.video_filename → local MP4 served from /api/videos/:name
 *   2. story.video_embed_url → YouTube iframe (autoplay, muted, looping)
 *   3. fallback CSS gradient (.hero-backdrop-gradient)
 *
 * Based on Figma "Story – Card 2" node 254:3867's ScreenRecording backdrop
 * (node 254:3868) + the two shade overlays (254:3870 "Shade up" at the top,
 * 254:3871 "Shade Down" at y=553) and the hero text block.
 */
export default function HeroBackdrop({ story }) {
  // ALL hooks must be called unconditionally and in the same order each render
  // — no early returns before them. React crashes with a "hooks order changed"
  // error otherwise, which breaks this component entirely.
  const [isPlaying, setIsPlaying] = useState(true)
  const videoRef = useRef(null)
  const iframeRef = useRef(null)

  // Reset play state when the story (and therefore the underlying media) changes.
  useEffect(() => {
    setIsPlaying(true)
  }, [story?.id])

  if (!story) {
    return <div className="hero-backdrop hero-backdrop-gradient" aria-hidden />
  }

  const { video_filename, video_embed_url, video_id, video_thumbnail, headline, subtitle } = story

  // Build a YouTube embed URL that autoplays muted (required by most browsers)
  // and loops. The &playlist=ID trick is YouTube's official looping pattern.
  // enablejsapi=1 lets us postMessage play/pause commands to the iframe.
  let youtubeSrc = null
  let ytId = null
  if (!video_filename && video_embed_url) {
    const idMatch = video_embed_url.match(/embed\/([\w-]+)/)
    ytId = idMatch ? idMatch[1] : video_id
    if (ytId) {
      const params = new URLSearchParams({
        autoplay: '1',
        mute: '1',
        loop: '1',
        controls: '0',
        modestbranding: '1',
        playsinline: '1',
        rel: '0',
        enablejsapi: '1',
        playlist: ytId, // required for loop=1 to work
      })
      youtubeSrc = `https://www.youtube-nocookie.com/embed/${ytId}?${params.toString()}`
    }
  }

  function togglePlay() {
    const next = !isPlaying
    setIsPlaying(next)

    // Local MP4 → imperative API
    if (videoRef.current) {
      if (next) videoRef.current.play().catch(() => {})
      else videoRef.current.pause()
      return
    }

    // YouTube iframe → postMessage bridge.
    // Docs: https://developers.google.com/youtube/iframe_api_reference#Playback_controls
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: next ? 'playVideo' : 'pauseVideo',
          args: [],
        }),
        'https://www.youtube-nocookie.com'
      )
    }
  }

  return (
    <div className="hero-backdrop">
      {video_filename ? (
        <video
          ref={videoRef}
          className="hero-backdrop-video"
          src={`/api/videos/${video_filename}`}
          autoPlay
          loop
          muted
          playsInline
          poster={video_thumbnail || undefined}
        />
      ) : youtubeSrc ? (
        <iframe
          ref={iframeRef}
          className="hero-backdrop-iframe"
          src={youtubeSrc}
          title={story.video_title || 'Story video'}
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen={false}
          tabIndex={-1}
        />
      ) : (
        <div className="hero-backdrop-gradient" />
      )}

      {/* Dark overlay gradient — Figma 254:3870 "Shade up" + 254:3871 "Shade Down" */}
      <div className="hero-backdrop-overlay" />

      {/* Hero text block */}
      <div className="hero-backdrop-content">
        <div className="hero-backdrop-text">
          <h1 className="hero-backdrop-headline">{headline}</h1>
          {subtitle && <p className="hero-backdrop-subtitle">{subtitle}</p>}
        </div>

        {/* Swipe-up CTA + play/pause pair — grouped inline at the bottom-left
            of the hero so they share the same visual zone and don't crash into
            the right-rail stepper. Play/pause is only shown when there's a
            video to control. */}
        <div className="hero-backdrop-actions">
          <div className="hero-backdrop-cta">
            <span>Swipe up to read more</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path
                d="M10 16V6M10 6l3 3M10 6L7 9"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {(video_filename || youtubeSrc) && (
            <button
              className="hero-backdrop-playpause"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
              type="button"
            >
              {isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="6" y="5" width="4" height="14" rx="1" fill="#fff" />
                  <rect x="14" y="5" width="4" height="14" rx="1" fill="#fff" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M8 5v14l11-7L8 5z" fill="#fff" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
