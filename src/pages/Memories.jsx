import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../styles/PhotoPages.css'

// ─────────────────────────────────────────────────────────────────────────────
// Set COMING_SOON = false on or after wedding day to reveal the live feed.
// ─────────────────────────────────────────────────────────────────────────────
const COMING_SOON = false // TODO: set back to true after testing

// ── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ photos, index, onClose, onPrev, onNext }) {
  const photo = photos[index]
  const [comments, setComments] = useState([])
  const [cName, setCName] = useState('')
  const [cText, setCText] = useState('')
  const [posting, setPosting] = useState(false)

  // Fetch comments whenever photo changes
  useEffect(() => {
    if (!photo?.id) return
    setComments([])
    supabase
      .from('comments')
      .select('*')
      .eq('photo_id', photo.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => setComments(data || []))
  }, [photo?.id])

  // Escape key + prevent body scroll
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft')  onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, onPrev, onNext])

  const [showCommentModal, setShowCommentModal] = useState(false)

  const handlePostComment = async (e) => {
    e.preventDefault()
    if (!cName.trim() || !cText.trim()) return
    setPosting(true)
    const { data, error } = await supabase
      .from('comments')
      .insert([{ photo_id: photo.id, name: cName.trim(), comment: cText.trim() }])
      .select()
      .single()
    if (!error && data) {
      setComments(prev => [...prev, data])
      setCText('')
      setShowCommentModal(false)
    }
    setPosting(false)
  }

  return (
    <div className="lb-overlay" onClick={onClose} aria-modal="true" role="dialog">
      {/* Card — stop propagation so clicks inside don't close */}
      <div className="lb-card" onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button className="lb-close" onClick={onClose} aria-label="Close">✕</button>

        {/* Image */}
        <div className="lb-img-wrap">
          <img
            src={photo.file_url}
            alt={photo.caption || photo.guest_name}
            className="lb-img"
          />
        </div>

        {/* Meta + counter */}
        <div className="lb-meta">
          <div className="lb-meta-row">
            <span className="lb-guest">{photo.guest_name}</span>
            <span className="lb-counter">{index + 1} / {photos.length}</span>
          </div>
          {photo.caption && <p className="lb-caption">{photo.caption}</p>}
          <span className="lb-date">
            {new Date(photo.created_at).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric',
            })}
          </span>
        </div>

        {/* Comments */}
        <div className="lb-comments">
          <div className="lb-comments-list">
            {comments.length === 0 ? (
              <p className="lb-comments-empty">No comments yet. Be the first!</p>
            ) : (
              comments.map(c => (
                <div key={c.id} className="lb-comment-item">
                  <span className="lb-comment-name">{c.name}</span>
                  <span className="lb-comment-text">{c.comment}</span>
                  <span className="lb-comment-date">
                    {new Date(c.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric',
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
          <button
            className="lb-add-comment-btn"
            onClick={() => setShowCommentModal(true)}
          >
            + Add a comment
          </button>
        </div>

        {/* Prev / Next */}
        {photos.length > 1 && (
          <>
            <button
              className="lb-arrow lb-arrow--prev"
              onClick={onPrev}
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button
              className="lb-arrow lb-arrow--next"
              onClick={onNext}
              aria-label="Next photo"
            >
              ›
            </button>
          </>
        )}

        {/* Comment modal */}
        {showCommentModal && (
          <div className="lb-comment-modal-overlay" onClick={() => setShowCommentModal(false)}>
            <div className="lb-comment-modal" onClick={e => e.stopPropagation()}>
              <button
                className="lb-comment-modal-close"
                onClick={() => setShowCommentModal(false)}
                aria-label="Close"
              >✕</button>
              <h3 className="lb-comment-modal-title">Leave a comment</h3>
              <form onSubmit={handlePostComment} noValidate>
                <div className="lb-comment-modal-field">
                  <input
                    className="lb-comment-modal-input"
                    type="text"
                    placeholder="Your name"
                    value={cName}
                    onChange={e => setCName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
                <div className="lb-comment-modal-field">
                  <input
                    className="lb-comment-modal-input"
                    type="text"
                    placeholder="Your comment"
                    value={cText}
                    onChange={e => setCText(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="lb-comment-modal-post"
                  disabled={posting || !cName.trim() || !cText.trim()}
                >
                  {posting ? 'Posting…' : 'Post'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Live feed ─────────────────────────────────────────────────────────────────
function MemoriesFeed() {
  const navigate = useNavigate()
  const [photos, setPhotos]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [lightboxIdx, setLightboxIdx] = useState(null)

  useEffect(() => {
    supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setPhotos(data || []); setLoading(false) })
  }, [])

  const openLightbox  = (i)  => setLightboxIdx(i)
  const closeLightbox = ()   => setLightboxIdx(null)
  const prevPhoto     = useCallback(() =>
    setLightboxIdx(i => (i - 1 + photos.length) % photos.length), [photos.length])
  const nextPhoto     = useCallback(() =>
    setLightboxIdx(i => (i + 1) % photos.length), [photos.length])

  return (
    <div className="pp-root">
      {lightboxIdx !== null && (
        <Lightbox
          photos={photos}
          index={lightboxIdx}
          onClose={closeLightbox}
          onPrev={prevPhoto}
          onNext={nextPhoto}
        />
      )}

      <div className="pp-inner" style={{ maxWidth: 960 }}>
        <p className="pp-eyebrow">Wendy &amp; Guillermo · Feb 7, 2027</p>
        <h1 className="pp-title">Our Memories</h1>
        <p className="pp-subtitle">Photos shared by our guests on the day.</p>

        {/* Nav buttons */}
        <div className="mem-nav-btns">
          <button
            className="pp-back"
            onClick={() => {
              navigate('/')
              setTimeout(() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' }), 100)
            }}
          >
            ← Back to Gallery
          </button>
          <button className="pp-back" onClick={() => navigate('/upload')}>
            📷 Share a Photo
          </button>
        </div>

        {loading ? (
          <p style={{ color: 'rgba(28,28,30,0.35)', fontSize: '0.88rem' }}>Loading photos…</p>
        ) : photos.length === 0 ? (
          <p style={{ color: 'rgba(28,28,30,0.35)', fontSize: '0.88rem' }}>No photos yet.</p>
        ) : (
          <div className="mem-grid">
            {photos.map((p, i) => (
              <div
                key={p.id}
                className="mem-card"
                onClick={() => openLightbox(i)}
                role="button"
                tabIndex={0}
                aria-label={`View photo by ${p.guest_name}`}
                onKeyDown={e => e.key === 'Enter' && openLightbox(i)}
              >
                <div className="mem-img-wrap">
                  <img
                    src={p.file_url}
                    alt={p.caption || p.guest_name}
                    className="mem-img"
                    loading="lazy"
                  />
                </div>
                <div className="mem-meta">
                  <span className="mem-guest">{p.guest_name}</span>
                  {p.caption && <p className="mem-caption">{p.caption}</p>}
                  <span className="mem-date">
                    {new Date(p.created_at).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Coming soon shell ─────────────────────────────────────────────────────────
export default function Memories() {
  const navigate = useNavigate()

  if (!COMING_SOON) return <MemoriesFeed />

  return (
    <div className="pp-root">
      <div className="pp-inner">
        <button className="pp-back" onClick={() => navigate('/')}>← Back to site</button>

        <div className="mem-coming-soon">
          <div className="mem-cs-ornament">✦ ✦ ✦</div>
          <h1 className="mem-cs-title">Memories</h1>
          <p className="mem-cs-msg">
            Our wedding photo gallery will be revealed on the day.
            Come back on February 7th to see all the moments we shared together.
          </p>
          <span className="mem-cs-date">February 7, 2027</span>
        </div>
      </div>
    </div>
  )
}
