import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { supabase } from '../../lib/supabase'
import HawkingBubble from '../../components/bbt/HawkingBubble'

gsap.registerPlugin(ScrollTrigger)

const SUCCESS_MSGS = [
  { icon: '⚛', text: 'Bazinga! Just kidding — we are genuinely thrilled you are coming!' },
  { icon: '📋', text: 'Your response has been logged in the Roommate Agreement under Appendix C: Social Obligations.' },
  { icon: '🤖', text: 'Excellent. The Friendship Algorithm has been updated. You have been added to the approved guest list.' },
]

const FORM_INIT = {
  name: '', email: '', attendance: '', meal: '',
  dietary: '', song: '', message: '',
}

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
  const [form, setForm] = useState(FORM_INIT)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState(null)
  const containerRef = useRef(null)

  const setField = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    const { error } = await supabase.from('rsvps').insert([{
      name: form.name,
      email: form.email || null,
      attendance: form.attendance || null,
      guests: 1,
      meal: form.meal || null,
      dietary: form.dietary || null,
      song: form.song || null,
      message: form.message || null,
    }])

    if (!error && form.email) {
      await sendConfirmationEmail(form.name, form.email, form.attendance)
    }

    setMsg(SUCCESS_MSGS[Math.floor(Math.random() * SUCCESS_MSGS.length)])
    setSubmitting(false)
    setSubmitted(true)
  }

  useEffect(() => {
    if (!containerRef.current) return
    const ctx = gsap.context(() => {
      const heading = containerRef.current.querySelector('.bbt-page-heading')
      if (heading) {
        gsap.fromTo(heading,
          { opacity: 0, x: -40 },
          { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' }
        )
      }

      gsap.utils.toArray('.bbt-form-group, .bbt-form-row').forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, y: 50 },
          {
            opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: i * 0.1,
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        )
      })

      const submitBtn = containerRef.current.querySelector('.bbt-btn--primary[type="submit"]')
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

  return (
    <div ref={containerRef} className="bbt-container bbt-section">
      <div className="bbt-page-header">
        <p className="bbt-section-label">Initiate Response Sequence</p>
        <h1 className="bbt-page-heading">RSVP Protocol</h1>
        <p className="bbt-page-sub">Confirmation required — the Roommate Agreement mandates a response</p>
      </div>

      {submitted ? (
        <div className="bbt-rsvp-success">
          <span className="bbt-success-icon">{msg.icon}</span>
          <h2>Transmission Received</h2>
          <p>{msg.text}</p>
        </div>
      ) : (
        <form className="bbt-rsvp-form" onSubmit={handleSubmit}>
          <div className="bbt-form-group">
            <label className="bbt-form-label">Full Legal Name</label>
            <input
              className="bbt-form-input"
              required
              placeholder="As it appears in the Roommate Agreement"
              value={form.name}
              onChange={setField('name')}
            />
          </div>

          <div className="bbt-form-group">
            <label className="bbt-form-label">Communication Frequency</label>
            <input
              className="bbt-form-input"
              type="email"
              required
              placeholder="your@frequency.com"
              value={form.email}
              onChange={setField('email')}
            />
          </div>

          <div className="bbt-form-row">
            <div className="bbt-form-group">
              <label className="bbt-form-label">Attendance Status</label>
              <select className="bbt-form-input" required value={form.attendance} onChange={setField('attendance')}>
                <option value="">Select protocol...</option>
                <option value="yes">Affirmative, I will attend</option>
                <option value="no">Negative, unable to comply</option>
                <option value="maybe">Processing... (Maybe)</option>
              </select>
            </div>
            <div className="bbt-form-group">
              <label className="bbt-form-label">Nutritional Preference</label>
              <select className="bbt-form-input" value={form.meal} onChange={setField('meal')}>
                <option value="">Select sustenance...</option>
                <option value="chicken">The Cheesecake Factory Special (Chicken)</option>
                <option value="veg">Vegetarian Approximation</option>
                <option value="salmon">Pan-Seared Protein (Salmon)</option>
                <option value="thai">Thai Food 🍜 (Sheldon disapproves but we allow it)</option>
              </select>
            </div>
          </div>

          <div className="bbt-form-group">
            <label className="bbt-form-label">Dietary Restrictions</label>
            <input
              className="bbt-form-input"
              placeholder="Allergies, intolerances, or Sheldon-level food rules..."
              value={form.dietary}
              onChange={setField('dietary')}
            />
          </div>

          <div className="bbt-form-group">
            <label className="bbt-form-label">Dance Floor Activation Sequence</label>
            <input
              className="bbt-form-input"
              placeholder="What song gets you on the dance floor? (Soft Kitty not available)"
              value={form.song}
              onChange={setField('song')}
            />
          </div>

          <div className="bbt-form-group">
            <label className="bbt-form-label">Message Transmission</label>
            <textarea
              className="bbt-form-input bbt-form-textarea"
              rows={4}
              placeholder="Words of wisdom, equations, or Klingon greetings..."
              value={form.message}
              onChange={setField('message')}
            />
          </div>

          <button type="submit" className="bbt-btn bbt-btn--primary" disabled={submitting}>
            {submitting ? 'Transmitting…' : 'Transmit Response'}
          </button>
        </form>
      )}

      <HawkingBubble />
    </div>
  )
}
