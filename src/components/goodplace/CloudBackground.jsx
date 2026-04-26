import { useEffect, useRef } from 'react'

function makeCloud(w, h) {
  return {
    x: Math.random() * w * 1.4 - w * 0.2,
    y: Math.random() * h * 0.62 + 20,
    r: 55 + Math.random() * 85,
    speed: 0.07 + Math.random() * 0.13,
    alpha: 0.04 + Math.random() * 0.06, // very subtle on white
    puffs: Array.from({ length: 4 + Math.floor(Math.random() * 3) }, () => ({
      dx: (Math.random() - 0.5) * 130,
      dy: (Math.random() - 0.5) * 38,
      r: 28 + Math.random() * 58,
    })),
  }
}

function makeSparkle(w, h) {
  return {
    x: Math.random() * w,
    y: h + Math.random() * 80,
    vy: -(0.22 + Math.random() * 0.42),
    vx: (Math.random() - 0.5) * 0.28,
    alpha: 0,
    maxAlpha: 0.18 + Math.random() * 0.28,
    size: 0.8 + Math.random() * 2.0,
    life: 0,
    maxLife: 150 + Math.random() * 220,
    isGold: Math.random() > 0.65, // mix of green and gold sparkles
  }
}

export default function CloudBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf
    let w = 0
    let h = 0
    const clouds = []
    const sparkles = []

    function resize() {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }

    function drawCloud(c) {
      ctx.save()
      ctx.globalAlpha = c.alpha
      const draw = (cx, cy, r) => {
        // White/very light gray on white background — barely visible
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        g.addColorStop(0, 'rgba(220,230,220,0.95)')
        g.addColorStop(0.5, 'rgba(230,240,230,0.45)')
        g.addColorStop(1, 'rgba(240,245,240,0)')
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
      }
      draw(c.x, c.y, c.r)
      for (const p of c.puffs) draw(c.x + p.dx, c.y + p.dy, p.r)
      ctx.restore()
    }

    function drawRays(t) {
      ctx.save()
      // Very faint gold shimmer from top center
      const pulse = 0.012 + 0.005 * Math.sin(t * 0.0007)
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 0.48 - Math.PI * 0.24
        const x1 = w * 0.5
        const y1 = -30
        const len = h * 1.6
        const spread = 32 + i * 6
        const x2 = x1 + Math.sin(angle) * len
        const y2 = y1 + Math.cos(angle) * len
        const g = ctx.createLinearGradient(x1, y1, x2, y2)
        g.addColorStop(0, `rgba(254,192,19,${pulse * 1.2})`)
        g.addColorStop(0.3, `rgba(254,192,19,${pulse * 0.4})`)
        g.addColorStop(1, 'rgba(254,192,19,0)')
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2 - spread, y2)
        ctx.lineTo(x2 + spread, y2)
        ctx.closePath()
        ctx.fillStyle = g
        ctx.fill()
      }
      ctx.restore()
    }

    function drawSparkle(s) {
      if (s.alpha <= 0) return
      ctx.save()
      ctx.globalAlpha = s.alpha
      // Green sparkles rising, occasional gold
      ctx.fillStyle = s.isGold ? '#fec013' : '#41803c'
      ctx.beginPath()
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4 - Math.PI / 2
        const r = i % 2 === 0 ? s.size : s.size * 0.35
        if (i === 0) ctx.moveTo(s.x + Math.cos(angle) * r, s.y + Math.sin(angle) * r)
        else ctx.lineTo(s.x + Math.cos(angle) * r, s.y + Math.sin(angle) * r)
      }
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }

    resize()

    for (let i = 0; i < 7; i++) {
      const c = makeCloud(w, h)
      c.x = Math.random() * w
      clouds.push(c)
    }
    for (let i = 0; i < 28; i++) {
      const s = makeSparkle(w, h)
      s.life = Math.floor(Math.random() * s.maxLife)
      sparkles.push(s)
    }

    let t = 0
    function draw() {
      t++
      ctx.clearRect(0, 0, w, h)
      drawRays(t)
      for (const c of clouds) {
        c.x += c.speed
        if (c.x - c.r * 2.5 > w) {
          Object.assign(c, makeCloud(w, h))
          c.x = -c.r * 3
        }
        drawCloud(c)
      }
      for (const s of sparkles) {
        s.life++
        s.x += s.vx
        s.y += s.vy
        const half = s.maxLife / 2
        s.alpha =
          s.life < half
            ? (s.life / half) * s.maxAlpha
            : ((s.maxLife - s.life) / half) * s.maxAlpha
        if (s.life >= s.maxLife) {
          Object.assign(s, makeSparkle(w, h))
        }
        drawSparkle(s)
      }
      raf = requestAnimationFrame(draw)
    }
    draw()

    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="gp-canvas-bg" />
}
