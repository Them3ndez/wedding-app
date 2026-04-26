import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function RavenIntro({ onComplete }) {
  const wordsRef  = useRef(null)
  const sigilRef  = useRef(null)
  const houseRef  = useRef(null)
  const rule1Ref  = useRef(null)
  const namesRef  = useRef(null)
  const rule2Ref  = useRef(null)
  const dateRef   = useRef(null)
  const tlRef     = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline()
    tlRef.current = tl

    // Phase 1: Words fade in → hold → fade out
    tl.fromTo(wordsRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' }
    ).to(wordsRef.current,
      { opacity: 0, y: -20, duration: 0.6, ease: 'power2.in' },
      '+=3'
    )

    // Phase 2: Sigil elements stagger in
    .set(sigilRef.current, { display: 'block' })
    .fromTo(houseRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }
    ).fromTo(rule1Ref.current,
      { opacity: 0, scaleX: 0 },
      { opacity: 1, scaleX: 1, duration: 0.5, ease: 'power2.out' },
      '-=0.3'
    ).fromTo(namesRef.current,
      { opacity: 0, y: 40, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 1.0, ease: 'power3.out' },
      '-=0.2'
    ).fromTo(rule2Ref.current,
      { opacity: 0, scaleX: 0 },
      { opacity: 1, scaleX: 1, duration: 0.5, ease: 'power2.out' },
      '-=0.3'
    ).fromTo(dateRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
      '-=0.2'
    )

    // Auto-complete
    .call(onComplete, null, '+=2')

    return () => tl.kill()
  }, [onComplete])

  const handleSkip = () => {
    if (tlRef.current) tlRef.current.kill()
    onComplete()
  }

  return (
    <div className="got-intro-wrap">
      <p ref={wordsRef} className="got-intro-words" style={{ opacity: 0 }}>
        "When you play the Game of Love,<br />you win and you wed."
      </p>

      <div ref={sigilRef} style={{ display: 'none', textAlign: 'center', padding: '2rem' }}>
        <p ref={houseRef} className="got-intro-house" style={{ opacity: 0 }}>House Mendez</p>
        <div ref={rule1Ref} className="got-intro-rule" style={{ opacity: 0, transformOrigin: 'center' }} />
        <h1 ref={namesRef} className="got-intro-names" style={{ opacity: 0 }}>Wendy &amp; Guillermo</h1>
        <div ref={rule2Ref} className="got-intro-rule" style={{ opacity: 0, transformOrigin: 'center' }} />
        <p ref={dateRef} className="got-intro-date" style={{ opacity: 0 }}>February 7, 2027 &nbsp;·&nbsp; Mascota, Jalisco, México</p>
      </div>

      <button className="got-intro-skip" onClick={handleSkip}>Skip ›</button>
    </div>
  )
}
