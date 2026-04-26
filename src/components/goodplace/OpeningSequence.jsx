import { useState, useEffect, useRef, useCallback } from 'react'
import { gsap } from 'gsap'

// ── Points board items ──────────────────────────────────────────────────────
const BOARD_ITEMS = [
  { label: 'END SLAVERY',                                      pts: '+814,292.09',   size: 'xl',   pos: true,  x: 3,  y: 4,  rot: -1 },
  { label: 'COMMIT GENOCIDE',                                  pts: '-433,115.25',   size: 'xl',   pos: false, x: 48, y: 2,  rot: 1  },
  { label: "ATTEND WENDY & GUILLERMO'S WEDDING",               pts: '+1,000,000.00', size: 'hero', pos: true,  x: 18, y: 38, rot: 0  },
  { label: 'RSVP ON TIME',                                     pts: '+847.33',       size: 'lg',   pos: true,  x: 5,  y: 28, rot: -2 },
  { label: 'GHOST A WEDDING INVITE',                           pts: '-9,999.99',     size: 'lg',   pos: false, x: 62, y: 25, rot: 2  },
  { label: 'BE A COMMISSIONER OF PROFESSIONAL FOOTBALL LEAGUE',pts: '-824.55',       size: 'md',   pos: false, x: 68, y: 14, rot: -1 },
  { label: 'POISON A RIVER',                                   pts: '-4,010.55',     size: 'md',   pos: false, x: 4,  y: 52, rot: 1  },
  { label: 'PURIFY WATER SOURCE',                              pts: '+295.98',       size: 'md',   pos: true,  x: 70, y: 52, rot: -2 },
  { label: 'RUIN OPERA WITH BOORISH BEHAVIOR',                 pts: '-90.90',        size: 'md',   pos: false, x: 55, y: 64, rot: 3  },
  { label: 'MAINTAIN COMPOSURE IN LINE AT WATER PARK',         pts: '+61.14',        size: 'sm',   pos: true,  x: 3,  y: 68, rot: -1 },
  { label: 'TELL A WOMAN TO SMILE',                            pts: '-53.83',        size: 'sm',   pos: false, x: 72, y: 38, rot: 2  },
  { label: 'OVERSTATE PERSONAL CONNECTION TO TRAGEDY',         pts: '-40.57',        size: 'sm',   pos: false, x: 8,  y: 80, rot: -2 },
  { label: 'FORGET TO RSVP',                                   pts: '-299.11',       size: 'md',   pos: false, x: 38, y: 72, rot: 1  },
  { label: 'DANCE AT RECEPTION',                               pts: '+123.45',       size: 'md',   pos: true,  x: 70, y: 76, rot: -1 },
  { label: "REMEMBER SISTER'S BIRTHDAY",                       pts: '+15.02',        size: 'sm',   pos: true,  x: 50, y: 18, rot: -3 },
  { label: 'USE FACEBOOK AS AN ADULT',                         pts: '-5.55',         size: 'xs',   pos: false, x: 82, y: 48, rot: 2  },
  { label: 'CRY AT A WEDDING (HAPPY TEARS)',                   pts: '+45.67',        size: 'sm',   pos: true,  x: 80, y: 62, rot: -2 },
  { label: 'SCRATCH ELBOW',                                    pts: '+1.06',         size: 'xs',   pos: true,  x: 40, y: 87, rot: 1  },
  { label: 'PET A LAMB',                                       pts: '+0.89',         size: 'xs',   pos: true,  x: 58, y: 84, rot: -1 },
  { label: 'SING TO A CHILD',                                  pts: '+0.69',         size: 'xs',   pos: true,  x: 88, y: 28, rot: 3  },
  { label: 'STEP CAREFULLY OVER FLOWER BED',                   pts: '+2.09',         size: 'xs',   pos: true,  x: 85, y: 8,  rot: -2 },
  { label: 'FIX BROKEN TRICYCLE FOR CHILD',                    pts: '+6.60',         size: 'xs',   pos: true,  x: 24, y: 92, rot: 2  },
  { label: 'PURIFY WATER SOURCE',                              pts: '+295.98',       size: 'sm',   pos: true,  x: 2,  y: 18, rot: 1  },
]

function formatScore(val) {
  const fixed = val.toFixed(2)
  const [int, dec] = fixed.split('.')
  return parseInt(int).toLocaleString('en-US') + '.' + dec
}

function Cactus({ flip }) {
  return (
    <div className="gp-cactus" style={flip ? { transform: 'scaleX(-1)' } : {}}>
      <div className="gp-cactus-bloom">🌸</div>
      <div className="gp-cactus-body">
        <div className="gp-cactus-arm gp-cactus-arm--l" />
        <div className="gp-cactus-arm gp-cactus-arm--r" />
      </div>
      <div className="gp-cactus-pot" />
    </div>
  )
}

