import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../styles/PhotoPages.css'

const ACCEPTED = 'image/jpeg,image/png,image/webp,image/heic,image/heif'
const BUCKET = 'wedding-photos'

export default function Upload() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [guestName, setGuestName] = useState('')
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const dropRef = useRef(null)

  const applyFile = (chosen) => {
    if (!chosen) return
    setFile(chosen)
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(chosen)
  }

  const handleFileChange = (e) => applyFile(e.target.files?.[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    applyFile(e.dataTransfer.files?.[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) { setError('Please choose a photo first.'); return }
    if (!guestName.trim()) { setError('Please enter your name.'); return }

    setUploading(true)
    setError(null)
    setProgress(10)

    // Build a unique file path
    const ext = file.name.split('.').pop().toLowerCase() || 'jpg'
    const slug = guestName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const filePath = `${Date.now()}-${slug}.${ext}`

    // Upload to Storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, { contentType: file.type, upsert: false })

    if (storageError) {
      setError('Upload failed: ' + storageError.message)
      setUploading(false)
      setProgress(0)
      return
    }

    setProgress(70)

    // Get public URL
    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(filePath)

    // Save metadata
    const { error: dbError } = await supabase.from('photos').insert([{
      guest_name: guestName.trim(),
      caption: caption.trim() || null,
      file_path: filePath,
      file_url: publicUrl,
    }])

    if (dbError) {
      setError('Could not save photo details: ' + dbError.message)
      setUploading(false)
      setProgress(0)
      return
    }

    setProgress(100)
    setUploading(false)
    setSubmitted(true)
  }

  const reset = () => {
    setFile(null)
    setPreview(null)
    setGuestName('')
    setCaption('')
    setError(null)
    setProgress(0)
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <div className="pp-root">
        <div className="pp-inner">
          <button className="pp-back" onClick={() => navigate('/memories')}>← Back to Memories</button>
          <div className="up-success">
            <span className="up-success-icon">✦</span>
            <h2 className="up-success-title">Photo Shared</h2>
            <p className="up-success-msg">
              Thank you, {guestName}! Your photo has been added to our wedding memories.
              We'll treasure it always.
            </p>
            <button className="up-success-again" onClick={reset}>Upload Another</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pp-root">
      <div className="pp-inner">
        <button className="pp-back" onClick={() => navigate('/memories')}>← Back to Memories</button>

        <p className="pp-eyebrow">Wendy &amp; Guillermo · Feb 7, 2027</p>
        <h1 className="pp-title">Share a Photo</h1>
        <p className="pp-subtitle">
          Upload a photo from the celebration and help us build our wedding album together.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Drop zone / preview */}
          {preview ? (
            <div className="up-preview-wrap">
              <img src={preview} alt="Preview" className="up-preview-img" />
              <label className="up-preview-change">
                Change photo
                <input type="file" accept={ACCEPTED} onChange={handleFileChange} />
              </label>
            </div>
          ) : (
            <div
              ref={dropRef}
              className={`up-dropzone${dragOver ? ' up-dropzone--active' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept={ACCEPTED}
                onChange={handleFileChange}
                aria-label="Choose a photo"
              />
              <span className="up-dropzone-icon">📷</span>
              <span className="up-dropzone-label">
                Tap to choose a photo<br />
                <span style={{ opacity: 0.7 }}>or drag and drop here</span>
              </span>
              <span className="up-dropzone-hint">JPEG · PNG · WEBP · HEIC</span>
            </div>
          )}

          <div className="up-form">
            <div className="up-field">
              <label className="up-label" htmlFor="up-name">Your Name</label>
              <input
                id="up-name"
                className="up-input"
                type="text"
                placeholder="First and last name"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <div className="up-field">
              <label className="up-label" htmlFor="up-caption">
                Caption <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                id="up-caption"
                className="up-textarea"
                rows={2}
                placeholder="Say something about this moment…"
                value={caption}
                onChange={e => setCaption(e.target.value)}
              />
            </div>

            {error && <p className="up-error">{error}</p>}

            {uploading && (
              <div className="up-progress-wrap">
                <div className="up-progress-bar" style={{ width: `${progress}%` }} />
              </div>
            )}

            <button
              type="submit"
              className="up-submit"
              disabled={uploading}
            >
              {uploading ? 'Uploading…' : 'Share Photo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
