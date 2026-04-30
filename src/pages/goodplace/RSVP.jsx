import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { supabase } from '../../lib/supabase'
import JanetBubble from '../../components/goodplace/JanetBubble'
import CloudLayer from '../../components/goodplace/CloudLayer'
import GoodPlaceChaos from '../../components/goodplace/GoodPlaceChaos'

gsap.registerPlugin(ScrollTrigger)

const SUCCESS_MSGS = [
  'Your spot has been secured. Everything is fine. 😇',
  'Welcome to The Good Place! Janet will be in touch.',
  'Excellent choice. The points have been tallied in your favor.',
  'As Michael would say: This is going to be so much fun. For real this time.',
]

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
  const [form, setForm] = useState({
    name: '', email: '', attendance: '', meal: '', song: '', message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [successMsg] = useState(
    () => SUCCESS_MSGS[Math.floor(Math.random() * SUCCESS_MSGS.length)],
  )
  const containerRef = useRef(null)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.attendance) return
    setSubmitting(true)

    const nameParts = form.name.trim().split(/\s+/)
    const first_name = nameParts[0] || form.name
    const last_name = nameParts.slice(1).join(' ') || null

    const { error } = await supabase.from('rsvps').insert([{
      first_name,
      last_name,
      email: form.email || null,
      attendance: form.attendance,
      guests: 1,
      meal: form.meal || null,
      dietary: null,
      song: form.song || null,
      message: form.message || null,
    }])

    if (error) {
      console.error('RSVP insert error:', error)
    } else if (form.email) {
      await sendConfirmationEmail(form.name, form.email, form.attendance)
    }

    setSubmitting(false)
    setSubmitted(true)
  }

  useEffect(() => {
    if (!containerRef.current) return
    const ctx = gsap.context(() => {
      const heading = containerRef.current.querySelector('.gp-page-heading')
      if (heading) {
        gsap.fromTo(heading,
          { opacity: 0, x: -40 },
          { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' }
        )
      }

      gsap.utils.toArray('.gp-rsvp-form > div').forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, y: 50 },
          {
            opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: i * 0.1,
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        )
      })

      const submitBtn = containerRef.current.querySelector('.gp-btn--primary[type="submit"]')
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
      <div className="gp-container">
        <CloudLayer />
        <GoodPlaceChaos />
        <div className="gp-rsvp-success">
          <div className="gp-rsvp-success-icon">😇</div>
          <h2 className="gp-rsvp-success-title">Spot Secured</h2>
          <p className="gp-rsvp-success-msg">{successMsg}</p>
        </div>
        <JanetBubble />
      </div>
    )
  }

  return (
    <div ref={containerRef} className="gp-container">
      <CloudLayer />
      <GoodPlaceChaos />
      <div className="gp-page-header">
        <p className="gp-page-label">Secure Your Place in The Good Place</p>
        <h1 className="gp-page-heading">Your Spot</h1>
        <p className="gp-page-sub">The committee is awaiting your confirmation</p>
      </div>

      <form className="gp-rsvp-form" onSubmit={handleSubmit}>
        <div>
          <label className="gp-field-label">Your Name</label>
          <input
            className="gp-input"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name as it appears in the Book of Dougs"
            required
          />
        </div>

        <div>
          <label className="gp-field-label">Email Address</label>
          <input
            className="gp-input"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="your@goodplace.com"
          />
        </div>

        <div>
          <label className="gp-field-label">Will You Attend?</label>
          <div className="gp-radio-group">
            {[
              { value: 'yes', label: '✓ I will be there — everything is fine!' },
              { value: 'no',  label: '✗ I cannot attend — not fine, but I understand' },
            ].map(opt => (
              <label key={opt.value} className="gp-radio-label">
                <input
                  type="radio"
                  name="attendance"
                  value={opt.value}
                  checked={form.attendance === opt.value}
                  onChange={handleChange}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {form.attendance === 'yes' && (
          <>
            <div>
              <label className="gp-field-label">Meal Preference</label>
              <select
                className="gp-select"
                name="meal"
                value={form.meal}
                onChange={handleChange}
              >
                <option value="">— Select your preference —</option>
                <option>Frozen Yogurt (Janet's Special)</option>
                <option>The Cheesecake (Eleanor's Choice)</option>
                <option>Garden Harvest (Chidi Would Approve)</option>
                <option>Surf &amp; Turf (Tahani's Recommendation)</option>
              </select>
            </div>

            <div>
              <label className="gp-field-label">Song Request</label>
              <input
                className="gp-input"
                name="song"
                value={form.song}
                onChange={handleChange}
                placeholder="What song makes you feel like you are in The Good Place?"
              />
            </div>
          </>
        )}

        <div>
          <label className="gp-field-label">Message for the Couple</label>
          <textarea
            className="gp-textarea"
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Words of wisdom, blessings, or a brief ethical framework..."
          />
        </div>

        <button className="gp-btn gp-btn--primary" type="submit" disabled={submitting}>
          {submitting ? 'Securing your spot…' : 'Secure My Spot'}
        </button>
      </form>

      <JanetBubble />
    </div>
  )
}
