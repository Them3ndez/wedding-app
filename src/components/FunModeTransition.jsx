import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const N = 18
const ANGLES = Array.from({ length: N }, (_, i) => Math.round((360 / N) * i))

export default function FunModeTransition() {
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const [phase, setPhase] = useState('crack') // crack → flash → dark → text

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('flash'),  460),
      setTimeout(() => setPhase('dark'),   660),
      setTimeout(() => setPhase('text'),  1520),
      setTimeout(() => navigate('/'), 2650),
    ]
    return () => timers.forEach(clearTimeout)
  }, [navigate])

  useEffect(() => {
    if (phase !== 'dark' && phase !== 'text') return
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const cx = W / 2, cy = H / 2

    // Burst particles from center
    const burst = Array.from({ length: 220 }, () => {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 24 + 4
      return {
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: Math.random() * 3.5 + 0.5,
        life: Math.random() * 60 + 20,
        age: 0,
        color: Math.random() > 0.38 ? '#c9a84c' : '#ffffff',
      }
    })

    // Gold sparkles raining down
    const sparkles = Array.from({ length: 130 }, () => ({
      x: Math.random() * W,
      y: Math.random() * -H,
      vy: Math.random() * 3.5 + 1,
      r: Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.7 + 0.3,
      phase: Math.random() * Math.PI * 2,
    }))

    let raf
    function draw() {
      ctx.clearRect(0, 0, W, H)

      for (let i = burst.length - 1; i >= 0; i--) {
        const p = burst[i]
        p.age++; p.x += p.vx; p.y += p.vy
        p.vy += 0.38; p.vx *= 0.984
        const a = Math.max(0, 1 - p.age / p.life)
        if (a <= 0) { burst.splice(i, 1); continue }
        ctx.globalAlpha = a
        ctx.fillStyle = p.color
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill()
      }

      for (const s of sparkles) {
        s.y += s.vy; s.phase += 0.07
        if (s.y > H + 10) { s.y = -10; s.x = Math.random() * W }
        const flicker = 0.3 + 0.7 * Math.abs(Math.sin(s.phase))
        ctx.globalAlpha = s.alpha * flicker
        ctx.shadowBlur = 6; ctx.shadowColor = '#c9a84c'
        ctx.fillStyle = '#c9a84c'
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill()
        ctx.shadowBlur = 0
      }

      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [phase])

  const bg = phase === 'crack' ? 'rgba(255,255,255,0.96)'
           : phase === 'flash' ? '#ffffff'
           : '#000000'

  return (
    <div className="fmt-overlay" style={{ background: bg }}>
      {phase === 'crack' && (
        <div className="fmt-cracks">
          {ANGLES.map(a => (
            <div key={a} className="fmt-crack" style={{ '--a': `${a}deg` }} />
          ))}
        </div>
      )}
      {(phase === 'dark' || phase === 'text') && (
        <canvas ref={canvasRef} className="fmt-canvas" />
      )}
      {phase === 'text' && (
        <p className="fmt-label">
          Entering Fun Mode <span className="fmt-star">✦</span>
        </p>
      )}
    </div>
  )
}
