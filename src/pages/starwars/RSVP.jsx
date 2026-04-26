import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import R2D2Chat from '../../components/starwars/R2D2Chat'

gsap.registerPlugin(ScrollTrigger)

const meals = ['Nerf Bird', 'Mon Calamari Fillet', 'Endor Harvest Risotto', 'Blue Milk']

export default function RSVP() {
  const [submitted, setSubmitted] = useState(false)
  const [attending, setAttending] = useState(null)
  const [checked, setChecked] = useState([])
  const [form, setForm] = useState({ name: '', email: '', guests: '1', song: '', message: '' })
  const containerRef = useRef(null)

  const toggle = (item) =>
    setChecked(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])

  const change = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  useEffect(() => {
    if (!containerRef.current) return
    const ctx = gsap.context(() => {
      const heading = containerRef.current.querySelector('.page-heading')
      if (heading) {
        gsap.fromTo(heading,
          { opacity: 0, x: -40 },
          { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' }
        )
      }

      gsap.utils.toArray('.form-group').forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, y: 50 },
          {
            opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: i * 0.1,
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        )
      })

      const submitBtn = containerRef.current.querySelector('.rsvp-submit')
      if (submitBtn) {
        gsap.fromTo(submitBtn,
          { opacity: 0, y: 50 },
          {
            opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
            scrollTrigger: { trigger: submitBtn, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        )
      }
    }, containerRef)

    return () => { ctx.revert(); ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [submitted])

  if (submitted) {
    return (
      <div className="sw-container" style={{ paddingBottom: '6rem' }}>
        <div className="rsvp-success">
          <span className="rsvp-success-icon">✦</span>
          <h2>Transmission Received</h2>
          <p>
            {attending === 'yes'
              ? `Your attendance has been logged, ${form.name}. The Jedi Council is honoured by your presence. Prepare for hyperspace on February 7, 2027.`
              : `We understand, ${form.name}. Though you cannot join us in person, may the Force be with you always.`}
          </p>
        </div>
      <R2D2Chat />
      </div>
    )
  }

  return (
    <div ref={containerRef} className="sw-container" style={{ paddingBottom: '6rem' }}>
      <div className="page-header">
        <h1 className="page-heading">Confirm Attendance</h1>
        <p className="page-subheading">Transmit Your Response to the Rebel Base</p>
      </div>

      <form className="rsvp-form" onSubmit={submit}>

        <div className="form-group" style={{ animationDelay: '.1s' }}>
          <label className="form-label">Full Name(s)</label>
          <input
            className="form-input"
            type="text"
            name="name"
            required
            placeholder="Han & Leia Solo"
            value={form.name}
            onChange={change}
          />
        </div>

        <div className="form-group" style={{ animationDelay: '.15s' }}>
          <label className="form-label">Email</label>
          <input
            className="form-input"
            type="email"
            name="email"
            required
            placeholder="rebel@alliance.org"
            value={form.email}
            onChange={change}
          />
        </div>

        <div className="form-group" style={{ animationDelay: '.2s' }}>
          <label className="form-label">Will you be joining us?</label>
          <div className="attend-group">
            <button type="button" className={`attend-btn ${attending === 'yes' ? 'selected' : ''}`} onClick={() => setAttending('yes')}>
              ✓ &nbsp; I'll Be There
            </button>
            <button type="button" className={`attend-btn ${attending === 'no' ? 'selected' : ''}`} onClick={() => setAttending('no')}>
              ✕ &nbsp; Unable to Attend
            </button>
          </div>
        </div>

        {attending === 'yes' && (
          <>
            <div className="form-group" style={{ animationDelay: '.25s' }}>
              <label className="form-label">Number of Guests</label>
              <select className="form-input" name="guests" value={form.guests} onChange={change}>
                {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ animationDelay: '.3s' }}>
              <label className="form-label">Meal Selection</label>
              <div className="checkbox-group">
                {meals.map(item => (
                  <label
                    key={item}
                    className={`checkbox-label ${checked.includes(item) ? 'checked' : ''}`}
                    onClick={() => toggle(item)}
                  >
                    <input type="checkbox" readOnly checked={checked.includes(item)} />
                    {item}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ animationDelay: '.35s' }}>
              <label className="form-label">Song Request <span style={{ opacity: .4 }}>(optional)</span></label>
              <input
                className="form-input"
                type="text"
                name="song"
                placeholder="Cantina Band, perhaps?"
                value={form.song}
                onChange={change}
              />
            </div>
          </>
        )}

        <div className="form-group" style={{ animationDelay: '.4s' }}>
          <label className="form-label">Message to the Couple <span style={{ opacity: .4 }}>(optional)</span></label>
          <textarea
            className="form-input"
            name="message"
            rows={4}
            placeholder="May the Force be with you both..."
            value={form.message}
            onChange={change}
            style={{ resize: 'vertical' }}
          />
        </div>

        <button type="submit" className="rsvp-submit" disabled={!attending}>
          Send Transmission
        </button>
      </form>
      <R2D2Chat />
    </div>
  )
}
