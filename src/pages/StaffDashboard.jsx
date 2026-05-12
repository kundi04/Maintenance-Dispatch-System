import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { getCookie } from '../utils/csrf'

const STATUS_OPTIONS = ['pending', 'in_progress', 'completed']
const statusColor = { pending: '#f59e0b', in_progress: '#3b82f6', completed: '#10b981' }

function StaffDashboard() {
  const [requests, setRequests] = useState([])
  const [updating, setUpdating] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await api.get('/requests/')
      setRequests(response.data)
    } catch {
      navigate('/login')
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    setUpdating(id)
    try {
      await api.patch(`/requests/${id}/`, { status: newStatus }, {
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
      })
      fetchRequests()
    } catch (err) {
      alert('Failed to update status.')
    } finally {
      setUpdating(null)
    }
  }

  const handleLogout = async () => {
    await api.post('/auth/logout/', {}, {
      headers: { 'X-CSRFToken': getCookie('csrftoken') }
    })
    navigate('/login')
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Staff Dashboard</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </header>

      <div style={styles.content}>
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>My Assigned Requests</h2>

          {requests.length === 0 ? (
            <p style={styles.empty}>No requests assigned to you yet.</p>
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
                <p style={styles.meta}>Submitted by: {req.resident_username}</p>

                <div style={styles.actions}>
                  <span style={styles.actionLabel}>Update status:</span>
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
            ))
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f0f2f5' },
  header: { backgroundColor: '#0891b2', color: '#fff', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: '1.4rem', fontWeight: '700' },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' },
  content: { maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' },
  card: { backgroundColor: '#fff', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' },
  sectionTitle: { fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: '#1a1a2e' },
  empty: { color: '#999', fontStyle: 'italic' },
  requestItem: { borderBottom: '1px solid #f0f0f0', paddingBottom: '1.2rem', marginBottom: '1.2rem' },
  requestHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' },
  requestTitle: { fontSize: '1rem', fontWeight: '600', color: '#1a1a2e' },
  badge: { color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'capitalize' },
  requestDesc: { color: '#555', fontSize: '0.9rem', marginBottom: '0.3rem' },
  meta: { color: '#888', fontSize: '0.82rem', marginBottom: '0.75rem' },
  actions: { display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' },
  actionLabel: { fontSize: '0.85rem', color: '#555', marginRight: '0.25rem' },
  statusBtn: { padding: '0.35rem 0.8rem', border: 'none', borderRadius: '6px', fontSize: '0.82rem', cursor: 'pointer', fontWeight: '500', textTransform: 'capitalize' },
}

export default StaffDashboard
