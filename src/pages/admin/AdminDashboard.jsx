import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import '../../styles/Admin.css'

const MEAL_COLORS = {
  chicken: '#4caf82',
  fish: '#5b8dee',
  vegetarian: '#e0c96e',
  vegan: '#e07b5b',
}

/* ── Confirmation Modal ─────────────────────────────────────────────────── */
function ConfirmModal({ message, onConfirm, onCancel, loading }) {
  return (
    <div className="admin-modal-overlay" onClick={onCancel}>
      <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
        <p className="admin-modal-message">{message}</p>
        <div className="admin-modal-actions">
          <button className="admin-cancel-btn" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="admin-delete-confirm-btn" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main Dashboard ─────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const navigate = useNavigate()
  const [guests, setGuests] = useState([])
  const [rsvps, setRsvps] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('overview')

  // Add guest form
  const [showAddGuest, setShowAddGuest] = useState(false)
  const [newGuest, setNewGuest] = useState({ first_name: '', last_name: '', email: '', phone: '', group_name: '', notes: '' })
  const [addingGuest, setAddingGuest] = useState(false)

  // Selection state
  const [selectedGuests, setSelectedGuests] = useState(new Set())
  const [selectedRsvps, setSelectedRsvps] = useState(new Set())

  // Modal state
  const [modal, setModal] = useState(null) // { message, onConfirm }
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('adminAuth') !== 'true') {
      navigate('/admin')
      return
    }
    fetchData()
  }, [navigate])

  // Clear selections when switching sections
  useEffect(() => {
    setSelectedGuests(new Set())
    setSelectedRsvps(new Set())
  }, [activeSection])

  const fetchData = async () => {
    setLoading(true)
    const [{ data: guestData }, { data: rsvpData }] = await Promise.all([
      supabase.from('guests').select('*').order('last_name'),
      supabase.from('rsvps').select('*').order('created_at', { ascending: false }),
    ])
    setGuests(guestData || [])
    setRsvps(rsvpData || [])
    setLoading(false)
  }

  const handleAddGuest = async (e) => {
    e.preventDefault()
    setAddingGuest(true)
    const { error } = await supabase.from('guests').insert([newGuest])
    if (error) {
      alert('Error adding guest: ' + error.message)
    } else {
      setNewGuest({ first_name: '', last_name: '', email: '', phone: '', group_name: '', notes: '' })
      setShowAddGuest(false)
      fetchData()
    }
    setAddingGuest(false)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth')
    navigate('/admin')
  }

  /* ── Delete helpers ───────────────────────────────────────────────────── */
  const openModal = (message, onConfirm) => setModal({ message, onConfirm })
  const closeModal = () => { if (!deleting) setModal(null) }

  const runDelete = async (fn) => {
    setDeleting(true)
    await fn()
    setDeleting(false)
    setModal(null)
    fetchData()
  }

  // Guests
  const confirmDeleteGuest = (g) => {
    openModal(
      `Are you sure you want to remove ${g.first_name} ${g.last_name} from the guest list? This cannot be undone.`,
      () => runDelete(async () => {
        const { error } = await supabase.from('guests').delete().eq('id', g.id)
        if (error) alert('Error: ' + error.message)
        else setSelectedGuests(prev => { const s = new Set(prev); s.delete(g.id); return s })
      })
    )
  }

  const confirmDeleteSelectedGuests = () => {
    const ids = [...selectedGuests]
    openModal(
      `Are you sure you want to remove ${ids.length} guest${ids.length > 1 ? 's' : ''} from the guest list? This cannot be undone.`,
      () => runDelete(async () => {
        const { error } = await supabase.from('guests').delete().in('id', ids)
        if (error) alert('Error: ' + error.message)
        else setSelectedGuests(new Set())
      })
    )
  }

  // RSVPs
  const confirmDeleteRsvp = (r) => {
    openModal(
      `Are you sure you want to delete this RSVP from ${r.first_name} ${r.last_name}? This cannot be undone.`,
      () => runDelete(async () => {
        const { error } = await supabase.from('rsvps').delete().eq('id', r.id)
        if (error) alert('Error: ' + error.message)
        else setSelectedRsvps(prev => { const s = new Set(prev); s.delete(r.id); return s })
      })
    )
  }

  const confirmDeleteSelectedRsvps = () => {
    const ids = [...selectedRsvps]
    openModal(
      `Are you sure you want to delete ${ids.length} selected RSVP${ids.length > 1 ? 's' : ''}? This cannot be undone.`,
      () => runDelete(async () => {
        const { error } = await supabase.from('rsvps').delete().in('id', ids)
        if (error) alert('Error: ' + error.message)
        else setSelectedRsvps(new Set())
      })
    )
  }

  /* ── Checkbox helpers ─────────────────────────────────────────────────── */
  const toggleGuest = (id) => setSelectedGuests(prev => {
    const s = new Set(prev)
    s.has(id) ? s.delete(id) : s.add(id)
    return s
  })
  const toggleAllGuests = () => {
    setSelectedGuests(selectedGuests.size === guests.length ? new Set() : new Set(guests.map(g => g.id)))
  }

  const toggleRsvp = (id) => setSelectedRsvps(prev => {
    const s = new Set(prev)
    s.has(id) ? s.delete(id) : s.add(id)
    return s
  })
  const toggleAllRsvps = () => {
    setSelectedRsvps(selectedRsvps.size === rsvps.length ? new Set() : new Set(rsvps.map(r => r.id)))
  }

  /* ── Stats ────────────────────────────────────────────────────────────── */
  const confirmed = rsvps.filter(r => r.attendance === 'yes').length
  const declined = rsvps.filter(r => r.attendance === 'no').length
  const maybe = rsvps.filter(r => r.attendance === 'maybe').length
  const totalInvited = guests.length

  const mealCounts = rsvps.reduce((acc, r) => {
    if (r.meal) acc[r.meal] = (acc[r.meal] || 0) + 1
    return acc
  }, {})
  const totalMeals = Object.values(mealCounts).reduce((a, b) => a + b, 0)

  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'guests', label: 'Guest List' },
    { id: 'rsvps', label: 'RSVPs' },
    { id: 'meals', label: 'Meal Choices' },
  ]

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner" />
        <p>Loading dashboard…</p>
      </div>
    )
  }

  const allGuestsSelected = guests.length > 0 && selectedGuests.size === guests.length
  const allRsvpsSelected = rsvps.length > 0 && selectedRsvps.size === rsvps.length

  return (
    <div className="admin-root">
      {/* Confirmation Modal */}
      {modal && (
        <ConfirmModal
          message={modal.message}
          onConfirm={modal.onConfirm}
          onCancel={closeModal}
          loading={deleting}
        />
      )}

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span className="admin-sidebar-monogram">W&amp;G</span>
          <span className="admin-sidebar-title">Dashboard</span>
        </div>
        <nav className="admin-sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`admin-nav-item${activeSection === item.id ? ' admin-nav-item--active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button className="admin-logout-btn" onClick={handleLogout}>Log Out</button>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <header className="admin-header">
          <h1 className="admin-header-title">
            {navItems.find(n => n.id === activeSection)?.label}
          </h1>
          <button className="admin-refresh-btn" onClick={fetchData}>Refresh</button>
        </header>

        {/* Overview */}
        {activeSection === 'overview' && (
          <section className="admin-section">
            <div className="admin-stats-row">
              <div className="admin-stat-card">
                <span className="admin-stat-number">{totalInvited}</span>
                <span className="admin-stat-label">Total Invited</span>
              </div>
              <div className="admin-stat-card admin-stat-card--green">
                <span className="admin-stat-number">{confirmed}</span>
                <span className="admin-stat-label">Confirmed</span>
              </div>
              <div className="admin-stat-card admin-stat-card--red">
                <span className="admin-stat-number">{declined}</span>
                <span className="admin-stat-label">Declined</span>
              </div>
              <div className="admin-stat-card admin-stat-card--yellow">
                <span className="admin-stat-number">{maybe}</span>
                <span className="admin-stat-label">Maybe</span>
              </div>
            </div>
            <div className="admin-stat-card admin-stat-card--wide">
              <span className="admin-stat-number">{rsvps.length}</span>
              <span className="admin-stat-label">Total RSVPs Submitted</span>
            </div>
          </section>
        )}

        {/* Guest List */}
        {activeSection === 'guests' && (
          <section className="admin-section">
            <div className="admin-section-toolbar">
              <div className="admin-toolbar-left">
                <p className="admin-section-count">{guests.length} guests</p>
                {selectedGuests.size > 0 && (
                  <button className="admin-delete-selected-btn" onClick={confirmDeleteSelectedGuests}>
                    Delete {selectedGuests.size} selected
                  </button>
                )}
              </div>
              <button className="admin-add-btn" onClick={() => setShowAddGuest(true)}>+ Add Guest</button>
            </div>

            {showAddGuest && (
              <form className="admin-add-form" onSubmit={handleAddGuest}>
                <h3 className="admin-add-form-title">New Guest</h3>
                <div className="admin-form-row">
                  <input className="admin-input" placeholder="First Name" required value={newGuest.first_name} onChange={e => setNewGuest(g => ({ ...g, first_name: e.target.value }))} />
                  <input className="admin-input" placeholder="Last Name" required value={newGuest.last_name} onChange={e => setNewGuest(g => ({ ...g, last_name: e.target.value }))} />
                </div>
                <div className="admin-form-row">
                  <input className="admin-input" placeholder="Email" value={newGuest.email} onChange={e => setNewGuest(g => ({ ...g, email: e.target.value }))} />
                  <input className="admin-input" placeholder="Phone" value={newGuest.phone} onChange={e => setNewGuest(g => ({ ...g, phone: e.target.value }))} />
                </div>
                <div className="admin-form-row">
                  <input className="admin-input" placeholder="Group" value={newGuest.group_name} onChange={e => setNewGuest(g => ({ ...g, group_name: e.target.value }))} />
                  <input className="admin-input" placeholder="Notes" value={newGuest.notes} onChange={e => setNewGuest(g => ({ ...g, notes: e.target.value }))} />
                </div>
                <div className="admin-form-actions">
                  <button type="submit" className="admin-add-btn" disabled={addingGuest}>{addingGuest ? 'Adding…' : 'Save Guest'}</button>
                  <button type="button" className="admin-cancel-btn" onClick={() => setShowAddGuest(false)}>Cancel</button>
                </div>
              </form>
            )}

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="admin-th-check">
                      <input
                        type="checkbox"
                        className="admin-checkbox"
                        checked={allGuestsSelected}
                        onChange={toggleAllGuests}
                      />
                    </th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Group</th>
                    <th>Notes</th>
                    <th className="admin-th-action"></th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map(g => (
                    <tr key={g.id} className={selectedGuests.has(g.id) ? 'admin-row--selected' : ''}>
                      <td className="admin-td-check">
                        <input
                          type="checkbox"
                          className="admin-checkbox"
                          checked={selectedGuests.has(g.id)}
                          onChange={() => toggleGuest(g.id)}
                        />
                      </td>
                      <td>{g.first_name} {g.last_name}</td>
                      <td>{g.email || '—'}</td>
                      <td>{g.phone || '—'}</td>
                      <td>{g.group_name || '—'}</td>
                      <td>{g.notes || '—'}</td>
                      <td className="admin-td-action">
                        <button className="admin-delete-row-btn" onClick={() => confirmDeleteGuest(g)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {guests.length === 0 && (
                    <tr><td colSpan={7} className="admin-table-empty">No guests yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* RSVPs */}
        {activeSection === 'rsvps' && (
          <section className="admin-section">
            <div className="admin-section-toolbar">
              <div className="admin-toolbar-left">
                <p className="admin-section-count">{rsvps.length} responses</p>
                {selectedRsvps.size > 0 && (
                  <button className="admin-delete-selected-btn" onClick={confirmDeleteSelectedRsvps}>
                    Delete {selectedRsvps.size} selected
                  </button>
                )}
              </div>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="admin-th-check">
                      <input
                        type="checkbox"
                        className="admin-checkbox"
                        checked={allRsvpsSelected}
                        onChange={toggleAllRsvps}
                      />
                    </th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Attendance</th>
                    <th>Guests</th>
                    <th>Meal</th>
                    <th>Dietary</th>
                    <th>Song</th>
                    <th>Message</th>
                    <th>Date</th>
                    <th className="admin-th-action"></th>
                  </tr>
                </thead>
                <tbody>
                  {rsvps.map(r => (
                    <tr key={r.id} className={selectedRsvps.has(r.id) ? 'admin-row--selected' : ''}>
                      <td className="admin-td-check">
                        <input
                          type="checkbox"
                          className="admin-checkbox"
                          checked={selectedRsvps.has(r.id)}
                          onChange={() => toggleRsvp(r.id)}
                        />
                      </td>
                      <td>{r.first_name} {r.last_name}</td>
                      <td>{r.email || '—'}</td>
                      <td>
                        <span className={`admin-badge admin-badge--${r.attendance}`}>
                          {r.attendance || '—'}
                        </span>
                      </td>
                      <td>{r.guests ?? '—'}</td>
                      <td>{r.meal || '—'}</td>
                      <td>{r.dietary || '—'}</td>
                      <td>{r.song || '—'}</td>
                      <td className="admin-td-message">{r.message || '—'}</td>
                      <td>{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</td>
                      <td className="admin-td-action">
                        <button className="admin-delete-row-btn" onClick={() => confirmDeleteRsvp(r)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {rsvps.length === 0 && (
                    <tr><td colSpan={11} className="admin-table-empty">No RSVPs yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Meal Chart */}
        {activeSection === 'meals' && (
          <section className="admin-section">
            <p className="admin-section-count">{totalMeals} meal selections</p>
            <div className="admin-meal-chart">
              {Object.entries(mealCounts).map(([meal, count]) => (
                <div key={meal} className="admin-meal-bar-row">
                  <span className="admin-meal-label">{meal.charAt(0).toUpperCase() + meal.slice(1)}</span>
                  <div className="admin-meal-bar-track">
                    <div
                      className="admin-meal-bar-fill"
                      style={{
                        width: totalMeals ? `${(count / totalMeals) * 100}%` : '0%',
                        background: MEAL_COLORS[meal] || '#a8b5a0',
                      }}
                    />
                  </div>
                  <span className="admin-meal-count">{count}</span>
                </div>
              ))}
              {totalMeals === 0 && <p className="admin-table-empty">No meal data yet.</p>}
            </div>

            <div className="admin-meal-legend">
              {Object.entries(mealCounts).map(([meal, count]) => (
                <div key={meal} className="admin-meal-legend-item">
                  <span className="admin-meal-legend-dot" style={{ background: MEAL_COLORS[meal] || '#a8b5a0' }} />
                  <span>{meal.charAt(0).toUpperCase() + meal.slice(1)}</span>
                  <span className="admin-meal-legend-pct">
                    {totalMeals ? Math.round((count / totalMeals) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
