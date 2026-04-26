import { useState, useEffect, useRef, useCallback } from 'react'

export default function Lightbox({ photos, initialIndex, onClose, accent = '#ffffff' }) {
  const [index, setIndex] = useState(initialIndex)
  const [fade,  setFade]  = useState(true)
  const touchX = useRef(null)

  const total = photos.length
  const photo = photos[index]

  const go = useCallback((i) => {
    setFade(false)
    setTimeout(() => { setIndex(i); setFade(true) }, 180)
  }, [])

  const prev = useCallback(() => go((index - 1 + total) % total), [index, total, go])
  const next = useCallback(() => go((index + 1) % total), [index, total, go])

  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'Escape')      onClose()
      if (e.key === 'ArrowLeft')   prev()
      if (e.key === 'ArrowRight')  next()
    }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose, prev, next])

  const imgSrc  = photo.src || (photo.seed != null ? `https://picsum.photos/seed/${photo.seed}/1200/900` : null)
  const caption = photo.caption || photo.alt || ''
  const dotCount = Math.min(total, 12)

  const arrowBtn = (side, handler, label, char) => (
    <button
      onClick={(e) => { e.stopPropagation(); handler() }}
      aria-label={label}
      style={{
        position: 'absolute', [side]: 0, top: 0, bottom: 0,
        width: 60, background: 'none', border: 'none',
        color: accent, fontSize: '2rem', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10001, padding: 0, opacity: 0.85,
        transition: 'opacity 0.15s, text-shadow 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.textShadow = `0 0 12px ${accent}` }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.textShadow = 'none' }}
    >{char}</button>
  )

  return (
    <>
      <style>{`
        @keyframes lb-in    { from { opacity: 0 }                       to { opacity: 1 } }
        @keyframes lb-scale { from { opacity: 0; transform: scale(0.9) } to { opacity: 1; transform: scale(1) } }
        .lb-overlay { animation: lb-in 0.3s ease; }
        .lb-content {
          animation: lb-scale 0.3s ease-out;
          display: flex;
          max-width: 90vw;
          max-height: 90vh;
          overflow: hidden;
          border-radius: 4px;
        }
        .lb-img-col {
          flex: 0 0 65%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          min-width: 0;
        }
        .lb-info-col {
          flex: 0 0 35%;
          background: rgba(10,10,10,0.8);
          padding: 32px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 0;
        }
        @media (max-width: 768px) {
          .lb-content {
            flex-direction: column;
            max-height: 92vh;
            overflow-y: auto;
            width: 92vw;
          }
          .lb-img-col  { flex: none; padding: 8px 8px 0; }
          .lb-info-col { flex: none; padding: 16px 20px 20px; }
          .lb-img-col img { max-height: 58vh !important; }
        }
      `}</style>

      {/* Overlay */}
      <div
        className="lb-overlay"
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.95)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        onClick={onClose}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 16, right: 20, zIndex: 10002,
            background: 'none', border: 'none', color: '#fff',
            fontSize: '1.4rem', cursor: 'pointer', padding: '8px',
            lineHeight: 1, opacity: 0.8, transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
        >✕</button>

        {/* Nav arrows */}
        {total > 1 && arrowBtn('left',  prev, 'Previous', '←')}
        {total > 1 && arrowBtn('right', next, 'Next',     '→')}

        {/* Content */}
        <div
          className="lb-content"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return
            const dx = e.changedTouches[0].clientX - touchX.current
            if (Math.abs(dx) >= 50) dx > 0 ? prev() : next()
            touchX.current = null
          }}
        >
          {/* Image */}
          <div className="lb-img-col">
            {imgSrc && (
              <img
                src={imgSrc}
                alt={caption}
                style={{
                  maxWidth: '100%', maxHeight: '80vh',
                  objectFit: 'contain', display: 'block',
                  opacity: fade ? 1 : 0,
                  transition: 'opacity 0.18s ease',
                }}
              />
            )}
          </div>

          {/* Info panel */}
          <div className="lb-info-col">
            <p style={{
              margin: '0 0 12px 0',
              fontFamily: 'sans-serif',
              fontSize: '0.65rem',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: accent,
            }}>
              {index + 1} / {total}
            </p>
            {caption && (
              <p style={{
                margin: 0,
                color: 'rgba(255,255,255,0.75)',
                fontSize: '1rem',
                lineHeight: 1.6,
                fontFamily: 'serif',
              }}>{caption}</p>
            )}
          </div>
        </div>

        {/* Dot indicators */}
        {total > 1 && (
          <div style={{
            position: 'absolute', bottom: 20, left: 0, right: 0,
            display: 'flex', justifyContent: 'center', gap: 8, zIndex: 10001,
          }}>
            {Array.from({ length: dotCount }, (_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); go(i) }}
                aria-label={`Photo ${i + 1}`}
                style={{
                  width: 8, height: 8, borderRadius: '50%', padding: 0,
                  border: `1.5px solid ${accent}`,
                  background: i === index ? accent : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
