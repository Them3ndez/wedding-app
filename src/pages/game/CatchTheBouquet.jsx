import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import '../../styles/game.css'

// ── Level config ────────────────────────────────────────────────────────────
const LEVELS = [
  { minCatches: 0,  count: 1, speed: 1.8, drift: 0.4 },
  { minCatches: 5,  count: 1, speed: 2.5, drift: 0.75 },
  { minCatches: 12, count: 2, speed: 3.0, drift: 1.0 },
  { minCatches: 20, count: 2, speed: 3.6, drift: 1.3 },
  { minCatches: 30, count: 3, speed: 4.2, drift: 1.6 },
  { minCatches: 45, count: 3, speed: 5.1, drift: 2.0 },
]

const COMBO_MULTS = [1, 1, 1.5, 2, 3, 5]
const RANK_ICONS  = ['👑', '🥈', '🥉']

function getLevelIndex(catches) {
  let idx = 0
  for (let i = 0; i < LEVELS.length; i++) {
    if (catches >= LEVELS[i].minCatches) idx = i
  }
  return idx
}

function getMessage(score) {
  if (score <= 5)  return "Wendy is not impressed. Keep practicing. 😬"
  if (score <= 15) return "Not bad! You might survive the reception. 🥂"
  if (score <= 30) return "Impressive! Front row seat for you. 🌸"
  if (score <= 50) return "You are basically a professional. 💐"
  if (score <= 99) return "LEGENDARY. Wendy wants you as maid of honor. 👑"
  return "ARE YOU EVEN HUMAN?! 🤖"
}

let _uid = 0
function uid() { return ++_uid }

function makeBouquet(screenW, levelIdx, existingXs = []) {
  const cfg = LEVELS[Math.min(levelIdx, LEVELS.length - 1)]
  let x, tries = 0
  do {
    x = 55 + Math.random() * (screenW - 110)
    tries++
  } while (existingXs.some(ex => Math.abs(ex - x) < 80) && tries < 12)
  return {
    id: uid(),
    x,
    y: -70,
    speed: cfg.speed + Math.random() * 0.5,
    drift: cfg.drift * (0.6 + Math.random() * 0.8),
    driftPhase: Math.random() * Math.PI * 2,
  }
}

// ── Sub-components ──────────────────────────────────────────────────────────
function Stars() {
  const stars = useMemo(() =>
    Array.from({ length: 32 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2.2,
      delay: Math.random() * 4,
      dur: 2 + Math.random() * 3,
    })), [])
  return (
    <div className="game-stars-layer">
      {stars.map((s, i) => (
        <div key={i} className="game-star" style={{
          left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size,
          animationDelay: `${s.delay}s`,
          animationDuration: `${s.dur}s`,
        }} />
      ))}
    </div>
  )
}

