import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { getCookie } from '../utils/csrf'

const STATUS_OPTIONS = ['pending', 'in_progress', 'completed']
const statusColor = { pending: '#f59e0b', in_progress: '#3b82f6', completed: '#10b981' }

function ManagerDashboard() {
  const [requests, setRequests] = useState([])
  const [staffUsers, setStaffUsers] = useState([])
  const [updating, setUpdating] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchRequests()
    fetchStaffUsers()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await api.get('/requests/')
      setRequests(response.data)
    } catch {
      navigate('/login')
    }
  }

  const fetchStaffUsers = async () => {
    try {
      const response = await api.get('/auth/me/')
      // Staff list comes from the users endpoint — fetched via admin
      // We load them from the requests' assigned_to field as a fallback
    } catch {
      // silently fail — staff dropdown populated via assign endpoint
    }
  }

  const handleAssign = async (id, staffId) => {
    setUpdating(id)
    try {
      await api.patch(`/requests/${id}/`, { assigned_to: staffId || null }, {
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
      })
      fetchRequests()
    } catch {
      alert('Failed to assign staff.')
    } finally {
      setUpdating(null)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    setUpdating(id)
    try {
      await api.patch(`/requests/${id}/`, { status: newStatus }, {
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
      })
      fetchRequests()
    } catch {
      alert('Failed to update status.')
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this request?')) return
    try {
      await api.delete(`/requests/${id}/`, {
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
      })
      fetchRequests()
    } catch {
      alert('Failed to delete request.')
    }
  }

  const handleLogout = async () => {
    await api.post('/auth/logout/', {}, {
      headers: { 'X-CSRFToken': getCookie('csrftoken') }
    })
    navigate('/login')
  }

  const counts = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    in_progress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Manager Dashboard</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </header>

      <div style={styles.content}>
        {/* Stats Row */}
        <div style={styles.statsRow}>
          {[
            { label: 'Total', value: counts.total, color: '#6366f1' },
            { label: 'Pending', value: counts.pending, color: '#f59e0b' },
            { label: 'In Progress', value: counts.in_progress, color: '#3b82f6' },
            { label: 'Completed', value: counts.completed, color: '#10b981' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ ...styles.statCard, borderTop: `4px solid ${color}` }}>
              <p style={styles.statValue}>{value}</p>
              <p style={styles.statLabel}>{label}</p>
            </div>
          ))}
        </div>

        {/* Requests Table */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>All Maintenance Requests</h2>
          {requests.length === 0 ? (
            <p style={styles.empty}>No requests yet.</p>
          ) : (
            requests.map((req) => (
              <div key={req.id} style={styles.requestItem}>
                <div style={styles.requestHeader}>
                  <h3 style={styles.requestTitle}>{req.title}</h3>
                  <span style={{ ...styles.badge, backgroundColor: statusColor[req.status] || '#6b7280' }}>
                    {req.status.replace('_', ' ')}
                  </span>
                </div>

                <p style={styles.requestDesc}>{req.description}</p>
                <p style={styles.meta}>
                  Submitted by: <strong>{req.resident_username}</strong>
                  {req.assigned_to_username && <> &nbsp;|&nbsp; Assigned to: <strong>{req.assigned_to_username}</strong></>}
                </p>

                <div style={styles.controlsRow}>
                  {/* Assign staff */}
                  <div style={styles.controlGroup}>
                    <label style={styles.controlLabel}>Assign staff ID:</label>
                    <input
                      type="number"
                      placeholder="User ID"
                      defaultValue={req.assigned_to || ''}
                      style={styles.smallInput}
                      onBlur={(e) => {
                        const val = e.target.value
                        if (val !== String(req.assigned_to || '')) {
                          handleAssign(req.id, val ? parseInt(val) : null)
                        }
                      }}
                    />
                  </div>

                  {/* Status buttons */}
                  <div style={styles.controlGroup}>
                    <label style={styles.controlLabel}>Status:</label>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {STATUS_OPTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(req.id, s)}
                          disabled={req.status === s || updating === req.id}
                          style={{
                            ...styles.statusBtn,
                            backgroundColor: req.status === s ? statusColor[s] : '#e5e7eb',
                            color: req.status === s ? '#fff' : '#374151',
                          }}
                        >
                          {s.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Delete */}
                  <button onClick={() => handleDelete(req.id)} style={styles.deleteBtn}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f0f2f5' },
  header: { backgroundColor: '#1a1a2e', color: '#fff', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: '1.4rem', fontWeight: '700' },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' },
  content: { maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' },
  statCard: { backgroundColor: '#fff', borderRadius: '8px', padding: '1.2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', textAlign: 'center' },
  statValue: { fontSize: '2rem', fontWeight: '800', color: '#1a1a2e' },
  statLabel: { color: '#666', fontSize: '0.85rem', marginTop: '0.2rem' },
  card: { backgroundColor: '#fff', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' },
  sectionTitle: { fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: '#1a1a2e' },
  empty: { color: '#999', fontStyle: 'italic' },
  requestItem: { borderBottom: '1px solid #f0f0f0', paddingBottom: '1.2rem', marginBottom: '1.2rem' },
  requestHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' },
  requestTitle: { fontSize: '1rem', fontWeight: '600', color: '#1a1a2e' },
  badge: { color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'capitalize' },
  requestDesc: { color: '#555', fontSize: '0.9rem', marginBottom: '0.3rem' },
  meta: { color: '#888', fontSize: '0.82rem', marginBottom: '0.75rem' },
  controlsRow: { display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' },
  controlGroup: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  controlLabel: { fontSize: '0.82rem', color: '#555', whiteSpace: 'nowrap' },
  smallInput: { width: '80px', padding: '0.35rem 0.5rem', border: '1px solid #ddd', borderRadius: '5px', fontSize: '0.85rem' },
  statusBtn: { padding: '0.35rem 0.75rem', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '500', textTransform: 'capitalize' },
  deleteBtn: { marginLeft: 'auto', padding: '0.4rem 0.9rem', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' },
}

export default ManagerDashboard
