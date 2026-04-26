import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import JanetBubble from '../../components/goodplace/JanetBubble'
import CloudLayer from '../../components/goodplace/CloudLayer'
import GoodPlaceChaos from '../../components/goodplace/GoodPlaceChaos'
import Lightbox from '../../components/Lightbox'
import MagneticCard from '../../components/MagneticCard'

gsap.registerPlugin(ScrollTrigger)

const PLACEHOLDERS = [
  { icon: '💍', label: 'The Proposal' },
  { icon: '🌅', label: 'Golden Hour' },
  { icon: '🎉', label: 'Celebration' },
  { icon: '🌺', label: 'Florals' },
  { icon: '🥂', label: 'Toast' },
  { icon: '💃', label: 'First Dance' },
  { icon: '🌿', label: 'The Venue' },
  { icon: '📸', label: 'Portraits' },
  { icon: '✦',  label: 'Details' },
  { icon: '🎂', label: 'The Cake' },
  { icon: '🌙', label: 'Evening' },
  { icon: '😇', label: 'The Moment' },
]

const photos = []

export default function Gallery() {
  const [lightboxIdx, setLightboxIdx] = useState(null)
  const labelRef   = useRef(null)
  const headingRef = useRef(null)
  const subRef     = useRef(null)
  const footerRef  = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline()
    tl.fromTo(labelRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    ).fromTo(headingRef.current,
      { opacity: 0, x: -40 },
      { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' },
      '-=0.3'
    ).fromTo(subRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
      '-=0.4'
    )

    if (footerRef.current) {
      gsap.fromTo(footerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      )
    }

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])

  return (
    <div className="gp-container">
      <CloudLayer />
      <GoodPlaceChaos />
      <div className="gp-page-header">
        <p ref={labelRef} className="gp-page-label">Captured Moments from The Neighborhood</p>
        <h1 ref={headingRef} className="gp-page-heading">Memories</h1>
        <p ref={subRef} className="gp-page-sub">Janet has catalogued every moment across all known timelines</p>
      </div>

      <div className="gp-gallery-grid">
        {photos.length > 0
          ? photos.map((photo, i) => (
              <div
                key={i}
                className="gp-gallery-item"
                style={{ cursor: 'pointer', animationDelay: `${i * 0.05}s` }}
                onClick={() => setLightboxIdx(i)}
              >
                <img src={photo.src} alt={photo.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))
          : PLACEHOLDERS.map((p, i) => (
              <MagneticCard
                key={p.label}
                className="gp-gallery-item"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <span className="gp-gallery-item-icon">{p.icon}</span>
                <span className="gp-gallery-item-label">{p.label}</span>
              </MagneticCard>
            ))
        }
      </div>

      <p
        ref={footerRef}
        style={{
          textAlign: 'center',
          marginTop: '2.5rem',
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1rem',
          fontStyle: 'italic',
          color: 'rgba(26,26,26,.35)',
        }}
      >
        Photos will be added after the event. Janet is already preparing the archive.
      </p>

      <JanetBubble />

      {lightboxIdx !== null && photos.length > 0 && (
        <Lightbox
          photos={photos}
          initialIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          accent="#41803c"
        />
      )}
    </div>
  )
}
