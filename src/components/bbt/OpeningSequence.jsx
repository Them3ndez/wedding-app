import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const FACTS = [
  { text: 'The Cheesecake Factory has', highlight: '21 types of cheesecake' },
  { text: "Sheldon's IQ is", highlight: '187' },
  { text: 'Soft Kitty has been sung', highlight: '12 times in the series' },
  { text: "The guys' apartment number is", highlight: '4A' },
]

export default function OpeningSequence({ onComplete }) {
  const wrapRef      = useRef(null)
  const bazingaRef   = useRef(null)
  const factRef      = useRef(null)
  const revealRef    = useRef(null)
  const panelTopRef  = useRef(null)
  const panelBotRef  = useRef(null)
  const namesRef     = useRef(null)
  const subRef       = useRef(null)
  const taglineRef   = useRef(null)
  const tlRef        = useRef(null)

  // We store fact text in a ref so GSAP can update it without React re-renders
  const factTextRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline()
    tlRef.current = tl

    // Phase 1: Bazinga fade in → fade out
    tl.fromTo(bazingaRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
    ).to(bazingaRef.current,
      { opacity: 0, scale: 1.1, duration: 0.4, ease: 'power2.in' },
      '+=0.9'
    ).set(bazingaRef.current, { display: 'none' })

    // Phase 2: Facts cycle
    FACTS.forEach((fact, i) => {
      tl.call(() => {
        if (factTextRef.current) {
          factTextRef.current.innerHTML = `${fact.text} <strong>${fact.highlight}</strong>`
        }
      })
      .set(factRef.current, { display: 'block' })
      .fromTo(factRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      ).to(factRef.current,
        { opacity: 0, y: -15, duration: 0.3, ease: 'power2.in' },
        '+=1.1'
      )
    })

    tl.set(factRef.current, { display: 'none' })

    // Phase 3: Reveal — panels split open, names fade in
    .set(revealRef.current, { display: 'flex' })
    .set([panelTopRef.current, panelBotRef.current], { yPercent: 0 })
    .fromTo(namesRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    )
    .fromTo(subRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      '-=0.3'
    )
    .fromTo(taglineRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      '-=0.2'
    )
    .to(panelTopRef.current,
      { yPercent: -100, duration: 0.6, ease: 'power2.inOut' },
      '-=0.1'
    )
    .to(panelBotRef.current,
      { yPercent: 100, duration: 0.6, ease: 'power2.inOut' },
      '<'
    )

    // Auto-complete
    .call(onComplete, null, '+=0.8')

    return () => tl.kill()
  }, [onComplete])

  const handleSkip = () => {
    if (tlRef.current) tlRef.current.kill()
    onComplete()
  }

  return (
    <div ref={wrapRef} className="bbt-intro-wrap">

      <span ref={bazingaRef} className="bbt-intro-bazinga" style={{ opacity: 0 }}>
        Bazinga!
      </span>

      <p ref={factRef} className="bbt-intro-fact" style={{ display: 'none', opacity: 0 }}>
        <span ref={factTextRef} />
      </p>

      <div ref={revealRef} className="bbt-intro-reveal-bg" style={{ display: 'none' }}>
        <h1 ref={namesRef} className="bbt-intro-reveal-names" style={{ opacity: 0 }}>
          Wendy &amp; Guillermo
        </h1>
        <p ref={subRef} className="bbt-intro-reveal-sub" style={{ opacity: 0 }}>
          Are getting married. Bazinga! No seriously, they are.
        </p>
        <p ref={taglineRef} className="bbt-intro-reveal-tagline" style={{ opacity: 0 }}>
          And you are cordially invited to witness this highly improbable event.
        </p>
        <div ref={panelTopRef} className="bbt-intro-panel bbt-intro-panel-top" />
        <div ref={panelBotRef} className="bbt-intro-panel bbt-intro-panel-bot" />
      </div>

      <button className="bbt-intro-skip" onClick={handleSkip}>Skip ›</button>
    </div>
  )
}
