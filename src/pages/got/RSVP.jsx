import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { supabase } from '../../lib/supabase'
import TyrionChat from '../../components/got/TyrionChat'

gsap.registerPlugin(ScrollTrigger)

const meals = ['Roasted Boar', 'Lemon Cakes', 'Braised Lamb', 'Hearth-Smoked Fish']

async function sendConfirmationEmail(name, email, attending) {
  try {
    await fetch('/api/send-rsvp-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, attending }),
    })
  } catch (_) {
    // email failure is non-blocking
  }
}

export default function RSVP() {
  const [submitted, setSubmitted] = useState(false)
  const [attending, setAttending] = useState(null)
  const [checked, setChecked] = useState([])
  const [form, setForm] = useState({ name: '', email: '', guests: '1', song: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const containerRef = useRef(null)

  const toggle = (item) =>
    setChecked(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])

  const change = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!attending) return
    setSubmitting(true)

    const nameParts = form.name.trim().split(/\s+/)
    const first_name = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts[0]
    const last_name = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''

    const { error } = await supabase.from('rsvps').insert([{
      first_name,
      last_name,
      email: form.email,
      attendance: attending,
      guests: parseInt(form.guests, 10),
      meal: checked.join(', ') || null,
      dietary: null,
      song: form.song || null,
      message: form.message || null,
    }])

    if (error) {
      console.error('RSVP insert error:', error)
    } else if (form.email) {
      await sendConfirmationEmail(form.name, form.email, attending)
    }

    setSubmitting(false)
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
          <span className="rsvp-success-icon">🐉</span>
          <h2>Your Raven Has Arrived</h2>
          <p>
            {attending === 'yes'
              ? `Your attendance has been received, ${form.name}. A seat at the high table awaits you on February 7, 2027. The realm is honoured by your presence.`
              : `We understand, ${form.name}. Though you cannot make the journey, you shall be remembered in the great halls. Valar Morghulis.`}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
    <div ref={containerRef} className="sw-container" style={{ paddingBottom: '6rem' }}>
      <div className="page-header">
        <h1 className="page-heading">Send a Raven</h1>
        <p className="page-subheading">Dispatch Your Response to the High Council</p>
      </div>

      <form className="rsvp-form" onSubmit={submit}>

        <div className="form-group" style={{ animationDelay: '.1s' }}>
          <label className="form-label">Your Name(s)</label>
          <input
            className="form-input" type="text" name="name" required
            placeholder="Ser Jaime & Lady Brienne"
            value={form.name} onChange={change}
          />
        </div>

        <div className="form-group" style={{ animationDelay: '.15s' }}>
          <label className="form-label">Raven Address (Email)</label>
          <input
            className="form-input" type="email" name="email" required
            placeholder="lord@casterly.rock"
            value={form.email} onChange={change}
          />
        </div>

        <div className="form-group" style={{ animationDelay: '.2s' }}>
          <label className="form-label">Will you ride for the feast?</label>
          <div className="attend-group">
            <button type="button" className={`attend-btn ${attending === 'yes' ? 'selected' : ''}`} onClick={() => setAttending('yes')}>
              ✓ &nbsp; I Shall Attend
            </button>
            <button type="button" className={`attend-btn ${attending === 'no' ? 'selected' : ''}`} onClick={() => setAttending('no')}>
              ✕ &nbsp; I Cannot Make the Journey
            </button>
          </div>
        </div>

        {attending === 'yes' && (
          <>
            <div className="form-group" style={{ animationDelay: '.25s' }}>
              <label className="form-label">Members of Your Party</label>
              <select className="form-input" name="guests" value={form.guests} onChange={change}>
                {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ animationDelay: '.3s' }}>
              <label className="form-label">Choose Your Feast</label>
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
              <label className="form-label">Song Request for the Bards <span style={{ opacity: .4 }}>(optional)</span></label>
              <input
                className="form-input" type="text" name="song"
                placeholder="The Rains of Castamere, perhaps?"
                value={form.song} onChange={change}
              />
            </div>
          </>
        )}

        <div className="form-group" style={{ animationDelay: '.4s' }}>
          <label className="form-label">Words for the Couple <span style={{ opacity: .4 }}>(optional)</span></label>
          <textarea
            className="form-input" name="message" rows={4}
            placeholder="May your love be as enduring as Valyrian steel..."
            value={form.message} onChange={change}
            style={{ resize: 'vertical' }}
          />
        </div>

        <button type="submit" className="rsvp-submit" disabled={!attending || submitting}>
          {submitting ? 'Sending…' : 'Dispatch the Raven'}
        </button>
      </form>
    </div>
    <TyrionChat />
    </>
  )
}