export default function OpeningSequence({ onComplete }) {
  const [phase, setPhase]           = useState('welcome')
  const [visibleItems, setVisibleItems] = useState(0)
  const [score, setScore]           = useState(0)
  const [scoreReady, setScoreReady] = useState(false)
  const [showCongratz, setShowCongratz] = useState(false)
  const [showTagline, setShowTagline]   = useState(false)
  const [showSmallPrint, setShowSmallPrint] = useState(false)

  const wrapRef    = useRef(null)
  const welcomeRef = useRef(null)
  const boardRef   = useRef(null)
  const scoreWrapRef = useRef(null)
  const rafRef     = useRef(null)
  const tlRef      = useRef(null)

  const targetRef = useRef(
    parseFloat(
      String(Math.floor(750000 + Math.random() * 249999)) +
      '.' +
      String(Math.floor(Math.random() * 100)).padStart(2, '0')
    )
  )

  const complete = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    if (tlRef.current) tlRef.current.kill()
    onComplete()
  }, [onComplete])

  // Phase 1: Welcome — GSAP fade in, hold, then transition
  useEffect(() => {
    if (phase !== 'welcome' || !welcomeRef.current) return
    const tl = gsap.timeline()
    tlRef.current = tl
    tl.fromTo(welcomeRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    ).to(welcomeRef.current,
      { opacity: 0, y: -20, duration: 0.5, ease: 'power2.in' },
      '+=2'
    ).call(() => setPhase('board'))
    return () => tl.kill()
  }, [phase])

  // Phase 2: Board — items fan in, then transition
  useEffect(() => {
    if (phase !== 'board') return
    setVisibleItems(0)
    let i = 0
    const interval = setInterval(() => {
      i++
      setVisibleItems(i)
      if (i >= BOARD_ITEMS.length) clearInterval(interval)
    }, 120)

    const tBoardOut = setTimeout(() => {
      if (!boardRef.current) return
      gsap.to(boardRef.current, {
        opacity: 0, y: -30, duration: 0.5, ease: 'power2.in',
        onComplete: () => setPhase('score'),
      })
    }, 4000)

    return () => { clearInterval(interval); clearTimeout(tBoardOut) }
  }, [phase])

  // Phase 3: Score count-up
  useEffect(() => {
    if (phase !== 'score' || !scoreWrapRef.current) return
    gsap.fromTo(scoreWrapRef.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }
    )

    const TARGET   = targetRef.current
    const DURATION = 2800
    const start    = performance.now()
    const tick = (now) => {
      const t     = Math.min((now - start) / DURATION, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setScore(parseFloat((eased * TARGET).toFixed(2)))
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setScore(TARGET)
        setScoreReady(true)
        setTimeout(() => setShowCongratz(true),  300)
        setTimeout(() => setShowTagline(true),   900)
        setTimeout(() => setShowSmallPrint(true), 1500)
        setTimeout(() => {
          gsap.to(scoreWrapRef.current, {
            opacity: 0, y: -20, duration: 0.5, ease: 'power2.in',
            onComplete: complete,
          })
        }, 3800)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [phase, complete])

  return (
    <div ref={wrapRef} className="gp-seq">
      <button className="gp-seq-skip" onClick={complete}>Skip ›</button>

      {/* Phase 1: Welcome */}
      {phase === 'welcome' && (
        <div ref={welcomeRef} className="gp-welcome" style={{ opacity: 0 }}>
          <div className="gp-welcome-inner">
            <Cactus />
            <div className="gp-welcome-text-block">
              <span className="gp-welcome-line1">Welcome!</span>
              <span className="gp-welcome-line2">Everything is fine.</span>
            </div>
            <Cactus flip />
          </div>
          <div className="gp-welcome-floor">
            <div className="gp-welcome-couch">
              <div className="gp-welcome-couch-seat" />
              <div className="gp-welcome-couch-back" />
              <div className="gp-welcome-couch-arm gp-welcome-couch-arm--l" />
              <div className="gp-welcome-couch-arm gp-welcome-couch-arm--r" />
            </div>
          </div>
        </div>
      )}

      {/* Phase 2: Points board */}
      {phase === 'board' && (
        <div ref={boardRef} className="gp-pts-board">
          <span className="gp-pts-person">👤</span>
          {BOARD_ITEMS.slice(0, visibleItems).map((item, i) => (
            <div
              key={i}
              className={`gp-pts-item gp-pts-item--${item.size} gp-pts-item--${item.pos ? 'pos' : 'neg'}`}
              style={{ left: `${item.x}%`, top: `${item.y}%`, transform: `rotate(${item.rot}deg)` }}
            >
              <span className="gp-pts-label">{item.label}:</span>
              <span className="gp-pts-value">{item.pts}</span>
            </div>
          ))}
        </div>
      )}

      {/* Phase 3: Score reveal */}
      {phase === 'score' && (
        <div ref={scoreWrapRef} className="gp-score-wrap" style={{ opacity: 0 }}>
          <div className={`gp-score-panel${scoreReady ? ' gp-score-panel--ready' : ''}`}>
            <div className="gp-score-header">Your Final Score</div>
            <div className="gp-score-number">{formatScore(score)}</div>
            {showCongratz && <div className="gp-score-congratz">Congratulations</div>}
            {showTagline && (
              <div className="gp-score-tagline">
                You have been selected for The Good Place.
                <br />
                <span className="gp-score-invite">Wendy &amp; Guillermo request your presence.</span>
              </div>
            )}
            {showSmallPrint && (
              <div className="gp-score-smallprint">
                Score verified by the Committee. No appeals accepted.
              </div>
            )}
            {showCongratz && <div className="gp-score-seal">✦</div>}
          </div>
        </div>
      )}
    </div>
  )
}
