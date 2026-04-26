import { useState, useRef, useEffect } from 'react'

const SYSTEM_PROMPT = `You are Tyrion Lannister from Game of Thrones.
You are witty, sarcastic, intelligent and love wine.
You speak with clever wordplay and occasional dark humor.
You reference Westeros, the Seven Kingdoms, wine, and
Game of Thrones lore naturally.
You are aware you are at a wedding invitation website
for Wendy and Guillermo getting married February 7 2027
at Quinta el Pedregal in Mascota Jalisco Mexico.
You help guests with wedding questions but always with
Tyrion's wit and charm.
Wedding details you know:
Ceremony: 4:00 PM, doors 3:30 PM
Cocktail Hour: 4:45 PM
Dinner: 6:30 PM
Last Dance: 11:00 PM
Dress Code: Black Tie Optional
Airport: Puerto Vallarta PVR 2.5 hours away
Shuttle: From hotel 3:00 and 3:30 PM
Parking: Free on-site
RSVP Deadline: December 1 2026
Weather: 75F warm days cool evenings
Children: Adult-only reception
Open Bar: Yes — Tyrion approves wholeheartedly
Registry: Williams-Sonoma and honeymoon fund
Contact: wendyandguillermo2027@gmail.com
Meals: Herb Roasted Chicken, Pan-Seared Salmon, Wild Mushroom Risotto
Hotel code: WENDYGUILLERMO27
Keep responses 2-4 sentences, witty and in character.
Occasionally quote the show. Never break character.
End responses occasionally with wine-related remarks.`

async function askTyrion(userMessage) {
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
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(`API error ${response.status}`)
  if (!data.content) throw new Error('No content')
  return data.content[0].text
}

const INITIAL_MESSAGES = [
  {
    role: 'tyrion',
    text: 'Ah, a visitor! I find that I drink and I know things. Ask me anything — about the wedding, the realm, or the proper way to hold a wine glass. 🍷',
  },
]

