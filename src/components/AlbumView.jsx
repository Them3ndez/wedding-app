import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import '../styles/AlbumView.css'

gsap.registerPlugin(ScrollTrigger)

export default function AlbumView({ album, onClose }) {
  const trackRef = useRef(null)

  /* ── Lock body scroll while overlay is open ── */
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  /* ── Escape key to close ── */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  /* ── Wheel-driven horizontal scroll — starts right, moves left ── */
  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    // First image right-aligned: its right edge flush with the viewport
    const getInitialX = () => {
      const firstPhoto = track.querySelector('.av-photo')
      const padLeft = parseFloat(getComputedStyle(track).paddingLeft) || 0
      const imgWidth = firstPhoto ? firstPhoto.offsetWidth : 700
      return window.innerWidth - padLeft - imgWidth
    }

    const getMaxX = () => -(track.scrollWidth - window.innerWidth)

    let x = getInitialX()
    gsap.set(track, { x })

    const onWheel = (e) => {
      e.preventDefault()
      x = Math.max(getMaxX(), Math.min(getInitialX(), x - e.deltaY * 0.9))
      gsap.to(track, { x, duration: 0.55, ease: 'power3.out', overwrite: 'auto' })
    }

    const onResize = () => {
      x = Math.max(getMaxX(), Math.min(getInitialX(), x))
      gsap.set(track, { x })
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', onResize)
      gsap.killTweensOf(track)
    }
  }, [])

  const photos =
    album.photos?.length > 0
      ? album.photos
      : [{ src: null, alt: '' }, { src: null, alt: '' }, { src: null, alt: '' }]

  return (
    <div className="av-overlay">
      {/* Top bar */}
      <div className="av-topbar">
        <button className="av-back" onClick={onClose} aria-label="Back" style={{ color: 'rgba(28,28,30,0.6)' }}>← Back</button>
        <span className="av-album-name">{album.name}</span>
        <button className="av-close" onClick={onClose} aria-label="Close album">✕</button>
      </div>

      {/* Photo stage */}
      <div className="av-stage">
        <button className="av-stage-back" onClick={onClose} aria-label="Back">
          ← Back
        </button>
        <div ref={trackRef} className="av-track">
          {photos.map((photo, i) =>
            photo.src ? (
              <img
                key={i}
                src={photo.src}
                alt={photo.alt || album.name}
                className="av-photo"
                draggable={false}
              />
            ) : (
              <div key={i} className="av-photo av-photo--ph" />
            )
          )}
        </div>
      </div>
    </div>
  )
}
