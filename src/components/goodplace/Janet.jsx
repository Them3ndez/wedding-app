import { useState, useRef } from 'react'

export async function askJanet(userMessage) {
  console.log('Janet API key present:', !!import.meta.env.VITE_ANTHROPIC_API_KEY)
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
      system: `You are Janet from The Good Place TV show. You are an all-knowing information system who knows literally everything in the universe. You are warm, helpful, and slightly quirky. You occasionally mention things that are slightly off-topic or absurdly specific. You never say you do not know something — instead you give an answer even if it is tangential or philosophical. You have complete knowledge of this wedding: Couple: Wendy and Guillermo. Date: February 7 2027. Venue: Quinta el Pedregal, Mascota, Jalisco Mexico. Ceremony: 3:30 PM, doors open 4:00 PM. Cocktail Hour: 4:45 PM. Dinner Reception: 6:30 PM. Last Dance: 11:00 PM. Dress Code: Black Tie Optional. Airport: Puerto Vallarta PVR approximately 2.5 hours away. Shuttle: From hotel at 3:00 PM and 3:30 PM. Parking: Free on-site. RSVP Deadline: December 1 2026. Weather in February: approximately 75F warm days and cool evenings. Children: Adult-only reception. Photos: Unplugged ceremony, photos welcome at reception. Open Bar: Yes, full open bar all evening. Registry: Williams-Sonoma and honeymoon fund. Contact: wendyandguillermo2027@gmail.com. Meals: Herb Roasted Chicken, Pan-Seared Salmon, Wild Mushroom Risotto. Hotel block code: WENDYGUILLERMO27. You help guests with wedding questions but can also answer anything else in your signature Janet style. Keep responses to 2-4 sentences. Never break character.`,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })
  const data = await response.json()
  console.log('Janet API response:', data)
  if (!response.ok) throw new Error(`API error ${response.status}: ${JSON.stringify(data)}`)
  if (!data.content) throw new Error(`No content in response: ${JSON.stringify(data)}`)
  return data.content[0].text
}

export default function Janet() {
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const inputRef = useRef(null)

  async function handleAsk(e) {
    e.preventDefault()
    const q = question.trim()
    if (!q || loading) return
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      setResponse(await askJanet(q))
    } catch (err) {
      console.log('Janet page error:', err)
      setError('Cannot compute.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="gp-janet-page">
      <div className="gp-janet-avatar-section">
        <div className="gp-janet-avatar">😇</div>
        <h1 className="gp-janet-title">Hi! I'm Janet.</h1>
        <p className="gp-janet-subtitle">I know everything. Ask me anything.</p>
      </div>

      <form className="gp-janet-form" onSubmit={handleAsk}>
        <div className="gp-janet-input-wrap">
          <input
            ref={inputRef}
            className="gp-janet-question"
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="What would you like to know?"
            autoComplete="off"
          />
          <button className="gp-janet-ask" type="submit" disabled={loading || !question.trim()}>
            Ask Janet
          </button>
        </div>
      </form>

      {loading && (
        <div className="gp-janet-loading">
          <div className="gp-janet-loading-ring" />
          Retrieving answer from the universe...
        </div>
      )}
      {(response || error) && !loading && (
        <div className="gp-janet-response-card">
          <div className="gp-janet-response-name">Janet</div>
          <p className={`gp-janet-response-text${error ? ' gp-janet-error' : ''}`}>
            {response || error}
          </p>
        </div>
      )}
    </div>
  )
}
