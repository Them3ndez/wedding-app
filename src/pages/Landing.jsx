import { useNavigate } from 'react-router-dom'
import MagneticCard from '../components/MagneticCard'
import '../styles/game.css'

const universes = [
  {
    id: 'starwars',
    icon: '✦',
    name: 'A Galaxy Far, Far Away',
    tagline: 'A Wedding in a Galaxy Far, Far Away',
    route: '/starwars',
    active: true,
  },
  {
    id: 'got',
    icon: '🐉',
    name: 'The Seven Kingdoms',
    tagline: 'When You Play the Game of Love, You Win or You Wed',
    route: '/got',
    active: true,
  },
  {
    id: 'bbt',
    icon: '⚛',
    name: 'The Apartment',
    tagline: "Love: The Most Complex Equation We've Solved",
    route: '/bbt',
    active: true,
  },
  {
    id: 'tgp',
    icon: '😇',
    name: 'The Good Place',
    tagline: "Holy Motherforking Shirtballs, We're Getting Married!",
    route: '/goodplace',
    active: false,
  },
  {
    id: 'game',
    icon: '💐',
    name: 'Catch the Bouquet',
    tagline: 'Can you catch them all? Top scores win bragging rights.',
    route: '/game',
    active: true,
  },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="landing-page">
      <div className="landing-bg" />

      <p className="landing-eyebrow">Wendy &amp; Guillermo — February 7, 2027</p>
      <h1 className="landing-title">Choose Your Adventure</h1>
      <p className="landing-sub">Select the universe in which you'd like to celebrate</p>

      <div className="landing-grid">
        {universes.map((u, i) => (
          <MagneticCard
            key={u.id}
            className={`universe-card ${u.active ? 'active' : 'inactive'}`}
            onClick={() => u.active && navigate(u.route)}
            style={{ animationDelay: `${.3 + i * .08}s` }}
            role={u.active ? 'button' : undefined}
            tabIndex={u.active ? 0 : undefined}
            onKeyDown={e => u.active && e.key === 'Enter' && navigate(u.route)}
          >
            {!u.active && <span className="universe-soon">Coming Soon</span>}
            <span className="universe-icon">{u.icon}</span>
            <h2 className="universe-name">{u.name}</h2>
            <p className="universe-tagline">{u.tagline}</p>
            {u.active && <span className="universe-cta">Enter {u.name} →</span>}
          </MagneticCard>
        ))}
      </div>

      <button className="landing-normal-btn" onClick={() => navigate('/')}>
        ← Normal Mode
      </button>
    </div>
  )
}
