import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { getCookie } from '../utils/csrf'

function ResidentDashboard() {
  const [requests, setRequests] = useState([])
  const [form, setForm] = useState({ title: '', description: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await api.post('/requests/', form, {
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
      })
      setSuccess('Request submitted successfully.')
      setForm({ title: '', description: '' })
      fetchRequests()
    } catch {
      setError('Failed to submit request.')
    }
  }

  const handleLogout = async () => {
    await api.post('/auth/logout/', {}, {
      headers: { 'X-CSRFToken': getCookie('csrftoken') }
    })
    navigate('/login')
  }

  const statusColor = { pending: '#f59e0b', in_progress: '#3b82f6', completed: '#10b981' }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Resident Dashboard</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </header>

      <div style={styles.content}>
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Submit a Maintenance Request</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={styles.input}
              required
            />
            <textarea
              placeholder="Describe the issue..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={styles.textarea}
              rows={4}
              required
            />
            {error && <p style={styles.error}>{error}</p>}
            {success && <p style={styles.success}>{success}</p>}
            <button type="submit" style={styles.submitBtn}>Submit Request</button>
          </form>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>My Requests</h2>
          {requests.length === 0 ? (
            <p style={styles.empty}>No requests submitted yet.</p>
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
                {req.assigned_to_username && (
                  <p style={styles.assignedTo}>Assigned to: {req.assigned_to_username}</p>
                )}
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f0f2f5' },
  header: { backgroundColor: '#4f46e5', color: '#fff', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: '1.4rem', fontWeight: '700' },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' },
  content: { maxWidth: '800px', margin: '2rem auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  card: { backgroundColor: '#fff', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' },
  sectionTitle: { fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: '#1a1a2e' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.8rem' },
  input: { padding: '0.75rem 1rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' },
  textarea: { padding: '0.75rem 1rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem', resize: 'vertical' },
  submitBtn: { padding: '0.75rem', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer', fontWeight: '600' },
  error: { color: '#dc2626', fontSize: '0.875rem' },
  success: { color: '#10b981', fontSize: '0.875rem' },
  empty: { color: '#999', fontStyle: 'italic' },
  requestItem: { borderBottom: '1px solid #f0f0f0', paddingBottom: '1rem', marginBottom: '1rem' },
  requestHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' },
  requestTitle: { fontSize: '1rem', fontWeight: '600', color: '#1a1a2e' },
  badge: { color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'capitalize' },
  requestDesc: { color: '#555', fontSize: '0.9rem' },
  assignedTo: { color: '#4f46e5', fontSize: '0.85rem', marginTop: '0.3rem' },
}

export default ResidentDashboard
