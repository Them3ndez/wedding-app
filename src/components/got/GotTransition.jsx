import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const GotTransitionCtx = createContext(null)

export function GotTransitionProvider({ children }) {
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
    <GotTransitionCtx.Provider value={{ navigate }}>
      {children}
      {active && <FireOverlay />}
    </GotTransitionCtx.Provider>
  )
}

export function useGotTransition() {
  return useContext(GotTransitionCtx)
}

function FireOverlay() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let progress = 0
    let raf

    const sparks = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: canvas.height * (0.5 + Math.random() * 0.5),
      vx: (Math.random() - 0.5) * 3,
      vy: -(Math.random() * 5 + 2),
      r: Math.random() * 2.5 + 0.5,
      rgb: Math.random() > 0.5 ? [201, 168, 76] : [220, 80, 10],
    }))

    function draw() {
      progress += 0.04

      ctx.fillStyle = `rgba(6,6,10,${Math.min(0.92, progress * 1.8)})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (const s of sparks) {
        s.x += s.vx
        s.y += s.vy
        const alpha = Math.max(0, (1 - progress) * 0.9)
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${s.rgb[0]},${s.rgb[1]},${s.rgb[2]},${alpha.toFixed(3)})`
        ctx.fill()
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
