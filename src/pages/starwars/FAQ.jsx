import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import R2D2Chat from '../../components/starwars/R2D2Chat'

gsap.registerPlugin(ScrollTrigger)

const faqs = [
  {
    q: 'What is the dress code?',
    a: 'Galactic Business Casual. Smart attire in dark tones, metallics, and celestial accents is most fitting. A subtle nod to the galaxy is always welcome — just leave the Stormtrooper armour at home.',
  },
  {
    q: 'How do I get to Mascota, Jalisco?',
    a: 'The closest airport is Puerto Vallarta International (PVR), approximately 2.5 hours away by road. We are arranging shuttle services from PVR — details will be included in your formal invitation. A scenic mountain drive is also an option for the adventurous Jedi.',
  },
  {
    q: 'Where should I stay?',
    a: "We have arranged a room block at Hotel Agustina in Mascota. Please mention \"Wendy & Guillermo\" when booking. The town also has several charming boutique hotels and Airbnbs within the Force's reach.",
  },
  {
    q: 'Can I bring my children?',
    a: 'Padawan learners are welcome! The reception will be family-friendly through dinner. After 10:00 PM, the dance floor becomes adults-only territory.',
  },
  {
    q: 'Will there be a gift registry?',
    a: 'Your presence is the greatest gift in the galaxy. If you wish to contribute, we have a honeymoon fund and a small registry — details will be shared with your formal invitation.',
  },
  {
    q: 'What language will the ceremony be in?',
    a: 'The ceremony and reception will be conducted in both English and Spanish. Like the Force, love needs no translation.',
  },
  {
    q: 'Is there parking at the venue?',
    a: 'Yes, Quinta el Pedregal has ample parking on-site. We encourage carpooling with fellow rebels, and a shuttle from the hotel will be available for those who prefer not to navigate hyperspace roads.',
  },
  {
    q: 'What if I have dietary restrictions?',
    a: 'We will accommodate all dietary needs. Please specify your requirements in your RSVP and we will ensure your meal is prepared accordingly. Even Wookiees are catered for.',
  },
  {
    q: 'When is the RSVP deadline?',
    a: 'The Rebel Alliance needs your response by February 7, 2027. Please transmit your attendance status via the "Confirm Attendance" section of this holographic transmission.',
  },
  {
    q: 'Will there be music and dancing?',
    a: 'Of course — what is a galactic celebration without music? We will have a live band during dinner and a DJ to close out the night. Song requests are welcome in the RSVP form.',
  },
]

function FAQItem({ q, a, delay }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="faq-item" style={{ animationDelay: `${delay}s` }}>
      <button className="faq-q" onClick={() => setOpen(v => !v)}>
        {q}
        <span className={`faq-icon ${open ? 'open' : ''}`}>+</span>
      </button>
      <p className={`faq-a ${open ? 'open' : ''}`}>{a}</p>
    </div>
  )
}

export default function FAQ() {
  const containerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const heading = containerRef.current.querySelector('.page-heading')
      if (heading) {
        gsap.fromTo(heading,
          { opacity: 0, x: -40 },
          { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' }
        )
      }

      gsap.utils.toArray('.faq-item').forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, y: 50 },
          {
            opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: i * 0.05,
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        )
      })
    }, containerRef)

    return () => { ctx.revert(); ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [])

  return (
    <div ref={containerRef} className="sw-container" style={{ paddingBottom: '6rem' }}>
      <div className="page-header">
        <h1 className="page-heading">Dispatches</h1>
        <p className="page-subheading">Frequently Asked Questions from the Alliance</p>
      </div>

      <div className="faq-list">
        {faqs.map((item, i) => (
          <FAQItem key={i} q={item.q} a={item.a} delay={i * .05} />
        ))}
      </div>
      <R2D2Chat />
    </div>
  )
}
