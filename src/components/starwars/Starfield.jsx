import { useEffect, useRef } from 'react'

export default function Starfield() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf

    const stars = []
    const NUM = 280

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    function init() {
      stars.length = 0
      for (let i = 0; i < NUM; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.4 + 0.3,
          alpha: Math.random(),
          delta: (Math.random() * 0.012 + 0.003) * (Math.random() < 0.5 ? 1 : -1),
        })
      }
    }

    function draw() {
      ctx.fillStyle = '#06060f'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (const s of stars) {
        s.alpha += s.delta
        if (s.alpha >= 1 || s.alpha <= 0) s.delta *= -1
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${Math.abs(s.alpha).toFixed(3)})`
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    resize()
    init()
    draw()
    window.addEventListener('resize', () => { resize(); init() })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', () => { resize(); init() })
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', display: 'block' }}
    />
  )
}
