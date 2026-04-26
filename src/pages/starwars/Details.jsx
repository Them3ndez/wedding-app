import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import R2D2Chat from '../../components/starwars/R2D2Chat'

gsap.registerPlugin(ScrollTrigger)

const schedule = [
  { time: '16:00 Hours', event: 'The Ceremony Commences',    desc: 'Join us as Wendy & Guillermo exchange vows in a ceremony surrounded by the mountains of Jalisco.' },
  { time: '16:45 Hours', event: 'Cantina Hour',              desc: 'Celebrate with craft cocktails, canapés, and good company while the stars begin to emerge overhead.' },
  { time: '18:30 Hours', event: 'Celebration Banquet',       desc: 'Sit down for a feast inspired by the finest galaxies — and the finest kitchens of Mascota.' },
  { time: '23:00 Hours', event: 'Final Jump to Hyperspace',  desc: 'The night draws to a close. May the Force guide you safely home — until we meet again in the stars.' },
]

const info = [
  {
    title: 'Dress Code',
    text: 'Galactic Formal. Think elegant attire — dark tones, metallics, and celestial accents welcome. Leave the Stormtrooper armor at home.',
  },
  {
    title: 'Venue',
    text: 'Quinta el Pedregal · Calle Privada s/n, Mascota, Jalisco, México. Nestled in the Sierra Madre Occidental mountains, the venue is a private estate surrounded by lush gardens.',
  },
  {
    title: 'Getting There',
    text: 'The nearest major airport is Licenciado Gustavo Díaz Ordaz International Airport (PVR) in Puerto Vallarta, approximately 2.5 hours by road. Shuttle service from PVR will be provided — details in your formal invitation.',
  },
  {
    title: 'Accommodation',
    text: "We've partnered with several hotels in Mascota. A room block is available at Hotel Agustina. Please mention the Wendy & Guillermo wedding when booking. Additional options are available in the town centre.",
  },
  {
    title: 'Language',
    text: 'The ceremony and reception will be bilingual — English and Spanish. Like the Force, love transcends all language.',
  },
]

export default function Details() {
  const containerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.section-heading').forEach(el => {
        gsap.fromTo(el,
          { opacity: 0, x: -40 },
          {
            opacity: 1, x: 0, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        )
      })

      gsap.utils.toArray('.tl-item').forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, x: -40 },
          {
            opacity: 1, x: 0, duration: 0.8, ease: 'power2.out', delay: i * 0.1,
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        )
      })

      gsap.utils.toArray('.info-card').forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, y: 50 },
          {
            opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: i * 0.1,
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        )
      })
    }, containerRef)

    return () => { ctx.revert(); ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [])

  return (
    <>
    <div ref={containerRef} className="sw-container" style={{ paddingBottom: '6rem' }}>
      <div className="page-header">
        <h1 className="page-heading">Transmission</h1>
        <p className="page-subheading">Event Details &amp; Orders of the Day</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '4rem' }}>
        <div>
          <h2 className="section-heading">Order of Events</h2>
          <div className="timeline">
            {schedule.map((item, i) => (
              <div key={i} className="tl-item" style={{ animationDelay: `${i * .08}s` }}>
                <p className="tl-time">{item.time}</p>
                <h3 className="tl-event">{item.event}</h3>
                <p className="tl-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="section-heading">Intel</h2>
          {info.map((card, i) => (
            <div key={i} className="info-card" style={{ animationDelay: `${i * .07}s` }}>
              <p className="info-card-title">{card.title}</p>
              <p className="info-card-text">{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    <R2D2Chat />
    </>
  )
}
