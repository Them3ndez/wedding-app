import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TyrionChat from '../../components/got/TyrionChat'

gsap.registerPlugin(ScrollTrigger)

const faqs = [
  {
    q: 'What is the dress code?',
    a: "Realm Formal. We welcome the velvets and brocades of the Seven Kingdoms — deep burgundy, forest green, midnight blue, and gold are most fitting. A subtle sigil or house colours are encouraged. Armour is respectfully declined.",
  },
  {
    q: 'How do I reach Mascota, Jalisco?',
    a: "Ride south from Licenciado Gustavo Díaz Ordaz International Airport (PVR) in Puerto Vallarta, a journey of approximately 2.5 hours through the Sierra Madre. A royal escort — shuttle service — will be arranged from PVR. Details shall arrive with your formal invitation.",
  },
  {
    q: 'Where do I take shelter?',
    a: "We have arranged chambers at Hotel Agustina in Mascota. Mention the Wendy & Guillermo wedding when securing your rooms. The town also offers fine inns and lodgings within the castle's reach.",
  },
  {
    q: 'May I bring my children?',
    a: "Young squires and ladies-in-waiting are most welcome through the feast. After the tenth bell, the Great Hall becomes the domain of knights and lords only.",
  },
  {
    q: 'What of gifts for the couple?',
    a: "Your presence at court is the greatest honour you can bestow upon the House. For those who wish to contribute to the realm, a treasury fund has been established — details accompany your formal invitation.",
  },
  {
    q: 'What tongue shall be spoken?',
    a: "The vows shall be delivered in both the Common Tongue (English) and the tongue of New Westeros (Spanish), so that all houses of the realm may bear witness and understand.",
  },
  {
    q: 'Is there stabling at the venue?',
    a: "The grounds of Quinta el Pedregal offer ample room for your carriages. A carriage from the inn shall also be provided for those who prefer not to ride alone through the mountain roads.",
  },
  {
    q: 'What of dietary needs?',
    a: "The royal kitchens shall accommodate all needs of your house. Please declare your requirements via the raven — the 'Send a Raven' scroll — and the cooks shall prepare accordingly.",
  },
  {
    q: 'When must I dispatch my raven?',
    a: "The High Council requires your response by February 7, 2027. Please transmit your attendance via the 'Send a Raven' section of this proclamation.",
  },
  {
    q: 'Shall there be music and dancing?',
    a: "Of course — what feast of kings is complete without song? The court bards shall play through the banquet, and a master of revels shall lead the dancing until the torches burn low and the stars reclaim the sky.",
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
    <>
      <div ref={containerRef} className="sw-container" style={{ paddingBottom: '6rem' }}>
        <div className="page-header">
          <h1 className="page-heading">Maester's Scroll</h1>
          <p className="page-subheading">Wisdom Dispatched from the Citadel</p>
        </div>

        <div className="faq-list">
          {faqs.map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} delay={i * .05} />
          ))}
        </div>
      </div>
      <TyrionChat />
    </>
  )
}
