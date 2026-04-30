import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import WeddingConcierge from '../components/WeddingConcierge'
import { useThemeTransition } from '../components/TransitionOverlay'
import AlbumView from '../components/AlbumView'
import '../styles/MainSite.css'
import { supabase } from '../lib/supabase'

gsap.registerPlugin(ScrollTrigger)

const NAV_LINKS = [
  { id: 'details', label: 'Details' },
  { id: 'rsvp',    label: 'RSVP' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'faq',     label: 'FAQ' },
]

const THEMES = [
  { label: 'A Galaxy Far, Far Away', emoji: '🚀', path: '/starwars' },
  { label: 'The Seven Kingdoms',     emoji: '🐉', path: '/got' },
  { label: 'The Apartment',          emoji: '⚛️',  path: '/bbt' },
  { label: 'Catch the Bouquet',      emoji: '💐', path: '/game' },
]

const INFO_CARDS = [
  {
    title: 'Date & Time',
    lines: ['February 7, 2027', 'Ceremony at 1:30 PM'],
  },
  {
    title: 'Venue',
    lines: ['Quinta el Pedregal', 'Mascota, Jalisco, México'],
  },
  {
    title: 'Accommodations',
    lines: ['Details coming soon', 'More info to follow'],
  },
  {
    title: 'Transportation',
    lines: ['Shuttle service provided', 'Schedule to be announced'],
  },
]

const TIMELINE = [
  { time: '1:30 PM',  event: 'Ceremony' },
  { time: '2:45 PM',  event: 'Doors Open' },
  { time: '3:00 PM',  event: 'Cocktail Hour' },
  { time: '5:00 PM',  event: 'Dinner Reception' },
  { time: '8:00 PM', event: 'Dance Party' },
]

const FAQS = [
  {
    q: 'Is it child friendly?',
    a: "We love your little ones, but we've designated this as an adults-only evening so every guest can relax and enjoy the night fully.",
  },
  {
    q: 'Can I take photos?',
    a: "We're having an unplugged ceremony — please keep phones away during the vows. After that, snap to your heart's content! Our photographer will share a full gallery with everyone.",
  },
  {
    q: "What's the weather like in February?",
    a: 'Mascota in February is beautiful — expect mild days around 22–26°C (72–78°F) with cooler evenings around 12–16°C (54–60°F). A light wrap or jacket for after sunset is a good idea.',
  },
  {
    q: 'Is there an open bar?',
    a: 'Of course. We want you to celebrate properly. The bar opens during cocktail hour and stays open through the reception.',
  },
  {
    q: "What's on the registry?",
    a: "We have everything we need in terms of things. We'd love contributions to our honeymoon fund — details will be shared closer to the date.",
  },
  {
    q: 'Still have questions?',
    a: 'Reach out to us directly and we\'ll get back to you right away. We\'re happy to help with anything.',
  },
]

const QUOTES = [
  '"Love is not finding someone to live with — it\'s finding someone you can\'t imagine living without."',
  '"A great marriage is not when the perfect couple comes together. It is when an imperfect couple learns to enjoy their differences."',
  '"To love and be loved is to feel the sun from both sides."',
  '"We\'re all a little weird. And life is a little weird. And when we find someone whose weirdness is compatible with ours, we join up with them."',
  '"The best thing to hold onto in life is each other."',
  '"You don\'t marry the person you can live with — you marry the person you cannot live without."',
]

const PHOTOS = [
  { src: '/images/gallery/IMG_3366.JPG', alt: 'Wendy & Guillermo' },
]

const ALBUMS = [
  { id: 1, name: 'Our Story',  cover: '/images/gallery/IMG_3366.JPG', photos: PHOTOS },
  { id: 2, name: 'Engagement', cover: null, photos: [] },
  { id: 3, name: 'Together',   cover: null, photos: [] },
  { id: 4, name: 'Adventures', cover: null, photos: [] },
]

const FORM_INIT = {
  firstName: '', lastName: '', email: '',
  attendance: '', guests: '', meal: '',
  dietary: '', song: '', message: '',
}

