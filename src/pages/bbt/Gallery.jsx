import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import HawkingBubble from '../../components/bbt/HawkingBubble'
import Lightbox from '../../components/Lightbox'
import MagneticCard from '../../components/MagneticCard'

gsap.registerPlugin(ScrollTrigger)

const photos = []

export default function Gallery() {
  const [lightboxIdx, setLightboxIdx] = useState(null)
  const labelRef   = useRef(null)
  const headingRef = useRef(null)
  const subRef     = useRef(null)

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

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])

  return (
    <div className="bbt-container bbt-section">
      <div className="bbt-page-header">
        <p ref={labelRef} className="bbt-section-label">Visual Documentation Archive</p>
        <h1 ref={headingRef} className="bbt-page-heading">Holorecords</h1>
        <p ref={subRef} className="bbt-page-sub">The Hofstadter-Mendez Photo Archive — Classified: Adorable</p>
      </div>

      <div className="bbt-gallery-grid">
        {photos.length > 0
          ? photos.map((photo, i) => (
              <div
                key={i}
                className="bbt-gallery-item"
                style={{ cursor: 'pointer' }}
                onClick={() => setLightboxIdx(i)}
              >
                <img src={photo.src} alt={photo.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))
          : Array.from({ length: 8 }, (_, i) => (
              <MagneticCard key={i} className="bbt-gallery-item">
                <div className="bbt-gallery-ph">
                  <span className="bbt-gallery-ph-icon">⚛</span>
                  <span className="bbt-gallery-ph-text">Record {i + 1}</span>
                </div>
              </MagneticCard>
            ))
        }
      </div>

      <HawkingBubble />

      {lightboxIdx !== null && photos.length > 0 && (
        <Lightbox
          photos={photos}
          initialIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          accent="#4a90d9"
        />
      )}
    </div>
  )
}
