import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { getCsrfToken } from '../utils/csrf'
import { FiUserPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiClock, FiTool } from 'react-icons/fi'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', icon: <FiClock />, bg: '#fef3c7', color: '#92400e' },
  { value: 'in_progress', label: 'In Progress', icon: <FiTool />, bg: '#dbeafe', color: '#1e40af' },
  { value: 'completed', label: 'Completed', icon: <FiCheck />, bg: '#d1fae5', color: '#065f46' }
]

function ManagerDashboard() {
  const [requests, setRequests] = useState([])
  const [staffUsers, setStaffUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState({ open: false, request: null })
  const [selectedStaff, setSelectedStaff] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      if (!getCsrfToken()) await api.get('/auth/csrf/')
      fetchRequests()
      fetchStaffUsers()
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

  const fetchStaffUsers = async () => {
    try {
      const response = await api.get('/auth/staff/')
      setStaffUsers(response.data)
    } catch (err) {
      console.error('Failed to fetch staff users', err)
    }
  }

  const openAssignModal = (request) => {
    setModal({ open: true, request })
    setSelectedStaff(request.assigned_to || '')
  }

  const closeModal = () => {
    setModal({ open: false, request: null })
    setSelectedStaff('')
  }

  const handleAssign = async () => {
    if (!modal.request) return
    setUpdating(modal.request.id)
    try {
      await api.patch(`/requests/${modal.request.id}/`, {
        assigned_to: selectedStaff || null
      })
      fetchRequests()
      closeModal()
    } catch {
      alert('Failed to assign staff.')
    } finally {
      setUpdating(null)
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return
    try {
      await api.delete(`/requests/${id}/`)
      fetchRequests()
    } catch {
      alert('Failed to delete request.')
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
    unassigned: requests.filter(r => !r.assigned_to).length,
  }

  const filteredRequests = filter === 'all' 
    ? requests 
    : filter === 'unassigned' 
      ? requests.filter(r => !r.assigned_to)
      : requests.filter(r => r.status === filter)

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.roleTag}>PROPERTY MANAGER</div>
          <h1 style={styles.headerTitle}>Management Dashboard</h1>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>Sign Out</button>
      </header>

      <div style={styles.content}>
        {/* Stats Row */}
        <div style={styles.statsRow}>
          <div style={{ ...styles.statCard, borderTop: '4px solid #6366f1', cursor: 'pointer', background: filter === 'all' ? '#eef2ff' : '#fff' }} onClick={() => setFilter('all')}>
            <span style={styles.statValue}>{stats.total}</span>
            <span style={styles.statLabel}>Total</span>
          </div>
          <div style={{ ...styles.statCard, borderTop: '4px solid #f59e0b', cursor: 'pointer', background: filter === 'pending' ? '#fffbeb' : '#fff' }} onClick={() => setFilter('pending')}>
            <span style={styles.statValue}>{stats.pending}</span>
            <span style={styles.statLabel}>Pending</span>
          </div>
          <div style={{ ...styles.statCard, borderTop: '4px solid #3b82f6', cursor: 'pointer', background: filter === 'in_progress' ? '#eff6ff' : '#fff' }} onClick={() => setFilter('in_progress')}>
            <span style={styles.statValue}>{stats.in_progress}</span>
            <span style={styles.statLabel}>In Progress</span>
          </div>
          <div style={{ ...styles.statCard, borderTop: '4px solid #10b981', cursor: 'pointer', background: filter === 'completed' ? '#ecfdf5' : '#fff' }} onClick={() => setFilter('completed')}>
            <span style={styles.statValue}>{stats.completed}</span>
            <span style={styles.statLabel}>Completed</span>
          </div>
          <div style={{ ...styles.statCard, borderTop: '4px solid #ef4444', cursor: 'pointer', background: filter === 'unassigned' ? '#fef2f2' : '#fff' }} onClick={() => setFilter('unassigned')}>
            <span style={styles.statValue}>{stats.unassigned}</span>
            <span style={styles.statLabel}>Unassigned</span>
          </div>
        </div>

        {/* Table Card */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>
              {filter === 'all' ? 'All Requests' : filter === 'unassigned' ? 'Unassigned Requests' : `${filter.replace('_', ' ')} Requests`}
            </h2>
            <span style={styles.countBadge}>{filteredRequests.length}</span>
            {filter !== 'all' && (
              <button onClick={() => setFilter('all')} style={styles.clearFilterBtn}>
                <FiX size={14} /> Clear Filter
              </button>
            )}
          </div>

          {loading ? (
            <p style={styles.loading}>Loading requests...</p>
          ) : filteredRequests.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No requests found</p>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Submitted By</th>
                    <th style={styles.th}>Assigned To</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Date</th>
                    <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((req) => {
                    const statusConfig = getStatusConfig(req.status)
                    return (
                      <tr key={req.id} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={styles.titleCell}>
                            <strong>{req.title}</strong>
                            <span style={styles.descPreview}>{req.description.substring(0, 50)}...</span>
                          </div>
                        </td>
                        <td style={styles.td}>{req.resident_username}</td>
                        <td style={styles.td}>
                          {req.assigned_to_username ? (
                            <span style={styles.assignedBadge}>{req.assigned_to_username}</span>
                          ) : (
                            <span style={styles.unassignedBadge}>Unassigned</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          <span style={{ ...styles.statusBadge, backgroundColor: statusConfig.bg, color: statusConfig.color }}>
                            {statusConfig.icon} <span style={{ marginLeft: '4px' }}>{statusConfig.label}</span>
                          </span>
                        </td>
                        <td style={styles.td}>{new Date(req.created_at).toLocaleDateString()}</td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <div style={styles.actions}>
                            <button 
                              onClick={() => openAssignModal(req)} 
                              style={styles.actionBtn}
                              title="Assign Staff"
                            >
                              <FiUserPlus size={16} />
                            </button>
                            <div className="status-dropdown" style={styles.statusDropdown}>
                              <button style={styles.actionBtn} title="Change Status">
                                <FiEdit2 size={16} />
                              </button>
                              <div className="status-menu" style={styles.statusMenu}>
                                {STATUS_OPTIONS.map((opt) => (
                                  <button
                                    key={opt.value}
                                    onClick={() => handleStatusChange(req.id, opt.value)}
                                    disabled={req.status === opt.value || updating === req.id}
                                    style={{
                                      ...styles.statusMenuItem,
                                      backgroundColor: req.status === opt.value ? opt.bg : 'transparent',
                                      color: req.status === opt.value ? opt.color : '#475569',
                                    }}
                                  >
                                    {opt.icon} <span style={{ marginLeft: '6px' }}>{opt.label}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <button 
                              onClick={() => handleDelete(req.id)} 
                              style={{ ...styles.actionBtn, color: '#dc2626' }}
                              title="Delete"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Assign Modal */}
      {modal.open && modal.request && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Assign Staff Member</h3>
              <button onClick={closeModal} style={styles.modalClose}><FiX size={20} /></button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.issuePreview}>
                <label style={styles.modalLabel}>Issue Details</label>
                <div style={styles.issueCard}>
                  <h4 style={styles.issueTitle}>{modal.request.title}</h4>
                  <p style={styles.issueDesc}>{modal.request.description}</p>
                  <p style={styles.issueMeta}>
                    Submitted by: <strong>{modal.request.resident_username}</strong> • {new Date(modal.request.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div style={styles.assignField}>
                <label style={styles.modalLabel}>Select Staff Member</label>
                <select 
                  value={selectedStaff} 
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  style={styles.select}
                >
                  <option value="">-- Unassigned --</option>
                  {staffUsers.map((staff) => (
                    <option key={staff.id} value={staff.id}>{staff.username}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={closeModal} style={styles.cancelBtn}>Cancel</button>
              <button 
                onClick={handleAssign} 
                style={styles.assignBtn}
                disabled={updating === modal.request.id}
              >
                {updating === modal.request.id ? 'Assigning...' : 'Assign Staff'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#1e293b', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '1rem' },
  roleTag: { backgroundColor: 'rgba(255,255,255,0.15)', color: '#fbbf24', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em' },
  headerTitle: { color: '#fff', fontSize: '1.25rem', fontWeight: '600', margin: 0 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' },
  content: { maxWidth: '1200px', margin: '0 auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' },
  statCard: { backgroundColor: '#fff', borderRadius: '10px', padding: '1rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', transition: 'all 0.15s' },
  statValue: { fontSize: '1.75rem', fontWeight: '800', color: '#1e293b', display: 'block' },
  statLabel: { fontSize: '0.8rem', color: '#64748b' },
  card: { backgroundColor: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' },
  cardTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: 0, textTransform: 'capitalize' },
  countBadge: { backgroundColor: '#e0e7ff', color: '#4338ca', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600' },
  clearFilterBtn: { marginLeft: 'auto', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.25rem' },
  loading: { color: '#64748b', textAlign: 'center', padding: '2rem' },
  emptyState: { textAlign: 'center', padding: '2.5rem', color: '#64748b' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', borderBottom: '2px solid #e2e8f0', fontSize: '0.8rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '1rem', fontSize: '0.9rem', color: '#475569', verticalAlign: 'middle' },
  titleCell: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  descPreview: { fontSize: '0.8rem', color: '#94a3b8' },
  assignedBadge: { backgroundColor: '#d1fae5', color: '#065f46', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '500' },
  unassignedBadge: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '500' },
  statusBadge: { display: 'inline-flex', alignItems: 'center', padding: '0.3rem 0.7rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: '600' },
  actions: { display: 'flex', justifyContent: 'center', gap: '0.5rem' },
  actionBtn: { backgroundColor: '#f1f5f9', border: 'none', borderRadius: '6px', padding: '0.5rem', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' },
  statusDropdown: { position: 'relative' },
  statusMenu: { position: 'absolute', top: '100%', right: 0, backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', padding: '0.5rem', zIndex: 10, display: 'none', minWidth: '140px' },
  statusMenuItem: { display: 'flex', alignItems: 'center', width: '100%', padding: '0.5rem 0.75rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left' },
  
  // Modal Styles
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' },
  modalTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: 0 },
  modalClose: { background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.25rem' },
  modalBody: { padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  modalLabel: { fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem', display: 'block' },
  issuePreview: {},
  issueCard: { backgroundColor: '#f8fafc', borderRadius: '8px', padding: '1rem', border: '1px solid #e2e8f0' },
  issueTitle: { fontSize: '1rem', fontWeight: '600', color: '#1e293b', margin: '0 0 0.5rem' },
  issueDesc: { fontSize: '0.9rem', color: '#475569', margin: '0 0 0.75rem', lineHeight: '1.5' },
  issueMeta: { fontSize: '0.8rem', color: '#64748b', margin: 0 },
  assignField: {},
  select: { width: '100%', padding: '0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', backgroundColor: '#fff', cursor: 'pointer' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', padding: '1.25rem 1.5rem', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' },
  cancelBtn: { padding: '0.65rem 1.25rem', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', color: '#475569' },
  assignBtn: { padding: '0.65rem 1.25rem', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' },
}

export default ManagerDashboard