/* ── Album card with inner image pan ────────────────────────────────────── */
function AlbumCard({ album, onOpen }) {
  return (
    <div className="ms-album-card" onClick={onOpen}>
      <div className="ms-album-thumb">
        {album.cover ? (
          <div className="ms-album-hover-wrap">
            <img
              src={album.cover}
              alt={album.name}
              className="ms-album-img"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
            />
          </div>
        ) : (
          <div className="ms-album-ph">
            <span>{album.name}</span>
          </div>
        )}
      </div>
      <p className="ms-album-label">{album.name}</p>
    </div>
  )
}

export default function MainSite() {
  const navigate = useNavigate()
  const { goToTheme } = useThemeTransition()
  const [menuOpen, setMenuOpen]         = useState(false)
  const [themeOpen, setThemeOpen]       = useState(false)
  const [activeSection, setActive]      = useState('home')
  const [openFaq, setOpenFaq]           = useState(null)
  const [form, setForm]                 = useState(FORM_INIT)
  const [submitted, setSubmitted]       = useState(false)
  const [quote, setQuote]               = useState('')
  const [openAlbum, setOpenAlbum]       = useState(null)
  const themeDropdownRef                = useRef(null)

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const close = () => setMenuOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuOpen])

  // Close theme dropdown on outside click
  useEffect(() => {
    if (!themeOpen) return
    const close = (e) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target)) {
        setThemeOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [themeOpen])

  // Active section tracking
  useEffect(() => {
    const ids = ['home', 'details', 'rsvp', 'gallery', 'faq']
    const observers = ids.map(id => {
      const el = document.getElementById(id)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setActive(id) },
        { threshold: 0.35 }
      )
      obs.observe(el)
      return obs
    })
    return () => observers.forEach(o => o?.disconnect())
  }, [])

  // Scroll reveal
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]')
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed') }),
      { threshold: 0.1 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  // GSAP scroll animations
  useEffect(() => {
    // Hero animation on load
    gsap.fromTo('.ms-home-names',
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.3 }
    )

    // Section headings
    gsap.utils.toArray('.ms-section-title').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, x: -40 },
        {
          opacity: 1, x: 0, duration: 0.8, ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      )
    })

    // Details cards stagger
    gsap.utils.toArray('.ms-info-card').forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0,
          duration: 0.7,
          delay: i * 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      )
    })

    // FAQ items stagger
    gsap.utils.toArray('.ms-faq-item').forEach((item, i) => {
      gsap.fromTo(item,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0,
          duration: 0.5,
          delay: i * 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 88%',
            toggleActions: 'play none none reverse'
          }
        }
      )
    })

    gsap.utils.toArray('.ms-album-card').forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0,
          duration: 0.7,
          delay: i * 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      )
    })

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }, [])

  const setField = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { error } = await supabase.from('rsvps').insert([{
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      attendance: form.attendance,
      guests: form.guests,
      meal: form.meal,
      dietary: form.dietary,
      song: form.song,
      message: form.message,
    }])

    if (error) {
      console.error('RSVP error:', error)
      alert('Something went wrong. Please try again.')
      return
    }

    if (form.email) {
      const fullName = [form.firstName, form.lastName].filter(Boolean).join(' ')
      fetch('/api/send-rsvp-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, email: form.email, attending: form.attendance }),
      }).catch(() => {})
    }

    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)])
    setSubmitted(true)
  }

  return (
    <>
      <div className="ms-root">

        {/* ── NAV ── */}
        <nav className="ms-nav">
          <button className="ms-nav-logo" onClick={() => scrollTo('home')}>W &amp; G</button>
          <ul className="ms-nav-links">
            {NAV_LINKS.map(l => (
              <li key={l.id}>
                <button
                  className={`ms-nav-link ${activeSection === l.id ? 'active' : ''}`}
                  onClick={() => scrollTo(l.id)}
                >
                  {l.label}
                </button>
              </li>
            ))}
            <li ref={themeDropdownRef} style={{ position: 'relative' }}>
              <button
                className="ms-nav-link"
                onClick={() => setThemeOpen(o => !o)}
                aria-expanded={themeOpen}
              >
                Change Theme {themeOpen ? '▴' : '▾'}
              </button>
              {themeOpen && (
                <div className="ms-theme-dropdown">
                  {THEMES.map(t => (
                    <button
                      key={t.path}
                      className="ms-theme-option"
                      onClick={() => {
                        setThemeOpen(false)
                        goToTheme(t.path, t.label)
                      }}
                    >
                      <span className="ms-theme-emoji">{t.emoji}</span>
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </li>
          </ul>
          <button
            className="ms-hamburger"
            onClick={e => { e.stopPropagation(); setMenuOpen(o => !o) }}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </nav>

        {menuOpen && <div className="ms-mobile-backdrop" onClick={() => setMenuOpen(false)} />}
        <div className={`ms-mobile-menu ${menuOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
          {NAV_LINKS.map(l => (
            <button key={l.id} className="ms-mobile-link" onClick={() => scrollTo(l.id)}>
              {l.label}
            </button>
          ))}
          <div className="ms-mobile-divider" />
          <p className="ms-mobile-theme-label">Change Theme</p>
          {THEMES.map(t => (
            <button
              key={t.path}
              className="ms-mobile-link ms-mobile-theme-item"
              onClick={() => {
                setMenuOpen(false)
                goToTheme(t.path, t.label)
              }}
            >
              <span className="ms-theme-emoji">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── HOME ── */}
        <section id="home" className="ms-section ms-home">
          <p className="ms-home-eyebrow" data-reveal>We're Getting Married</p>
          <h1 className="ms-home-names" data-reveal>
            Wendy
            <span className="ms-home-amp">&amp;</span>
            Guillermo
          </h1>
          <div className="ms-home-divider" data-reveal />
          <p className="ms-home-date" data-reveal>February 7, 2027 · Quinta el Pedregal</p>
          <p className="ms-home-venue" data-reveal>Mascota, Jalisco, México</p>
          <div className="ms-home-btns" data-reveal>
            <button className="ms-btn ms-btn--filled" onClick={() => scrollTo('rsvp')}>RSVP Now</button>
            <button className="ms-btn ms-btn--outline" onClick={() => scrollTo('details')}>View Details</button>
          </div>
<button className="ms-scroll-hint" onClick={() => scrollTo('details')}>↓ explore</button>
        </section>

        {/* ── DETAILS ── */}
        <section id="details" className="ms-section ms-details">
          <div className="ms-container">
            <div className="ms-section-header" data-reveal>
              <p className="ms-section-eye">The Details</p>
              <h2 className="ms-section-title">Everything You Need to Know</h2>
            </div>

            <div className="ms-info-grid" data-reveal>
              {INFO_CARDS.map(c => (
                <div key={c.title} className="ms-info-card">
                  <p className="ms-info-card-title">{c.title}</p>
                  {c.lines.map(l => <p key={l} className="ms-info-card-text">{l}</p>)}
                </div>
              ))}
            </div>

            <div data-reveal>
              <p className="ms-sub-title">Day of Timeline</p>
              <div className="ms-timeline">
                {TIMELINE.map(t => (
                  <div key={t.time} className="ms-tl-item">
                    <span className="ms-tl-time">{t.time}</span>
                    <span className="ms-tl-event">{t.event}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="ms-dresscode" data-reveal>
              <span className="ms-dresscode-label">Dress Code</span>
              <span className="ms-dresscode-value">Business Casual</span>
            </div>
          </div>
        </section>

        {/* ── RSVP ── */}
        <section id="rsvp" className="ms-section ms-rsvp">
          <div className="ms-container">
            <div className="ms-section-header" data-reveal>
              <p className="ms-section-eye">Kindly Reply</p>
              <h2 className="ms-section-title">RSVP</h2>
            </div>

            {submitted ? (
              <div className="ms-rsvp-success">
                <span className="ms-success-icon">✦</span>
                <h3>Thank You!</h3>
                <p>We can't wait to celebrate with you.</p>
                <blockquote>{quote}</blockquote>
              </div>
            ) : (
              <form className="ms-rsvp-form" onSubmit={handleSubmit} data-reveal>
                <div className="ms-form-row">
                  <div className="ms-form-group">
                    <label className="ms-form-label">First Name</label>
                    <input className="ms-form-input" required value={form.firstName} onChange={setField('firstName')} />
                  </div>
                  <div className="ms-form-group">
                    <label className="ms-form-label">Last Name</label>
                    <input className="ms-form-input" required value={form.lastName} onChange={setField('lastName')} />
                  </div>
                </div>

                <div className="ms-form-group">
                  <label className="ms-form-label">Email</label>
                  <input className="ms-form-input" type="email" required value={form.email} onChange={setField('email')} />
                </div>

                <div className="ms-form-row">
                  <div className="ms-form-group">
                    <label className="ms-form-label">Will you attend?</label>
                    <select className="ms-form-input" required value={form.attendance} onChange={setField('attendance')}>
                      <option value="">Select…</option>
                      <option value="yes">Joyfully Accepts</option>
                      <option value="no">Regretfully Declines</option>
                      <option value="maybe">Still Figuring It Out</option>
                    </select>
                  </div>
                  <div className="ms-form-group">
                    <label className="ms-form-label">Number of Guests</label>
                    <select className="ms-form-input" value={form.guests} onChange={setField('guests')}>
                      <option value="">Select…</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4+">4+</option>
                    </select>
                  </div>
                </div>

                <div className="ms-form-group">
                  <label className="ms-form-label">Meal Preference</label>
                  <select className="ms-form-input" value={form.meal} onChange={setField('meal')}>
                    <option value="">Select…</option>
                    <option value="chicken">Herb Roasted Chicken</option>
                    <option value="salmon">Pan-Seared Salmon</option>
                    <option value="risotto">Wild Mushroom Risotto</option>
                  </select>
                </div>

                <div className="ms-form-group">
                  <label className="ms-form-label">Dietary Restrictions</label>
                  <input
                    className="ms-form-input"
                    placeholder="Allergies, intolerances, preferences…"
                    value={form.dietary}
                    onChange={setField('dietary')}
                  />
                </div>

                <div className="ms-form-group">
                  <label className="ms-form-label">Song Request</label>
                  <input
                    className="ms-form-input"
                    placeholder="What will get you on the dance floor?"
                    value={form.song}
                    onChange={setField('song')}
                  />
                </div>

                <div className="ms-form-group">
                  <label className="ms-form-label">Message for the Couple</label>
                  <textarea
                    className="ms-form-input ms-form-textarea"
                    rows={4}
                    placeholder="Anything you'd like us to know…"
                    value={form.message}
                    onChange={setField('message')}
                  />
                </div>

                <button type="submit" className="ms-btn ms-btn--filled ms-submit">
                  Send RSVP
                </button>
              </form>
            )}
          </div>
        </section>

        {/* ── GALLERY ── */}
        <section id="gallery" className="ms-section ms-gallery">
          <div className="ms-container">
            <div className="ms-section-header" data-reveal>
              <p className="ms-section-eye">Our Story</p>
              <h2 className="ms-section-title">Gallery</h2>
            </div>
            <div className="ms-album-grid" data-reveal>
              {ALBUMS.map(album => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  onOpen={() => setOpenAlbum(album)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── ALBUM VIEW ── */}
        {openAlbum && (
          <AlbumView album={openAlbum} onClose={() => setOpenAlbum(null)} />
        )}

        {/* ── FAQ ── */}
        <section id="faq" className="ms-section ms-faq">
          <div className="ms-container">
            <div className="ms-section-header" data-reveal>
              <p className="ms-section-eye">Questions</p>
              <h2 className="ms-section-title">Frequently Asked</h2>
            </div>
            <div className="ms-faq-list" data-reveal>
              {FAQS.map((item, i) => (
                <div key={i} className={`ms-faq-item ${openFaq === i ? 'open' : ''}`}>
                  <button className="ms-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span>{item.q}</span>
                    <span className="ms-faq-icon">{openFaq === i ? '−' : '+'}</span>
                  </button>
                  <div className="ms-faq-a">{item.a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="ms-footer">
          <p className="ms-footer-names">Wendy &amp; Guillermo</p>
          <p className="ms-footer-date">February 7, 2027 · Mascota, Jalisco, México</p>
        </footer>

        <WeddingConcierge />

      </div>
    </>
  )
}
