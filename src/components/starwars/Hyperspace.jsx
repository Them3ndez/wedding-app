import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const HyperspaceCtx = createContext(null)

export function HyperspaceProvider({ children }) {
  const [active, setActive] = useState(false)
  const rNavigate = useNavigate()

  const navigate = useCallback((path) => {
    setActive(true)
    setTimeout(() => {
      rNavigate(path)
      setTimeout(() => setActive(false), 500)
    }, 650)
  }, [rNavigate])

  return (
    <HyperspaceCtx.Provider value={{ navigate }}>
      {children}
      {active && <HyperspaceOverlay />}
    </HyperspaceCtx.Provider>
  )
}

export function useHyperspace() {
  return useContext(HyperspaceCtx)
}

function HyperspaceOverlay() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const cx = canvas.width / 2
    const cy = canvas.height / 2
    let progress = 0
    let raf

    // Build 120 streaks emanating from center
    const streaks = Array.from({ length: 120 }, () => {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 6 + 3
      const brightness = Math.random() * 0.6 + 0.4
      return { angle, speed, brightness, offset: Math.random() * 80 }
    })

    function draw() {
      progress += 0.035

      // Trail fade
      ctx.fillStyle = `rgba(0,0,0,${progress < 0.4 ? 0.15 : 0.3})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const stretch = Math.pow(progress, 1.8) * 180

      for (const s of streaks) {
        const dist = s.offset + progress * 120 * s.speed
        const x1 = cx + Math.cos(s.angle) * dist
        const y1 = cy + Math.sin(s.angle) * dist
        const x2 = cx + Math.cos(s.angle) * (dist + stretch * s.speed * .12)
        const y2 = cy + Math.sin(s.angle) * (dist + stretch * s.speed * .12)

        const alpha = Math.min(1, progress * 2.5) * s.brightness
        ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(3)})`
        ctx.lineWidth = Math.min(2, progress * 2)
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }

      // White flash near end
      if (progress > 0.65) {
        const flash = (progress - 0.65) * 2.5
        ctx.fillStyle = `rgba(255,255,255,${Math.min(.85, flash)})`
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      if (progress < 1.2) raf = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="hyperspace-overlay" style={{ animation: 'none' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  )
}
