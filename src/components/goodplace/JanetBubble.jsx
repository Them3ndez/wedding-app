import { useState, useRef, useEffect } from 'react'
import { askJanet } from './Janet'

export default function JanetBubble() {
  const [open, setOpen]       = useState(false)
  const [input, setInput]     = useState('')
  const [messages, setMessages] = useState([
    { role: 'janet', text: 'Hi! I\'m Janet. I know literally everything. What would you like to know?' }
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
      const reply = await askJanet(q)
      setMessages(prev => [...prev, { role: 'janet', text: reply }])
    } catch (err) {
      console.log('Janet bubble error:', err)
      setMessages(prev => [...prev, { role: 'janet', text: 'Cannot compute.', error: true }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) handleSend(e)
  }

  return (
    <div className="gp-bubble-wrap">
      {open && (
        <div className="gp-bubble-popup">
          <div className="gp-bubble-header">
            <span className="gp-bubble-header-avatar">😇</span>
            <span className="gp-bubble-header-name">Janet</span>
            <button className="gp-bubble-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </div>

          <div className="gp-bubble-messages">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`gp-bubble-msg gp-bubble-msg--${m.role}${m.error ? ' gp-bubble-msg--error' : ''}`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="gp-bubble-msg gp-bubble-msg--janet gp-bubble-typing">
                <span /><span /><span />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form className="gp-bubble-form" onSubmit={handleSend}>
            <input
              ref={inputRef}
              className="gp-bubble-input"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask Janet anything..."
              autoComplete="off"
              disabled={loading}
            />
            <button
              className="gp-bubble-send"
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
        className={`gp-bubble-btn${open ? ' gp-bubble-btn--open' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label="Ask Janet"
      >
        Ask Janet ✨
      </button>
    </div>
  )
}
