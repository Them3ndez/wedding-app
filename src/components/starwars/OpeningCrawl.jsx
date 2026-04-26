import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function OpeningCrawl({ onComplete }) {
  const preludeRef  = useRef(null)
  const logoRef     = useRef(null)
  const crawlRef    = useRef(null)
  const tlRef       = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline()
    tlRef.current = tl

    // Phase 1: Prelude fade in → hold → fade out
    tl.fromTo(preludeRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1.5, ease: 'power2.out' }
    ).to(preludeRef.current,
      { opacity: 0, duration: 0.8, ease: 'power2.in' },
      '+=2'
    )

    // Phase 2: Logo scale in → hold → fade out
    .set(logoRef.current, { display: 'block' })
    .fromTo(logoRef.current,
      { opacity: 0, scale: 3 },
      { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' }
    ).to(logoRef.current,
      { opacity: 0, scale: 0.85, duration: 0.7, ease: 'power2.in' },
      '+=1.2'
    )

    // Phase 3: Crawl fade in (CSS handles the scroll)
    .set(crawlRef.current, { display: 'block' })
    .fromTo(crawlRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: 'power2.out' }
    )

    // Auto-complete after crawl duration
    .call(onComplete, null, '+=68')

    return () => tl.kill()
  }, [onComplete])

  const handleSkip = () => {
    if (tlRef.current) tlRef.current.kill()
    gsap.set([preludeRef.current, logoRef.current, crawlRef.current], { clearProps: 'all' })
    onComplete()
  }

  return (
    <div className="crawl-container">

      <p ref={preludeRef} className="crawl-prelude" style={{ opacity: 0 }}>
        A long time ago in a galaxy far, far away….
      </p>

      <div ref={logoRef} className="crawl-logo" style={{ display: 'none', opacity: 0 }}>
        STAR WARS
      </div>

      <div ref={crawlRef} style={{ display: 'none', opacity: 0 }}>
        <div className="crawl-top-fade" />
        <div className="crawl-perspective">
          <div className="crawl-body">
            <p className="crawl-ep">Episode I</p>
            <h2 className="crawl-title">THE WEDDING OF THE FORCE</h2>

            <p className="crawl-text">
              Turmoil has engulfed the galaxy. Two hearts, separated by the vast
              reaches of space and time, have at last found each other in the warm
              light of destiny.
            </p>

            <p className="crawl-text">
              The noble warrior GUILLERMO, guided by the Force through countless
              adventures, has pledged his heart to the brilliant and radiant WENDY,
              whose grace rivals the twin suns of Tatooine.
            </p>

            <p className="crawl-text">
              Together they invite their most beloved allies, rebels, jedis, and
              scoundrels alike, to witness their union beneath the stars of
              Mascota, Jalisco.
            </p>

            <p className="crawl-text">
              As the galaxy holds its breath, the Jedi Council extends a most
              sacred transmission: on the seventh day of February, in the year
              two-thousand and twenty-seven, two souls shall become one at
              <strong> Quinta el Pedregal</strong>.
            </p>

            <p className="crawl-text">
              May the Force — and the dance floor — be with you.
            </p>

            <p className="crawl-text" style={{ textAlign: 'center', marginTop: '4rem', letterSpacing: '.3em' }}>
              ✦ &nbsp; ✦ &nbsp; ✦
            </p>
          </div>
        </div>
      </div>

      <button className="crawl-skip" onClick={handleSkip}>
        Skip Intro ›
      </button>
    </div>
  )
}
