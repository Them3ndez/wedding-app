import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const MagneticCard = ({ children, className, style, onClick, scrollParallax = true, ...rest }) => {
  const cardRef = useRef(null)
  const innerRef = useRef(null)
  const resetTimer = useRef(null)

  // ── Scroll intersection — fade/scale in on enter ─────────────────────────
  useEffect(() => {
    if (!cardRef.current) return

    gsap.fromTo(cardRef.current,
      {
        opacity: 0,
        y: 80,
        scale: 0.85,
        rotateX: 10
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 85%',
          end: 'top 40%',
          toggleActions: 'play none none reverse'
        }
      }
    )

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  // ── Scroll parallax drift ─────────────────────────────────────────────────
  useEffect(() => {
    if (!cardRef.current || !scrollParallax) return

    gsap.to(cardRef.current, {
      yPercent: -8,
      ease: 'none',
      scrollTrigger: {
        trigger: cardRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5
      }
    })
  }, [scrollParallax])

  // ── Desktop mouse tilt ───────────────────────────────────────────────────
  const handleMouseEnter = () => {
    clearTimeout(resetTimer.current)
    if (!cardRef.current) return
    cardRef.current.dataset.hovering = 'true'
    gsap.killTweensOf(cardRef.current)
    if (innerRef.current) gsap.killTweensOf(innerRef.current)
  }

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    cardRef.current.dataset.hovering = 'true'
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY
    const rotateX = (mouseY / (rect.height / 2)) * -15
    const rotateY = (mouseX / (rect.width / 2)) * 15

    gsap.to(cardRef.current, {
      rotateX,
      rotateY,
      scale: 1.05,
      transformPerspective: 1000,
      ease: 'power2.out',
      duration: 0.3
    })

    gsap.to(innerRef.current, {
      x: mouseX * -0.05,
      y: mouseY * -0.05,
      ease: 'power2.out',
      duration: 0.3
    })
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    delete cardRef.current.dataset.hovering
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      transformPerspective: 1000,
      ease: 'elastic.out(1, 0.5)',
      duration: 0.8
    })

    gsap.to(innerRef.current, {
      x: 0,
      y: 0,
      ease: 'elastic.out(1, 0.5)',
      duration: 0.8
    })
  }

  // ── Mobile touch tilt ────────────────────────────────────────────────────
  const handleTouchMove = (e) => {
    if (!cardRef.current) return
    const touch = e.touches[0]
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const touchX = touch.clientX - centerX
    const touchY = touch.clientY - centerY
    const rotateX = (touchY / (rect.height / 2)) * -10
    const rotateY = (touchX / (rect.width / 2)) * 10

    gsap.to(cardRef.current, {
      rotateX,
      rotateY,
      scale: 1.03,
      transformPerspective: 1000,
      ease: 'power2.out',
      duration: 0.2
    })
  }

  const handleTouchEnd = () => {
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      transformPerspective: 1000,
      ease: 'elastic.out(1, 0.4)',
      duration: 0.8
    })
  }

  // ── Mobile gyroscope ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!window.DeviceOrientationEvent) return

    let lastTime = 0
    const handleOrientation = (e) => {
      const now = Date.now()
      if (now - lastTime < 16) return            // ~60 fps throttle
      lastTime = now
      if (!cardRef.current || cardRef.current.dataset.hovering) return
      const tiltX = Math.min(Math.max((e.beta  || 0) - 45, -15), 15)
      const tiltY = Math.min(Math.max( e.gamma || 0,       -15), 15)
      cardRef.current.style.transform =
        `perspective(1000px) rotateX(${tiltX * -0.3}deg) rotateY(${tiltY * 0.3}deg) scale(1.02)`
    }

    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(p => {
          if (p === 'granted')
            window.addEventListener('deviceorientation', handleOrientation, { passive: true })
        })
        .catch(() => {})
    } else {
      window.addEventListener('deviceorientation', handleOrientation, { passive: true })
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation)
      clearTimeout(resetTimer.current)
    }
  }, [])

  return (
    <div
      ref={cardRef}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={onClick}
      style={{
        ...style,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        cursor: 'pointer',
      }}
      {...rest}
    >
      <div
        ref={innerRef}
        style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%' }}
      >
        {children}
      </div>
    </div>
  )
}

export default MagneticCard