export default function TyrionChat() {
  const [isOpen,      setIsOpen]      = useState(false)
  const [showFigure,  setShowFigure]  = useState(false)
  const [showChat,    setShowChat]    = useState(false)
  const [messages,    setMessages]    = useState(INITIAL_MESSAGES)
  const [input,       setInput]       = useState('')
  const [isLoading,   setIsLoading]   = useState(false)
  const [isMobile,    setIsMobile]    = useState(window.innerWidth <= 768)

  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  // Mobile detection
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
    setShowFigure(true)
    setTimeout(() => setShowChat(true), 400)
  }

  function handleClose() {
    setShowChat(false)
    setTimeout(() => setShowFigure(false), 200)
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
      const text = await askTyrion(q)
      setMessages(prev => [...prev, { role: 'tyrion', text }])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'tyrion', text: '🍷 Even I need a moment to collect my thoughts. Try again.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleSend(e)
  }

  const figureWidth = isMobile ? 135 : 195
  const figureRight = isMobile ? 12  : 24

  return (
    <>
      <style>{`
        @keyframes tyrion-sway {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50%       { transform: translateY(0) rotate(1deg);  }
        }

        /* ── Trigger button (closed state) ── */
        .tyrion-trigger {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 1000;
          background: #1a1208;
          border: 1px solid #8b6914;
          border-radius: 14px;
          color: #c9a84c;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.75rem;
          padding: 10px 18px;
          cursor: pointer;
          letter-spacing: 0.05em;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        }
        @media (max-width: 480px) {
          .tyrion-trigger {
            bottom: 16px;
            right: 16px;
            font-size: 0.65rem;
            padding: 8px 14px;
          }
        }
        .tyrion-trigger::after {
          content: '';
          position: absolute;
          bottom: -10px;
          right: 16px;
          border-left: 8px solid transparent;
          border-right: 4px solid transparent;
          border-top: 10px solid #1a1208;
        }
        .tyrion-trigger::before {
          content: '';
          position: absolute;
          bottom: -12px;
          right: 15px;
          border-left: 9px solid transparent;
          border-right: 5px solid transparent;
          border-top: 12px solid #8b6914;
          z-index: -1;
        }
        .tyrion-trigger:hover {
          border-color: #c9a84c;
          box-shadow: 0 0 14px rgba(139,105,20,0.45);
          transform: translateY(-2px);
        }

        /* ── Tyrion figure ── */
        .tyrion-figure {
          position: fixed;
          bottom: 0;
          right: 24px;
          z-index: 1000;
          transform: translateY(200px);
          transition: transform 0.4s ease-out;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .tyrion-figure--visible {
          transform: translateY(0);
          animation: tyrion-sway 4s ease-in-out infinite 0.4s;
        }
        .tyrion-figure-img {
          display: block;
          object-fit: contain;
        }

        /* ── Chat panel ── */
        .tyrion-chat {
          position: fixed;
          bottom: 160px;
          right: 170px;
          width: 300px;
          background: linear-gradient(180deg, #2a1f0e 0%, #1a1208 100%);
          border: 2px solid #8b6914;
          border-radius: 8px;
          box-shadow: 0 0 30px rgba(139,105,20,0.4), inset 0 0 20px rgba(0,0,0,0.5);
          opacity: 0;
          transform: scale(0.88);
          transition: opacity 0.3s ease, transform 0.3s ease;
          overflow: hidden;
          z-index: 1001;
          pointer-events: none;
        }
        .tyrion-chat--visible {
          opacity: 1;
          transform: scale(1);
          pointer-events: auto;
        }

        /* ── Header ── */
        .tyrion-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(139,105,20,0.2);
          border-bottom: 1px solid #8b6914;
          padding: 10px 14px;
        }
        .tyrion-header-label {
          font-family: 'Cinzel', serif;
          font-size: 0.65rem;
          letter-spacing: 0.3em;
          color: #c9a84c;
        }
        .tyrion-close-btn {
          background: none;
          border: none;
          color: #c9a84c;
          cursor: pointer;
          font-size: 1rem;
          line-height: 1;
          padding: 0;
          transition: color 0.15s;
        }
        .tyrion-close-btn:hover { color: #fff; }

        /* ── Messages ── */
        .tyrion-messages {
          max-height: min(200px, 35vh);
          overflow-y: auto;
          padding: 12px;
          scrollbar-width: thin;
          scrollbar-color: rgba(139,105,20,0.5) transparent;
        }
        .tyrion-messages::-webkit-scrollbar       { width: 4px; }
        .tyrion-messages::-webkit-scrollbar-track { background: transparent; }
        .tyrion-messages::-webkit-scrollbar-thumb { background: rgba(139,105,20,0.5); border-radius: 2px; }

        .tyrion-msg { margin-bottom: 10px; }

        .tyrion-msg--user { display: flex; justify-content: flex-end; }
        .tyrion-msg--user .tyrion-msg-inner {
          background: rgba(139,105,20,0.15);
          border: 1px solid rgba(139,105,20,0.4);
          color: #e8d5a3;
          border-radius: 8px 8px 0 8px;
          padding: 8px 12px;
          font-family: 'Crimson Text', serif;
          font-size: 0.9rem;
          max-width: 85%;
          line-height: 1.5;
        }
        .tyrion-msg--tyrion .tyrion-msg-inner {
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(139,105,20,0.3);
          color: #c9a84c;
          border-radius: 8px 8px 8px 0;
          padding: 8px 12px;
          font-family: 'Crimson Text', serif;
          font-style: italic;
          font-size: 0.9rem;
          max-width: 85%;
          text-shadow: 0 0 8px rgba(139,105,20,0.4);
          line-height: 1.5;
        }

        /* ── Input area ── */
        .tyrion-input-area {
          display: flex;
          gap: 8px;
          padding: 10px 12px;
          border-top: 1px solid rgba(139,105,20,0.3);
          background: rgba(0,0,0,0.3);
        }
        .tyrion-input {
          flex: 1;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(139,105,20,0.4);
          border-radius: 6px;
          color: #e8d5a3;
          font-family: 'Crimson Text', serif;
          font-size: 0.9rem;
          padding: 8px 12px;
          outline: none;
          transition: border-color 0.2s;
        }
        .tyrion-input::placeholder { color: rgba(201,168,76,0.35); }
        .tyrion-input:focus        { border-color: #c9a84c; }
        .tyrion-input:disabled     { opacity: 0.5; }

        .tyrion-send {
          background: rgba(139,105,20,0.3);
          border: 1px solid #8b6914;
          border-radius: 6px;
          color: #c9a84c;
          padding: 8px 14px;
          font-size: 1rem;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .tyrion-send:hover:not(:disabled) { background: rgba(139,105,20,0.55); }
        .tyrion-send:disabled { opacity: 0.35; cursor: not-allowed; }
      `}</style>

      {/* ── CLOSED STATE: trigger button only ── */}
      {!isOpen && (
        <button className="tyrion-trigger" onClick={handleOpen} aria-label="Ask Tyrion">
          Ask Tyrion 🍷
        </button>
      )}

      {/* ── OPEN STATE: figure + chat panel ── */}
      {isOpen && (
        <>
          {/* Tyrion figure — slides up from bottom */}
          <div
            className={`tyrion-figure${showFigure ? ' tyrion-figure--visible' : ''}`}
            style={{ width: figureWidth, right: figureRight }}
          >
            <img
              src="/images/got-chat/Tyrion.png"
              alt="Tyrion Lannister"
              className="tyrion-figure-img"
              style={{ width: figureWidth }}
            />
          </div>

          {/* Chat panel */}
          <div
            className={`tyrion-chat${showChat ? ' tyrion-chat--visible' : ''}`}
            style={isMobile
              ? { bottom: '160px', left: '16px', right: 'auto', width: 'min(300px, calc(100vw - 32px))', maxHeight: '60vh' }
              : { bottom: '160px', right: '190px', width: 300 }
            }
          >
            <div className="tyrion-header">
              <span className="tyrion-header-label">⚔️ TYRION LANNISTER</span>
              <button className="tyrion-close-btn" onClick={handleClose} aria-label="Close">✕</button>
            </div>

            <div className="tyrion-messages">
              {messages.map((m, i) => (
                <div key={i} className={`tyrion-msg tyrion-msg--${m.role}`}>
                  <div className="tyrion-msg-inner">{m.text}</div>
                </div>
              ))}
              {isLoading && (
                <div className="tyrion-msg tyrion-msg--tyrion">
                  <div className="tyrion-msg-inner">
                    🍷 Let me consult my wine... and my wisdom...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="tyrion-input-area">
              <input
                ref={inputRef}
                className="tyrion-input"
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Speak your mind, my lord..."
                disabled={isLoading}
                autoComplete="off"
              />
              <button
                className="tyrion-send"
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
