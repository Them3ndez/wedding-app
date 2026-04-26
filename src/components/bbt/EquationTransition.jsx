import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const BBTCtx = createContext(null)

const EQUATIONS = [
  'E = mc²', 'F = ma', 'e^(iπ)+1=0', '∇·B = 0',
  'λ = h/mv', 'PV = nRT', 'a²+b²=c²', 'S = k·ln(W)',
  'Δx·Δp ≥ ℏ/2', '∑1/n²= π²/6', 'G·m₁m₂/r²', 'c = λν',
]

export function EquationTransitionProvider({ children }) {
  const [active, setActive] = useState(false)
  const rNavigate = useNavigate()

  const navigate = useCallback((path) => {
    setActive(true)
    setTimeout(() => {
      rNavigate(path)
      setTimeout(() => setActive(false), 400)
    }, 680)
  }, [rNavigate])

  return (
    <BBTCtx.Provider value={{ navigate }}>
      {children}
      {active && <EquationOverlay />}
    </BBTCtx.Provider>
  )
}

export function useBBTTransition() {
  return useContext(BBTCtx)
}

function EquationOverlay() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const W = canvas.width, H = canvas.height

    let progress = 0
    let raf

    // Equations fly outward from center
    const items = Array.from({ length: EQUATIONS.length * 2 }, (_, i) => {
      const angle = (i / (EQUATIONS.length * 2)) * Math.PI * 2 + (Math.random() - 0.5) * 0.4
      const speed = Math.random() * 6 + 3
      return {
        text: EQUATIONS[i % EQUATIONS.length],
        x: W / 2, y: H / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.floor(Math.random() * 8 + 11),
        color: Math.random() > 0.55 ? '#ffcc00' : '#4466cc',
      }
    })

    function draw() {
      progress += 0.042

      ctx.fillStyle = `rgba(10,10,26,${Math.min(0.88, progress * 1.6)})`
      ctx.fillRect(0, 0, W, H)

      const fade = Math.min(1, progress * 2.8) * (1 - Math.max(0, (progress - 0.65) * 2.8))

      for (const it of items) {
        it.x += it.vx
        it.y += it.vy
        if (fade <= 0) continue

        ctx.globalAlpha = fade
        ctx.fillStyle = it.color
        ctx.shadowBlur = 8
        ctx.shadowColor = it.color
        ctx.font = `${it.size}px 'Courier New', monospace`
        ctx.fillText(it.text, it.x, it.y)
      }
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1

      // Fade to BBT background
      if (progress > 0.65) {
        const cover = Math.min(1, (progress - 0.65) * 2.8)
        ctx.fillStyle = `rgba(10,10,26,${cover})`
        ctx.fillRect(0, 0, W, H)
      }

      if (progress < 1.2) raf = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  )
}
