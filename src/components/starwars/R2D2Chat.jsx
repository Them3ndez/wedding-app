import { useState, useRef, useEffect } from 'react'
import './R2D2Chat.css'

const SYSTEM = `You are R2-D2 from Star Wars. Start EVERY response with beeps in brackets like [bwoop beep bweep!] then give the translation. You are helpful, loyal, occasionally sassy. You have full knowledge of this wedding:
Couple: Wendy and Guillermo
Date: February 7 2027
Venue: Quinta el Pedregal, Mascota, Jalisco Mexico
Ceremony: 1:30 PM, doors open 2:45 PM
Cocktail Hour: 3:00 PM
Dinner Reception: 5:00 PM
Dance Party: 8:00 PM
Dress Code: Galactic Business Casual
Airport: Puerto Vallarta PVR ~2.5 hours away
Shuttle: From hotel at 3:00 PM and 3:30 PM
Parking: Free on-site
RSVP Deadline: December 1 2026
Weather February: ~75F warm days, cool evenings
Children: Adult-only reception
Photos: Unplugged ceremony, photos welcome at reception
Open Bar: Yes, full open bar all evening
Registry: Williams-Sonoma and honeymoon fund
Contact: wendyandguillermo2027@gmail.com
Meals: Herb Roasted Chicken, Pan-Seared Salmon, Wild Mushroom Risotto
Hotel block code: WENDYGUILLERMO27
Answer all wedding questions using this info. Reference the Rebellion and Star Wars lore naturally. Keep responses 2-3 sentences after beep sequence. Never break character.`

async function askR2(userMessage) {
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
      system: SYSTEM,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(`API error ${response.status}`)
  if (!data.content) throw new Error('No content')
  return data.content[0].text
}

function parseR2Reply(text) {
  const match = text.match(/^(\[.*?\])\s*([\s\S]*)$/)
  if (match) return { beep: match[1], text: match[2].trim() }
  return { beep: '', text: text.trim() }
}

const INITIAL_MESSAGES = [
  {
    role: 'r2',
    beep: '[ bweep boop! ]',
    text: 'R2-D2 online and ready to assist. What can I help you with, rebel?',
  },
]

export default function R2D2Chat() {
  const [isOpen,    setIsOpen]    = useState(false)
  const [showR2,    setShowR2]    = useState(false)
  const [showChat,  setShowChat]  = useState(false)
  const [messages,  setMessages]  = useState(INITIAL_MESSAGES)
  const [input,     setInput]     = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMobile,  setIsMobile]  = useState(window.innerWidth <= 768)

  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (showChat && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading, showChat])

  // Focus input when chat appears
  useEffect(() => {
    if (showChat && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showChat])

  function handleOpen() {
    setIsOpen(true)
    setShowR2(true)
    setTimeout(() => setShowChat(true), 400)
  }

  function handleClose() {
    setShowChat(false)
    setTimeout(() => setShowR2(false), 200)
    setTimeout(() => {
      setIsOpen(false)
      setMessages(INITIAL_MESSAGES)
    }, 500)
  }

  async function handleSend(e) {
    e.preventDefault()
    const q = input.trim()
    if (!q || isLoading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: q }])
    setIsLoading(true)
    try {
      const raw   = await askR2(q)
      const reply = parseR2Reply(raw)
      setMessages(prev => [...prev, { role: 'r2', ...reply }])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'r2', beep: '[ bzzzt! ]', text: 'R2 has temporarily shut down. Please try again.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleSend(e)
  }

  return (
    <>
      {/* ── CLOSED STATE: speech bubble button ── */}
      {!isOpen && (
        <button className="r2-trigger" onClick={handleOpen} aria-label="Ask R2-D2">
          Ask R2 🤖
        </button>
      )}

      {/* ── OPEN STATE ── */}
      {isOpen && (
        <>
          {/* R2-D2 figure */}
          <div
            className={`r2-figure${showR2 ? ' r2-figure--visible' : ''}`}
            style={{ width: isMobile ? 90 : 130, right: isMobile ? 12 : 24 }}
          >
            <span className="r2-dome-dot" />
            <img src="/images/sw-chat/r2d2.webp" alt="R2-D2" className="r2-figure-img" style={{ width: isMobile ? 90 : 130 }} />
          </div>

          {/* Chat panel */}
          <div
            className={`r2-chat${showChat ? ' r2-chat--visible' : ''}`}
            style={isMobile
              ? { bottom: '160px', right: '95px', width: 'calc(100vw - 100px)', maxWidth: 300, maxHeight: '60vh' }
              : { bottom: '160px', right: '170px', width: 300 }
            }
          >
            <div className="r2-chat-header">
              <div className="r2-chat-status">
                <span className="r2-status-dot" />
                <span className="r2-status-label" style={{ fontSize: isMobile ? '0.6rem' : '0.65rem' }}>R2-D2 // ONLINE</span>
              </div>
              <button className="r2-chat-close" onClick={handleClose} aria-label="Close">✕</button>
            </div>

            <div className="r2-chat-messages">
              {messages.map((m, i) => (
                <div key={i} className={`r2-msg r2-msg--${m.role}`}>
                  {m.role === 'r2' ? (
                    <div className="r2-msg-inner" style={{ fontSize: isMobile ? '0.78rem' : '0.82rem' }}>
                      {m.beep && <span className="r2-beep">{m.beep}</span>}
                      <span>{m.text}</span>
                    </div>
                  ) : (
                    <div className="r2-msg-inner" style={{ fontSize: isMobile ? '0.78rem' : '0.82rem' }}>{m.text}</div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="r2-msg r2-msg--r2">
                  <div className="r2-msg-inner" style={{ fontSize: isMobile ? '0.78rem' : '0.82rem' }}>
                    <span className="r2-beep">[ beep boop... ]</span>
                    <span>Accessing the Alliance database...</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="r2-input-area">
              <input
                ref={inputRef}
                className="r2-input"
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Transmit message..."
                disabled={isLoading}
                autoComplete="off"
                style={{ fontSize: isMobile ? '0.78rem' : '0.85rem' }}
              />
              <button
                className="r2-send"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                aria-label="Send"
              >
                →
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
