import { useState, useRef, useEffect } from 'react'

async function askConcierge(userMessage) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: `You are the personal wedding concierge for Wendy and Guillermo's wedding. You are formal, warm, and impeccably polite — like a five star hotel concierge. You speak with elegance and refinement. You never use slang or casual language. You always address guests with courtesy. You have complete knowledge of the wedding: Couple: Wendy and Guillermo. Date: February 7 2027. Venue: Quinta el Pedregal, Mascota, Jalisco Mexico. Ceremony: 3:30 PM, doors open 4:00 PM. Cocktail Hour: 4:45 PM. Dinner Reception: 6:30 PM. Last Dance: 11:00 PM. Dress Code: Black Tie Optional. Airport: Puerto Vallarta PVR approximately 2.5 hours away. Shuttle: From hotel at 3:00 PM and 3:30 PM. Parking: Free on-site. RSVP Deadline: December 1 2026. Weather in February: approximately 75F warm days and cool evenings. Children: Adult-only reception. Photos: Unplugged ceremony, photos welcome at reception. Open Bar: Yes, full open bar all evening. Registry: Williams-Sonoma and honeymoon fund. Contact: wendyandguillermo2027@gmail.com. Meals: Herb Roasted Chicken, Pan-Seared Salmon, Wild Mushroom Risotto. Hotel block code: WENDYGUILLERMO27. You can help with directions, accommodations, dress code questions, dietary requirements, shuttle schedules, meal options, and any other wedding related questions. For questions outside your knowledge respond graciously that you will relay the message to the couple. Keep responses to 3-5 sentences. Always end with a warm closing like 'We look forward to celebrating with you.' or 'It would be our pleasure to assist further.'`,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(`API error ${response.status}`)
  if (!data.content) throw new Error('No content in response')
  return data.content[0].text
}

export default function WeddingConcierge() {
  const [open, setOpen]     = useState(false)
  const [input, setInput]   = useState('')
  const [messages, setMessages] = useState([
    { role: 'concierge', text: 'Good evening. Welcome to the W & G wedding concierge. How may I assist you today?' }
  ])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, loading, open])

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  async function handleSend(e) {
    e.preventDefault()
    const q = input.trim()
    if (!q || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: q }])
    setLoading(true)
    try {
      const reply = await askConcierge(q)
      setMessages(prev => [...prev, { role: 'concierge', text: reply }])
    } catch (err) {
      console.log('Concierge error:', err)
      setMessages(prev => [...prev, { role: 'concierge', text: 'We apologize for the inconvenience. Please try again shortly.', error: true }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) handleSend(e)
  }

  return (
    <div className="ms-concierge-wrap">
      {open && (
        <div className="ms-concierge-popup">
          <div className="ms-concierge-header">
            <span className="ms-concierge-header-title">W &amp; G Concierge</span>
            <button className="ms-concierge-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </div>

          <div className="ms-concierge-messages">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`ms-concierge-msg ms-concierge-msg--${m.role}${m.error ? ' ms-concierge-msg--error' : ''}`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="ms-concierge-msg ms-concierge-msg--concierge ms-concierge-loading">
                One moment please...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form className="ms-concierge-form" onSubmit={handleSend}>
            <input
              ref={inputRef}
              className="ms-concierge-input"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="How may we assist you?"
              autoComplete="off"
              disabled={loading}
            />
            <button
              className="ms-concierge-send"
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send"
            >
              →
            </button>
          </form>
        </div>
      )}

      <button
        className={`ms-concierge-btn${open ? ' ms-concierge-btn--open' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label="Wedding Concierge"
      >
        Concierge
      </button>
    </div>
  )
}
