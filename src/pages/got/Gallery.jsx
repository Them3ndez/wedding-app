import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TyrionChat from '../../components/got/TyrionChat'
import Lightbox from '../../components/Lightbox'
import MagneticCard from '../../components/MagneticCard'

gsap.registerPlugin(ScrollTrigger)

const photos = [
  { id: 1,  caption: 'The Betrothal',         seed: 11 },
  { id: 2,  caption: 'Mascota, Jalisco',       seed: 21 },
  { id: 3,  caption: 'The Quest for Love',     seed: 31 },
  { id: 4,  caption: 'The Engagement',         seed: 41 },
  { id: 5,  caption: 'Quinta el Pedregal',     seed: 51 },
  { id: 6,  caption: 'House Mendez',           seed: 61 },
  { id: 7,  caption: 'The Journey Begins',     seed: 71 },
  { id: 8,  caption: 'Our Story',              seed: 81 },
  { id: 9,  caption: 'Two Houses United',      seed: 91 },
]

export default function Gallery() {
  const [lightboxIdx, setLightboxIdx] = useState(null)
  const headingRef = useRef(null)
  const subRef     = useRef(null)
  const footerRef  = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline()
    tl.fromTo(headingRef.current,
      { opacity: 0, x: -40 },
      { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' }
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
    <div className="sw-container" style={{ paddingBottom: '6rem' }}>
      <div className="page-header">
        <h1 ref={headingRef} className="page-heading">The Gallery</h1>
        <p ref={subRef} className="page-subheading">Portraits of the Realm</p>
      </div>

      <div className="gallery-grid">
        {photos.map((photo, i) => (
          <MagneticCard
            key={photo.id}
            className="gallery-item"
            style={{ animationDelay: `${i * .06}s`, cursor: 'pointer' }}
            onClick={() => setLightboxIdx(i)}
          >
            <img
              src={`https://picsum.photos/seed/${photo.seed}/560/420`}
              alt={photo.caption}
              loading="lazy"
            />
            <div className="gallery-overlay">
              <span className="gallery-caption">{photo.caption}</span>
            </div>
          </MagneticCard>
        ))}
      </div>

      <TyrionChat />

      <p ref={footerRef} style={{
        fontFamily: "'Crimson Text', serif",
        fontSize: '1rem',
        fontStyle: 'italic',
        color: 'rgba(200,178,134,.25)',
        textAlign: 'center',
        marginTop: '3rem',
      }}>
        More portraits shall be commissioned after the ceremony ✦
      </p>

      {lightboxIdx !== null && (
        <Lightbox
          photos={photos}
          initialIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          accent="#a8c5da"
        />
      )}
    </div>
  )
}