function BgPetals() {
  const petals = useMemo(() =>
    Array.from({ length: 9 }, () => ({
      x: Math.random() * 100,
      size: 12 + Math.random() * 12,
      delay: Math.random() * 7,
      dur: 7 + Math.random() * 8,
    })), [])
  return (
    <div className="bg-petals">
      {petals.map((p, i) => (
        <div key={i} className="bg-petal" style={{
          left: `${p.x}%`, fontSize: p.size,
          animationDuration: `${p.dur}s`,
          animationDelay: `${p.delay}s`,
        }}>🌸</div>
      ))}
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────
export default function CatchTheBouquet() {
  const navigate = useNavigate()

  // Screen
  const [screen,       setScreen]       = useState('menu')
  const [playerName,   setPlayerName]   = useState('')
  const [cdVal,        setCdVal]        = useState(3)
  const [cdKey,        setCdKey]        = useState(0)

  // Live HUD (trigger renders)
  const [displayScore, setDisplayScore] = useState(0)
  const [displayLives, setDisplayLives] = useState(3)
  const [displayLevel, setDisplayLevel] = useState(1)
  const [missFlash,    setMissFlash]    = useState(false)
  const [levelUpFlash, setLevelUpFlash] = useState(false)
  const [paused,       setPaused]       = useState(false)

  // Game over data
  const [goScore,      setGoScore]      = useState(0)
  const [goCatches,    setGoCatches]    = useState(0)
  const [goBestCombo,  setGoBestCombo]  = useState(0)
  const [isNewBest,    setIsNewBest]    = useState(false)
  const [submitting,   setSubmitting]   = useState(false)

  // Leaderboard
  const [leaderboard,  setLeaderboard]  = useState([])
  const [lbLoading,    setLbLoading]    = useState(false)

  // Force render each game frame
  const [, setTick] = useState(0)

  // ── Game refs ──────────────────────────────────────────────────────────
  const rafRef        = useRef(null)
  const activeRef     = useRef(false)
  const pausedRef     = useRef(false)
  const frameRef      = useRef(0)
  const gameAreaRef   = useRef(null)

  const targetXRef    = useRef(window.innerWidth / 2)
  const handXRef      = useRef(window.innerWidth / 2)
  const catchAnimRef  = useRef(false)
  const shakeAnimRef  = useRef(false)

  const bouquetsRef   = useRef([])
  const particlesRef  = useRef([])
  const floatTextsRef = useRef([])

  const scoreRef      = useRef(0)
  const livesRef      = useRef(3)
  const levelRef      = useRef(0)
  const catchesRef    = useRef(0)
  const comboRef      = useRef(0)
  const bestComboRef  = useRef(0)

  // Stable callback ref — allows game loop to call latest endGame
  const endGameCbRef  = useRef(null)
  const levelUpCbRef  = useRef(null)

  // ── Supabase helpers ───────────────────────────────────────────────────
  const fetchLeaderboard = useCallback(async () => {
    setLbLoading(true)
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('name, score')
        .order('score', { ascending: false })
        .limit(5)
      if (!error && data) setLeaderboard(data)
    } catch (e) {
      console.error('LB fetch:', e)
    } finally {
      setLbLoading(false)
    }
  }, [])

  useEffect(() => {
    if (screen === 'menu' || screen === 'leaderboard') fetchLeaderboard()
  }, [screen, fetchLeaderboard])

  // ── Particle helpers ───────────────────────────────────────────────────
  function spawnParticles(x, y) {
    const emojis = ['💗', '🌸', '✨', '💖', '🌺', '🎀']
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i / 8) + (Math.random() - 0.5) * 0.7
      const spd   = 2.2 + Math.random() * 3.5
      particlesRef.current.push({
        id: uid(), x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 2.5,
        life: 1,
        decay: 0.018 + Math.random() * 0.014,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        size: 14 + Math.random() * 12,
      })
    }
  }

  function addFloatText(x, y, text) {
    floatTextsRef.current.push({ id: uid(), x, y, text, life: 1, vy: -1.3 })
  }

  // ── Game loop ──────────────────────────────────────────────────────────
  const gameLoop = useCallback(() => {
    if (!activeRef.current || pausedRef.current) return

    const frame = frameRef.current++
    const sw    = window.innerWidth
    const sh    = window.innerHeight
    const handY = sh - 100

    // Lerp hand
    handXRef.current += (targetXRef.current - handXRef.current) * 0.15

    // Update bouquets
    const keep = []
    for (const b of bouquetsRef.current) {
      b.y += b.speed
      b.x += Math.sin(frame * 0.04 + b.driftPhase) * b.drift
      b.x  = Math.max(30, Math.min(sw - 30, b.x))
      b.rotation = Math.sin(frame * 0.06 + b.driftPhase) * 18

      const dx = Math.abs(b.x - handXRef.current)
      const dy = Math.abs(b.y - handY)

      if (dx < 56 && dy < 48) {
        // ── CAUGHT ──
        comboRef.current++
        if (comboRef.current > bestComboRef.current) bestComboRef.current = comboRef.current
        catchesRef.current++

        const mi  = Math.min(comboRef.current, COMBO_MULTS.length - 1)
        const pts = Math.round(10 * COMBO_MULTS[mi])
        scoreRef.current += pts

        spawnParticles(b.x, handY)
        if (comboRef.current >= 2) addFloatText(b.x, handY - 32, `x${comboRef.current} COMBO!`)

        catchAnimRef.current = true
        setTimeout(() => { catchAnimRef.current = false }, 220)

        setDisplayScore(scoreRef.current)

        const newLv = getLevelIndex(catchesRef.current)
        if (newLv > levelRef.current) {
          levelRef.current = newLv
          levelUpCbRef.current && levelUpCbRef.current(newLv + 1)
        }
        continue // don't keep
      }

      if (b.y > sh + 80) {
        // ── MISSED ──
        comboRef.current = 0
        livesRef.current--
        setDisplayLives(livesRef.current)
        setMissFlash(true)
        setTimeout(() => setMissFlash(false), 370)
        shakeAnimRef.current = true
        setTimeout(() => { shakeAnimRef.current = false }, 370)

        if (livesRef.current <= 0) {
          activeRef.current = false
          cancelAnimationFrame(rafRef.current)
          setTimeout(() => endGameCbRef.current && endGameCbRef.current(), 80)
          return
        }
        continue // don't keep
      }

      keep.push(b)
    }
    bouquetsRef.current = keep

    // Spawn as needed
    const cfg = LEVELS[Math.min(levelRef.current, LEVELS.length - 1)]
    while (bouquetsRef.current.length < cfg.count) {
      bouquetsRef.current.push(
        makeBouquet(sw, levelRef.current, bouquetsRef.current.map(b => b.x))
      )
    }

    // Particles
    particlesRef.current = particlesRef.current.filter(p => {
      p.x  += p.vx;  p.y  += p.vy
      p.vy += 0.13;  p.life -= p.decay
      return p.life > 0
    })

    // Float texts
    floatTextsRef.current = floatTextsRef.current.filter(t => {
      t.y += t.vy; t.life -= 0.026
      return t.life > 0
    })

    setTick(n => n + 1)
    rafRef.current = requestAnimationFrame(gameLoop)
  }, []) // empty deps — all mutable state via refs

  // Update stable callbacks every render (no stale closures in game loop)
  endGameCbRef.current = () => {
    const score = scoreRef.current
    const prev  = parseInt(localStorage.getItem('bouquet-best') || '0')
    const newB  = score > prev
    if (newB) localStorage.setItem('bouquet-best', String(score))

    setGoScore(score)
    setGoCatches(catchesRef.current)
    setGoBestCombo(bestComboRef.current)
    setIsNewBest(newB)
    setScreen('gameover')

    setSubmitting(true)
    supabase.from('leaderboard').insert([{ name: playerName, score }])
      .then(() => { setSubmitting(false); fetchLeaderboard() })
      .catch(() => setSubmitting(false))
  }

  levelUpCbRef.current = (newLevel) => {
    setDisplayLevel(newLevel)
    setLevelUpFlash(true)
    setTimeout(() => setLevelUpFlash(false), 1250)
  }

  // ── Touch/mouse listeners ──────────────────────────────────────────────
  useEffect(() => {
    if (screen !== 'game') return
    const el = gameAreaRef.current
    if (!el) return
    const onTouchStart = (e) => {
      e.preventDefault()
      targetXRef.current = e.touches[0].clientX
    }
    const onTouchMove = (e) => {
      e.preventDefault()
      targetXRef.current = e.touches[0].clientX
    }
    const onTouchEnd = (e) => { e.preventDefault() }
    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove',  onTouchMove,  { passive: false })
    el.addEventListener('touchend',   onTouchEnd,   { passive: false })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove',  onTouchMove)
      el.removeEventListener('touchend',   onTouchEnd)
    }
  }, [screen])

  // ── Cleanup on unmount ─────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      activeRef.current = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // ── Game actions ───────────────────────────────────────────────────────
  function startGame() {
    const sw = window.innerWidth
    scoreRef.current    = 0
    livesRef.current    = 3
    levelRef.current    = 0
    catchesRef.current  = 0
    comboRef.current    = 0
    bestComboRef.current = 0
    frameRef.current    = 0
    handXRef.current    = sw / 2
    targetXRef.current  = sw / 2
    bouquetsRef.current = [makeBouquet(sw, 0)]
    particlesRef.current  = []
    floatTextsRef.current = []
    activeRef.current   = true
    pausedRef.current   = false

    setDisplayScore(0)
    setDisplayLives(3)
    setDisplayLevel(1)
    setPaused(false)
    setMissFlash(false)
    setLevelUpFlash(false)
    setScreen('game')

    rafRef.current = requestAnimationFrame(gameLoop)
  }

  function startCountdown() {
    if (!playerName.trim()) return
    setScreen('countdown')
    setCdVal(3); setCdKey(k => k + 1)
    let n = 3
    function tick() {
      n--
      if (n > 0)  { setCdVal(n); setCdKey(k => k + 1); setTimeout(tick, 800) }
      else        { setCdVal('GO!'); setCdKey(k => k + 1); setTimeout(startGame, 720) }
    }
    setTimeout(tick, 800)
  }

  function togglePause() {
    const next = !pausedRef.current
    pausedRef.current = next
    setPaused(next)
    if (!next) {
      activeRef.current = true
      rafRef.current = requestAnimationFrame(gameLoop)
    } else {
      activeRef.current = false
      cancelAnimationFrame(rafRef.current)
    }
  }

  function quitToMenu() {
    activeRef.current = false
    cancelAnimationFrame(rafRef.current)
    setScreen('menu')
  }

  // ── Derived ────────────────────────────────────────────────────────────
  const personalBest = parseInt(localStorage.getItem('bouquet-best') || '0')
  const handY        = window.innerHeight - 100

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="game-root">
      <Stars />

      {/* ── MENU ── */}
      {screen === 'menu' && (
        <div className="game-screen-center">
          <div className="menu-bouquet">💐</div>
          <h1 className="game-title">Catch the Bouquet</h1>
          <p className="game-subtitle">Wendy &amp; Guillermo · Feb 7, 2027</p>
          <div className="menu-form">
            <input
              className="game-input"
              placeholder="Enter your name, rebel..."
              value={playerName}
              maxLength={20}
              onChange={e => setPlayerName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && startCountdown()}
              autoComplete="off"
            />
            <button
              className="game-btn game-btn--primary menu-play-btn"
              onClick={startCountdown}
              disabled={!playerName.trim()}
            >
              PLAY
            </button>
          </div>
          {personalBest > 0 && (
            <p className="menu-best">Your best: {personalBest.toLocaleString()} pts</p>
          )}
          <button className="menu-lb-link" onClick={() => setScreen('leaderboard')}>
            🏆 View Leaderboard
          </button>
          <button className="game-btn game-btn--outline" style={{ marginTop: 4, fontSize: '0.8rem', padding: '10px 20px', minWidth: 'auto' }} onClick={() => navigate('/')}>
            ← Back to Home
          </button>
        </div>
      )}

      {/* ── COUNTDOWN ── */}
      {screen === 'countdown' && (
        <div className="game-screen-center">
          <div key={cdKey} className={`countdown-number${cdVal === 'GO!' ? ' countdown-go' : ''}`}>
            {cdVal}
          </div>
        </div>
      )}

      {/* ── GAME ── */}
      {screen === 'game' && (
        <div
          ref={gameAreaRef}
          className="game-play-area"
          onMouseMove={e => { targetXRef.current = e.clientX }}
          onContextMenu={e => e.preventDefault()}
          style={{ touchAction: 'none' }}
        >
          <BgPetals />

          {/* HUD */}
          <div className="game-hud" onClick={togglePause} title="Tap to pause">
            <div className="hud-score">{displayScore.toLocaleString()}</div>
            <div className="hud-level">LEVEL {displayLevel}</div>
            <div className="hud-lives">
              {[0,1,2].map(i => <span key={i}>{i < displayLives ? '❤️' : '🖤'}</span>)}
            </div>
          </div>
          <div className="hud-divider" />

          {/* Bouquets */}
          {bouquetsRef.current.map(b => (
            <div key={b.id} className="bouquet-el" style={{
              left: b.x, top: b.y,
              transform: `translate(-50%, -50%) rotate(${b.rotation ?? 0}deg)`,
            }}>
              💐
            </div>
          ))}

          {/* Particles */}
          {particlesRef.current.map(p => (
            <div key={p.id} className="particle-el" style={{
              left: p.x, top: p.y, fontSize: p.size, opacity: p.life,
            }}>
              {p.emoji}
            </div>
          ))}

          {/* Floating combo texts */}
          {floatTextsRef.current.map(t => (
            <div key={t.id} className="floating-text" style={{
              left: t.x, top: t.y, opacity: t.life,
            }}>
              {t.text}
            </div>
          ))}

          {/* Hands */}
          <div
            className={`game-hand${catchAnimRef.current ? ' game-hand--catch' : ''}${shakeAnimRef.current ? ' game-hand--shake' : ''}`}
            style={{ left: handXRef.current, top: handY }}
          >
            👐
          </div>

          {/* Effects */}
          {missFlash    && <div className="miss-flash" />}
          {levelUpFlash && <div className="levelup-flash">LEVEL UP! ✨</div>}

          {/* Pause overlay */}
          {paused && (
            <div className="pause-overlay">
              <h2 className="pause-title">PAUSED</h2>
              <button className="game-btn game-btn--primary" onClick={togglePause}>▶ Resume</button>
              <button className="game-btn game-btn--outline" onClick={quitToMenu}>Quit</button>
            </div>
          )}
        </div>
      )}

      {/* ── GAME OVER ── */}
      {screen === 'gameover' && (
        <div className="game-screen-center gameover-screen">
          {isNewBest && <div className="new-best-banner">🎉 NEW PERSONAL BEST!</div>}
          <div className="gameover-heart">💔</div>
          <h1 className="gameover-title">GAME OVER</h1>
          <p className="gameover-catches">You caught {goCatches} bouquets!</p>
          <div className="gameover-score">{goScore.toLocaleString()}</div>
          <p className="gameover-combo">Best combo: x{goBestCombo}</p>
          <p className="gameover-msg">{getMessage(goScore)}</p>
          {submitting && <p className="gameover-saving">Saving score...</p>}
          <div className="gameover-btns">
            <button className="game-btn game-btn--primary" onClick={startCountdown}>
              PLAY AGAIN
            </button>
            <button className="game-btn game-btn--outline" onClick={() => setScreen('leaderboard')}>
              🏆 Leaderboard
            </button>
          </div>
        </div>
      )}

      {/* ── LEADERBOARD ── */}
      {screen === 'leaderboard' && (
        <div className="game-screen-center lb-screen">
          <h1 className="game-title">🏆 HALL OF FAME</h1>
          <p className="lb-subtitle">Top Bouquet Catchers</p>

          {lbLoading ? (
            <p className="lb-loading">Loading...</p>
          ) : leaderboard.length === 0 ? (
            <p className="lb-empty">Be the first on the leaderboard!</p>
          ) : (
            <div className="lb-list">
              {leaderboard.map((entry, i) => {
                const isMe = entry.name === playerName && screen === 'leaderboard' && entry.score === goScore
                return (
                  <div
                    key={i}
                    className={`lb-row lb-row--${i + 1}${isMe ? ' lb-row--me' : ''}`}
                    style={{ animationDelay: `${i * 0.09}s` }}
                  >
                    <span className="lb-rank">{RANK_ICONS[i] ?? `#${i + 1}`}</span>
                    <span className="lb-name">{entry.name}</span>
                    <span className="lb-score">{entry.score.toLocaleString()} pts</span>
                  </div>
                )
              })}
            </div>
          )}

          <div className="lb-btns">
            <button
              className="game-btn game-btn--primary"
              onClick={() => playerName.trim() ? startCountdown() : setScreen('menu')}
            >
              {playerName.trim() ? 'PLAY AGAIN' : 'PLAY'}
            </button>
            <button className="game-btn game-btn--outline" onClick={() => navigate('/')}>
              ← Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
