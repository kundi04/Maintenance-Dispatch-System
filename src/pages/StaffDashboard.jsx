import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { getCsrfToken } from '../utils/csrf'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', icon: '⏳', bg: '#fef3c7', color: '#92400e' },
  { value: 'in_progress', label: 'In Progress', icon: '🔧', bg: '#dbeafe', color: '#1e40af' },
  { value: 'completed', label: 'Completed', icon: '✓', bg: '#d1fae5', color: '#065f46' }
]

function StaffDashboard() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
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

  const handleStatusChange = async (id, newStatus) => {
    setUpdating(id)
    try {
      await api.patch(`/requests/${id}/`, { status: newStatus })
      fetchRequests()
    } catch {
      alert('Failed to update status.')
    } finally {
      setUpdating(null)
    }
  }

  const handleLogout = async () => {
    await api.post('/auth/logout/', {})
    navigate('/login')
  }

  const getStatusConfig = (status) => STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0]

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    in_progress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.roleTag}>MAINTENANCE STAFF</div>
          <h1 style={styles.headerTitle}>My Assigned Tasks</h1>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>Sign Out</button>
      </header>

      <div style={styles.content}>
        {/* Stats Row */}
        <div style={styles.statsRow}>
          <div style={{ ...styles.statCard, borderTop: '4px solid #6366f1' }}>
            <span style={styles.statValue}>{stats.total}</span>
            <span style={styles.statLabel}>Total Assigned</span>
          </div>
          <div style={{ ...styles.statCard, borderTop: '4px solid #f59e0b' }}>
            <span style={styles.statValue}>{stats.pending}</span>
            <span style={styles.statLabel}>Pending</span>
          </div>
          <div style={{ ...styles.statCard, borderTop: '4px solid #3b82f6' }}>
            <span style={styles.statValue}>{stats.in_progress}</span>
            <span style={styles.statLabel}>In Progress</span>
          </div>
          <div style={{ ...styles.statCard, borderTop: '4px solid #10b981' }}>
            <span style={styles.statValue}>{stats.completed}</span>
            <span style={styles.statLabel}>Completed</span>
          </div>
        </div>

        {/* Tasks Card */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>📋</span>
            <h2 style={styles.cardTitle}>Tasks Assigned to Me</h2>
          </div>

          {loading ? (
            <p style={styles.loading}>Loading your tasks...</p>
          ) : requests.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>📭</span>
              <p>No tasks assigned to you yet</p>
              <p style={styles.emptyHint}>The Property Manager will assign tasks as they come in</p>
            </div>
          ) : (
            <div style={styles.taskList}>
              {requests.map((req) => {
                const statusConfig = getStatusConfig(req.status)
                return (
                  <div key={req.id} style={styles.taskCard}>
                    <div style={styles.taskHeader}>
                      <div>
                        <h3 style={styles.taskTitle}>{req.title}</h3>
                        <p style={styles.taskSubmitter}>Submitted by: {req.resident_username}</p>
                      </div>
                      <span style={{ ...styles.badge, backgroundColor: statusConfig.bg, color: statusConfig.color }}>
                        {statusConfig.icon} {statusConfig.label}
                      </span>
                    </div>
                    
                    <p style={styles.taskDesc}>{req.description}</p>
                    
                    <div style={styles.taskFooter}>
                      <span style={styles.taskDate}>📅 {new Date(req.created_at).toLocaleDateString()}</span>
                      
                      <div style={styles.statusActions}>
                        <span style={styles.actionLabel}>Update Status:</span>
                        {STATUS_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleStatusChange(req.id, opt.value)}
                            disabled={req.status === opt.value || updating === req.id}
                            style={{
                              ...styles.statusBtn,
                              backgroundColor: req.status === opt.value ? opt.bg : '#f1f5f9',
                              color: req.status === opt.value ? opt.color : '#64748b',
                              fontWeight: req.status === opt.value ? '600' : '500',
                              cursor: req.status === opt.value ? 'default' : 'pointer',
                            }}
                          >
                            {opt.icon} {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#0891b2', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '1rem' },
  roleTag: { backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em' },
  headerTitle: { color: '#fff', fontSize: '1.25rem', fontWeight: '600', margin: 0 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' },
  content: { maxWidth: '1000px', margin: '0 auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' },
  statCard: { backgroundColor: '#fff', borderRadius: '10px', padding: '1.25rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  statValue: { fontSize: '2rem', fontWeight: '800', color: '#1e293b', display: 'block' },
  statLabel: { fontSize: '0.85rem', color: '#64748b' },
  card: { backgroundColor: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' },
  cardIcon: { fontSize: '1.25rem' },
  cardTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: 0 },
  loading: { color: '#64748b', textAlign: 'center', padding: '2rem' },
  emptyState: { textAlign: 'center', padding: '2.5rem', color: '#64748b' },
  emptyIcon: { fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' },
  emptyHint: { fontSize: '0.85rem', color: '#94a3b8' },
  taskList: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  taskCard: { backgroundColor: '#f8fafc', borderRadius: '10px', padding: '1.25rem', border: '1px solid #e2e8f0' },
  taskHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' },
  taskTitle: { fontSize: '1.05rem', fontWeight: '600', color: '#1e293b', margin: 0 },
  taskSubmitter: { fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' },
  badge: { padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600' },
  taskDesc: { color: '#475569', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.5' },
  taskFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' },
  taskDate: { fontSize: '0.8rem', color: '#64748b' },
  statusActions: { display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' },
  actionLabel: { fontSize: '0.82rem', color: '#475569', fontWeight: '500' },
  statusBtn: { padding: '0.4rem 0.75rem', border: 'none', borderRadius: '6px', fontSize: '0.8rem', transition: 'all 0.2s' },
}

export default StaffDashboard
