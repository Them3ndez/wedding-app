import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TyrionChat from '../../components/got/TyrionChat'

gsap.registerPlugin(ScrollTrigger)

const schedule = [
  { time: '16:00', event: 'The Ceremony',   desc: 'Wendy & Guillermo exchange their sacred vows beneath the open Jalisco sky, before the eyes of all the realm.' },
  { time: '16:45', event: 'The Toast',      desc: 'Raise your goblets to the newly wedded. Spiced wines, fine meads, and canapés await in the courtyard.' },
  { time: '18:30', event: 'The Feast',      desc: 'The Great Hall opens for a royal banquet — a spread worthy of Highgarden, prepared by the finest kitchens of Mascota.' },
  { time: '20:00', event: 'The Dance Party', desc: 'The night draws to its close with one final revel. Dance until the torches burn low and the stars claim the sky.' },
]

const info = [
  {
    title: 'Dress Code',
    text: 'Courtly Business Casual. Present yourself with honour — smart attire fit for the Small Council. Jewel tones of the Seven Kingdoms are most welcome. Crowns are encouraged; armour respectfully declined.',
  },
  {
    title: 'The Venue',
    text: 'Quinta el Pedregal · Calle Privada s/n, Mascota, Jalisco, México. A private estate nestled in the Sierra Madre Occidental — the closest thing to a castle the New World has to offer.',
  },
  {
    title: 'Reaching the Realm',
    text: 'Ride south from Licenciado Gustavo Díaz Ordaz International Airport (PVR) in Puerto Vallarta, approximately 2.5 hours by road. A royal escort — shuttle service — will be arranged from PVR. Details shall arrive with your formal invitation.',
  },
  {
    title: 'Shelter & Lodging',
    text: "We have arranged chambers at Hotel Agustina in Mascota. Mention the Wendy & Guillermo wedding when securing your rooms. The town also offers fine inns and additional lodgings within the castle's reach.",
  },
  {
    title: 'Tongue of the Realm',
    text: 'The vows shall be spoken in both the Common Tongue (English) and the tongue of New Westeros (Spanish), so that all houses of the realm may bear witness.',
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
        <h1 className="page-heading">The Proclamation</h1>
        <p className="page-subheading">Orders of the Realm &amp; the Day's Events</p>
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
          <h2 className="section-heading">Intelligence of the Realm</h2>
          {info.map((card, i) => (
            <div key={i} className="info-card" style={{ animationDelay: `${i * .07}s` }}>
              <p className="info-card-title">{card.title}</p>
              <p className="info-card-text">{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    <TyrionChat />
    </>
  )
}
