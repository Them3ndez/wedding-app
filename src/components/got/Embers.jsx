import { useMemo } from 'react'

// Winterfell snow — replaces fire embers
export default function Snow() {
  const particles = useMemo(() =>
    Array.from({ length: 98 }, (_, i) => {
      const size    = Math.random() * 5 + 1               // 1–6 px
      const delay   = Math.random() * 10                  // 0–10 s
      // Larger delay → longer duration (settling effect near bottom)
      const duration = Math.random() * 8 + 4 + delay * 0.4  // 4–16 s, longer for late starters
      const drift   = (Math.random() - 0.5) * 60          // -30 to +30 px side drift
      return {
        id:       i,
        size,
        x:        Math.random() * 100,                    // 0–100 vw
        startY:   -(Math.random() * 50 + 5),              // -5 to -55 px
        delay,
        duration: Math.min(duration, 16),                 // cap at 16 s
        drift,
        opacity:  Math.random() * 0.55 + 0.35,            // 0.35–0.9
        blur:     size > 4 ? 0.5 : 0,                     // blur larger flakes
      }
    }), []
  )

  return (
    <>
      <div className="got-snow-wrap">
        {particles.map(p => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              top:          `${p.startY}px`,
              left:         `${p.x}%`,
              width:        `${p.size}px`,
              height:       `${p.size}px`,
              borderRadius: '50%',
              background:   `rgba(220,235,255,${p.opacity})`,
              filter:       p.blur ? `blur(${p.blur}px)` : undefined,
              animation:    `snowfall-${p.id % 4} ${p.duration}s linear ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>


<style>{`
        @keyframes snowfall-0 {
          0%   { transform: translateY(0px)   translateX(0px);   opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.6; }
          100% { transform: translateY(110vh) translateX(20px);  opacity: 0; }
        }
        @keyframes snowfall-1 {
          0%   { transform: translateY(0px)   translateX(0px);   opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.6; }
          100% { transform: translateY(110vh) translateX(-25px); opacity: 0; }
        }
        @keyframes snowfall-2 {
          0%   { transform: translateY(0px)   translateX(0px);   opacity: 0; }
          10%  { opacity: 1; }
          50%  { transform: translateY(55vh)  translateX(15px); }
          90%  { opacity: 0.6; }
          100% { transform: translateY(110vh) translateX(30px);  opacity: 0; }
        }
        @keyframes snowfall-3 {
          0%   { transform: translateY(0px)   translateX(0px);   opacity: 0; }
          10%  { opacity: 1; }
          50%  { transform: translateY(55vh)  translateX(-18px); }
          90%  { opacity: 0.6; }
          100% { transform: translateY(110vh) translateX(-30px); opacity: 0; }
        }
      `}</style>
    </>
  )
}
