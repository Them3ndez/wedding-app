import { useState, useEffect, useCallback } from 'react'

let _id = 0
const rand = (min, max) => min + Math.random() * (max - min)

function makeGiraffe() {
  return {
    id: _id++,
    type: 'giraffe',
    fromLeft: Math.random() > 0.5,
    size: Math.round(rand(48, 96)),
    yPos: Math.round(rand(15, 72)),
    rotation: Math.round(rand(-10, 10)),
    duration: rand(9, 14).toFixed(1),
  }
}

function makeShrimp(xOverride) {
  return {
    id: _id++,
    type: 'shrimp',
    xPos: xOverride ?? Math.round(rand(5, 88)),
    size: Math.round(rand(32, 72)),
    duration: rand(7, 11).toFixed(1),
  }
}

function Creature({ data, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, parseFloat(data.duration) * 1000 + 400)
    return () => clearTimeout(t)
  }, [data.duration, onDone])

  if (data.type === 'giraffe') {
    return (
      <span
        className={`gp-chaos-creature gp-chaos-giraffe--${data.fromLeft ? 'ltr' : 'rtl'}`}
        style={{
          top: `${data.yPos}%`,
          fontSize: `${data.size}px`,
          '--rot': `${data.rotation}deg`,
          animationDuration: `${data.duration}s`,
        }}
        title="Everything is fine. 🦒"
        aria-hidden="true"
      >
        🦒
      </span>
    )
  }

  return (
    <span
      className="gp-chaos-creature gp-chaos-shrimp"
      style={{
        left: `${data.xPos}%`,
        fontSize: `${data.size}px`,
        animationDuration: `${data.duration}s`,
      }}
      title="This is fine. 🦐"
      aria-hidden="true"
    >
      🦐
    </span>
  )
}

export default function GoodPlaceChaos() {
  const [creatures, setCreatures] = useState([])

  const remove = useCallback((id) => {
    setCreatures(prev => prev.filter(c => c.id !== id))
  }, [])

  // Single creature every 8–15s
  useEffect(() => {
    let timer
    function schedule() {
      timer = setTimeout(() => {
        setCreatures(prev => {
          if (prev.length >= 3) return prev
          return [...prev, Math.random() > 0.4 ? makeGiraffe() : makeShrimp()]
        })
        schedule()
      }, rand(8000, 15000))
    }
    schedule()
    return () => clearTimeout(timer)
  }, [])

  // Shrimp swarm every 30–45s
  useEffect(() => {
    let timer
    function scheduleSwarm() {
      timer = setTimeout(() => {
        const count = Math.floor(rand(5, 9))
        const swarm = Array.from({ length: count }, () => makeShrimp(Math.round(rand(3, 90))))
        setCreatures(prev => [...prev, ...swarm])
        scheduleSwarm()
      }, rand(30000, 45000))
    }
    scheduleSwarm()
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="gp-chaos-wrap" aria-hidden="true">
      {creatures.map(c => (
        <Creature key={c.id} data={c} onDone={() => remove(c.id)} />
      ))}
    </div>
  )
}
