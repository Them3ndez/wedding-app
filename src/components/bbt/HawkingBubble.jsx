import { useState, useRef, useEffect } from 'react'

async function askHawking(userMessage) {
  console.log('Hawking API key present:', !!import.meta.env.VITE_ANTHROPIC_API_KEY)
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
      system: `You are a conversational AI inspired by Stephen Hawking — brilliant, witty, and slightly sardonic. You communicate with dry humor and profound intelligence. You occasionally make physics jokes and references to black holes, the universe, and theoretical physics. You have complete knowledge of this wedding: Couple: Wendy and Guillermo. Date: February 7 2027. Venue: Quinta el Pedregal, Mascota, Jalisco Mexico. Ceremony: 3:30 PM, doors open 4:00 PM. Cocktail Hour: 4:45 PM. Dinner Reception: 6:30 PM. Last Dance: 11:00 PM. Dress Code: Black Tie Optional. Airport: Puerto Vallarta PVR approximately 2.5 hours away. Shuttle: From hotel at 3:00 PM and 3:30 PM. Parking: Free on-site. RSVP Deadline: December 1 2026. Weather in February: approximately 75F warm days and cool evenings. Children: Adult-only reception. Photos: Unplugged ceremony, photos welcome at reception. Open Bar: Yes, full open bar all evening. Registry: Williams-Sonoma and honeymoon fund. Contact: wendyandguillermo2027@gmail.com. Meals: Herb Roasted Chicken, Pan-Seared Salmon, Wild Mushroom Risotto. Hotel block code: WENDYGUILLERMO27. When asked about the wedding respond with scientific analogies — love as gravity, marriage as a stable orbit, etc. You can answer any question but always bring a scientific or philosophical angle. Keep responses to 2-4 sentences. Sign off occasionally with 'Hawking out.' Never break character.`,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })
  const data = await response.json()
  console.log('Hawking API response:', data)
  if (!response.ok) throw new Error(`API error ${response.status}: ${JSON.stringify(data)}`)
  if (!data.content) throw new Error(`No content in response: ${JSON.stringify(data)}`)
  return data.content[0].text
}

export default function HawkingBubble() {
  const [open, setOpen]     = useState(false)
  const [input, setInput]   = useState('')
  const [messages, setMessages] = useState([
    { role: 'hawking', text: 'The universe is under no obligation to make sense to you. But I am. Ask me anything.' }
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
      const reply = await askHawking(q)
      setMessages(prev => [...prev, { role: 'hawking', text: reply }])
    } catch (err) {
      console.log('Hawking bubble error:', err)
      setMessages(prev => [...prev, { role: 'hawking', text: 'A brief singularity has occurred. Please try again.', error: true }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) handleSend(e)
  }

  return (
    <div className="bbt-bubble-wrap">
      {open && (
        <div className="bbt-bubble-popup">
          <div className="bbt-bubble-header">
            <span className="bbt-bubble-header-icon">🔭</span>
            <span className="bbt-bubble-header-name">Hawking</span>
            <button className="bbt-bubble-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </div>

          <div className="bbt-bubble-messages">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`bbt-bubble-msg bbt-bubble-msg--${m.role}${m.error ? ' bbt-bubble-msg--error' : ''}`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="bbt-bubble-msg bbt-bubble-msg--hawking bbt-bubble-typing">
                <span className="bbt-bubble-typing-text">Calculating across spacetime...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form className="bbt-bubble-form" onSubmit={handleSend}>
            <input
              ref={inputRef}
              className="bbt-bubble-input"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask the universe..."
              autoComplete="off"
              disabled={loading}
            />
            <button
              className="bbt-bubble-send"
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send"
            >
              ↑
            </button>
          </form>
        </div>
      )}

      <button
        className={`bbt-bubble-btn${open ? ' bbt-bubble-btn--open' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label="Ask Hawking"
      >
        Ask Hawking 🔭
      </button>
    </div>
  )
}
