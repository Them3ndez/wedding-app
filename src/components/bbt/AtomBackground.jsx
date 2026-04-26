import { useEffect, useRef } from 'react'

function makeAtom(W, H) {
  const r = Math.random() * 18 + 8
  const nOrbits = Math.floor(Math.random() * 2) + 2
  const orbits = Array.from({ length: nOrbits }, (_, i) => ({
    rx: r * (2.2 + i * 0.9),
    ry: r * (1.1 + i * 0.5),
    tilt: (i * Math.PI) / nOrbits + Math.random() * 0.5,
    speed: (Math.random() * 0.012 + 0.006) * (Math.random() > 0.5 ? 1 : -1),
    phase: Math.random() * Math.PI * 2,
    electrons: Math.floor(Math.random() * 2) + 1,
    alpha: Math.random() * 0.45 + 0.2,
  }))
  return {
    x: Math.random() * W,
    y: Math.random() * H,
    r,
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.18,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.003,
    alpha: Math.random() * 0.35 + 0.15,
    orbits,
  }
}

export default function AtomBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resize()
    const atoms = Array.from({ length: 9 }, () => makeAtom(canvas.width, canvas.height))
    let t = 0

    function drawGrid() {
      const cw = 68, ch = 52
      ctx.save()
      ctx.globalAlpha = 0.035
      ctx.strokeStyle = '#4a90d9'
      ctx.lineWidth = 1
      for (let x = 0; x <= canvas.width; x += cw) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke()
      }
      for (let y = 0; y <= canvas.height; y += ch) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke()
      }
      ctx.restore()
    }

    function drawAtom(a) {
      ctx.save()
      ctx.translate(a.x, a.y)
      ctx.rotate(a.rotation)

      // Nucleus — bright blue with strong glow
      ctx.beginPath()
      ctx.arc(0, 0, a.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(74,144,217,${a.alpha})`
      ctx.shadowBlur = 20
      ctx.shadowColor = '#4a90d9'
      ctx.fill()
      ctx.shadowBlur = 0

      // Orbits + electrons
      for (const o of a.orbits) {
        // Orbit path — bright blue ring
        ctx.beginPath()
        ctx.ellipse(0, 0, o.rx, o.ry, o.tilt, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(74,144,217,${o.alpha})`
        ctx.lineWidth = 1
        ctx.shadowBlur = 6
        ctx.shadowColor = '#4a90d9'
        ctx.stroke()
        ctx.shadowBlur = 0

        // Electrons — bright yellow glowing dots
        for (let i = 0; i < o.electrons; i++) {
          const angle = o.phase + (i * Math.PI * 2) / o.electrons
          const ex = Math.cos(angle) * o.rx * Math.cos(o.tilt) - Math.sin(angle) * o.ry * Math.sin(o.tilt)
          const ey = Math.cos(angle) * o.rx * Math.sin(o.tilt) + Math.sin(angle) * o.ry * Math.cos(o.tilt)
          ctx.beginPath()
          ctx.arc(ex, ey, Math.max(2.5, a.r * 0.28), 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,221,0,${Math.min(1, o.alpha * 2.8)})`
          ctx.shadowBlur = 14
          ctx.shadowColor = '#ffdd00'
          ctx.fill()
          ctx.shadowBlur = 0
        }

        o.phase += o.speed
      }

      ctx.restore()
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      drawGrid()

      for (const a of atoms) {
        a.x += a.vx
        a.y += a.vy
        a.rotation += a.rotSpeed

        // Wrap around edges
        const pad = 80
        if (a.x < -pad) a.x = canvas.width + pad
        if (a.x > canvas.width + pad) a.x = -pad
        if (a.y < -pad) a.y = canvas.height + pad
        if (a.y > canvas.height + pad) a.y = -pad

        drawAtom(a)
      }

      t++
      raf = requestAnimationFrame(draw)
    }

    draw()
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} className="bbt-bg-canvas" />
}
