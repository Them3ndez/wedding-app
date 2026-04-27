import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/Admin.css'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('adminAuth', 'true')
      navigate('/admin/dashboard')
    } else {
      setError(true)
      setPassword('')
    }
  }

  return (
    <div className="admin-login-root">
      <div className="admin-login-card">
        <div className="admin-login-logo">W&amp;G</div>
        <h1 className="admin-login-title">Admin Access</h1>
        <p className="admin-login-sub">Wedding Dashboard</p>
        <form onSubmit={handleSubmit} className="admin-login-form">
          <input
            type="password"
            className={`admin-login-input${error ? ' admin-login-input--error' : ''}`}
            placeholder="Enter password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false) }}
            autoFocus
          />
          {error && <p className="admin-login-error">Incorrect password. Try again.</p>}
          <button type="submit" className="admin-login-btn">Enter</button>
        </form>
      </div>
    </div>
  )
}
