import { createContext, useContext, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'

const TransitionCtx = createContext(null)

export function useThemeTransition() {
  return useContext(TransitionCtx)
}

export function TransitionOverlayProvider({ children }) {
  const navigate   = useNavigate()
  const overlayRef = useRef(null)
  const textRef    = useRef(null)

  useEffect(() => {
    if (overlayRef.current) {
      gsap.set(overlayRef.current, { opacity: 0, pointerEvents: 'none' })
    }
    if (textRef.current) {
      gsap.set(textRef.current, { opacity: 0 })
    }
  }, [])

  const goToTheme = useCallback((path, label) => {
    const overlay = overlayRef.current
    const text    = textRef.current
    if (!overlay) return

    gsap.killTweensOf([overlay, text])

    const tl = gsap.timeline()

    // Phase 1: fade overlay in
    tl.to(overlay, {
      opacity: 1,
      duration: 0.4,
      ease: 'power2.in',
      onStart: () => { overlay.style.pointerEvents = 'all' },
    })

    // Phase 2: animate label in
    .call(() => {
      if (text) text.textContent = `Entering ${label}...`
    })
    .fromTo(text,
      { opacity: 0, y: 20, letterSpacing: '0.5em' },
      { opacity: 1, y: 0, letterSpacing: '0.3em', duration: 0.4, ease: 'power2.out' }
    )

    // Phase 3: navigate
    .call(() => navigate(path), null, '+=0.2')

    // Phase 4: fade overlay out
    .to(overlay, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.out',
      delay: 0.2,
      onComplete: () => {
        overlay.style.pointerEvents = 'none'
        if (text) text.textContent = ''
      },
    })
  }, [navigate])

  return (
    <TransitionCtx.Provider value={{ goToTheme }}>
      {children}
      <div
        ref={overlayRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 99999,
          background: '#000000',
          margin: 0,
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        <p
          ref={textRef}
          style={{
            color: '#fff',
            fontFamily: "'Jost', sans-serif",
            fontSize: '0.75rem',
            fontWeight: 300,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            opacity: 0,
          }}
        />
      </div>
    </TransitionCtx.Provider>
  )
}
