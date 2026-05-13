import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { getCsrfToken } from '../utils/csrf'

function ResidentDashboard() {
  const [requests, setRequests] = useState([])
  const [form, setForm] = useState({ title: '', description: '' })
  const [message, setMessage] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      if (!getCsrfToken()) await api.get('/auth/csrf/')
      fetchRequests()
    })()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await api.get('/requests/')
      setRequests(response.data)
    } catch {
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    setSubmitting(true)

    try {
      await api.post('/requests/', form)
      setMessage({ type: 'success', text: 'Request submitted successfully!' })
      setForm({ title: '', description: '' })
      fetchRequests()
    } catch {
      setMessage({ type: 'error', text: 'Failed to submit request. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await api.post('/auth/logout/', {})
    navigate('/login')
  }

  const getStatusBadge = (status) => {
    const config = {
      pending: { bg: '#fef3c7', color: '#92400e', icon: '⏳' },
      in_progress: { bg: '#dbeafe', color: '#1e40af', icon: '🔧' },
      completed: { bg: '#d1fae5', color: '#065f46', icon: '✓' }
    }
    const s = config[status] || { bg: '#e5e7eb', color: '#374151', icon: '?' }
    return (
      <span style={{ ...styles.badge, backgroundColor: s.bg, color: s.color }}>
        {s.icon} {status.replace('_', ' ')}
      </span>
    )
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.roleTag}>RESIDENT</div>
          <h1 style={styles.headerTitle}>My Maintenance Portal</h1>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>Sign Out</button>
      </header>

      <div style={styles.content}>
        {/* Create Request Card */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>📝</span>
            <h2 style={styles.cardTitle}>Submit New Request</h2>
          </div>
          <p style={styles.cardSubtitle}>Describe your maintenance issue below</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Issue Title</label>
              <input
                type="text"
                placeholder="e.g., Broken faucet in bathroom"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                placeholder="Please provide details about the issue..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={styles.textarea}
                rows={4}
                required
              />
            </div>

            {message.text && (
              <div style={{ ...styles.message, backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2', color: message.type === 'success' ? '#065f46' : '#991b1b' }}>
                {message.text}
              </div>
            )}

            <button type="submit" style={styles.submitBtn} disabled={submitting}>
              {submitting ? 'Submitting...' : '📤 Submit Request'}
            </button>
          </form>
        </section>

        {/* My Requests Card */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>📋</span>
            <h2 style={styles.cardTitle}>My Requests</h2>
            <span style={styles.countBadge}>{requests.length}</span>
          </div>

          {loading ? (
            <p style={styles.loading}>Loading your requests...</p>
          ) : requests.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>📭</span>
              <p>No requests submitted yet</p>
              <p style={styles.emptyHint}>Use the form above to create your first request</p>
            </div>
          ) : (
            <div style={styles.requestList}>
              {requests.map((req) => (
                <div key={req.id} style={styles.requestCard}>
                  <div style={styles.requestHeader}>
                    <h3 style={styles.requestTitle}>{req.title}</h3>
                    {getStatusBadge(req.status)}
                  </div>
                  <p style={styles.requestDesc}>{req.description}</p>
                  <div style={styles.requestMeta}>
                    <span>📅 {new Date(req.created_at).toLocaleDateString()}</span>
                    {req.assigned_to_username && (
                      <span>👷 Assigned to: <strong>{req.assigned_to_username}</strong></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#4f46e5', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '1rem' },
  roleTag: { backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em' },
  headerTitle: { color: '#fff', fontSize: '1.25rem', fontWeight: '600', margin: 0 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' },
  content: { maxWidth: '900px', margin: '0 auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  card: { backgroundColor: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' },
  cardIcon: { fontSize: '1.25rem' },
  cardTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: 0 },
  cardSubtitle: { color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' },
  countBadge: { marginLeft: 'auto', backgroundColor: '#e0e7ff', color: '#4338ca', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.85rem', fontWeight: '600', color: '#475569' },
  input: { padding: '0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none', transition: 'border 0.2s' },
  textarea: { padding: '0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', resize: 'vertical', outline: 'none', fontFamily: 'inherit' },
  submitBtn: { padding: '0.85rem', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: '600', marginTop: '0.5rem' },
  message: { padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '500' },
  loading: { color: '#64748b', textAlign: 'center', padding: '2rem' },
  emptyState: { textAlign: 'center', padding: '2.5rem', color: '#64748b' },
  emptyIcon: { fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' },
  emptyHint: { fontSize: '0.85rem', color: '#94a3b8' },
  requestList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  requestCard: { backgroundColor: '#f8fafc', borderRadius: '10px', padding: '1.25rem', border: '1px solid #e2e8f0' },
  requestHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' },
  requestTitle: { fontSize: '1rem', fontWeight: '600', color: '#1e293b', margin: 0 },
  badge: { padding: '0.3rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'capitalize' },
  requestDesc: { color: '#475569', fontSize: '0.9rem', marginBottom: '0.75rem', lineHeight: '1.5' },
  requestMeta: { display: 'flex', gap: '1.25rem', fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap' },
}

export default ResidentDashboard
