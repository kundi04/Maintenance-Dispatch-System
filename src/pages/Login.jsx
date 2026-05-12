import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { getCookie } from '../utils/csrf'

function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/auth/csrf/')
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await api.post('/auth/login/', form, {
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
      })

      const { role } = res.data

      if (role === 'manager') navigate('/manager')
      else if (role === 'staff') navigate('/staff')
      else navigate('/resident')

    } catch (err) {
      setError('Invalid username or password.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Left Panel - Branding */}
        <div style={styles.brandPanel}>
          <div style={styles.brandContent}>
            <div style={styles.logoIcon}>🏢</div>
            <h1 style={styles.brandTitle}>Maintenance Dispatch System</h1>
            <p style={styles.brandSubtitle}>Streamlined property maintenance management</p>
            
            <div style={styles.roleCards}>
              <div style={styles.roleCard}>
                <span style={styles.roleIcon}>👔</span>
                <div>
                  <strong>Property Manager</strong>
                  <p>View all requests & assign tasks</p>
                </div>
              </div>
              <div style={styles.roleCard}>
                <span style={styles.roleIcon}>🔧</span>
                <div>
                  <strong>Maintenance Staff</strong>
                  <p>View assigned tasks & update status</p>
                </div>
              </div>
              <div style={styles.roleCard}>
                <span style={styles.roleIcon}>🏠</span>
                <div>
                  <strong>Resident</strong>
                  <p>Submit & track requests</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div style={styles.formPanel}>
          <div style={styles.formContainer}>
            <h2 style={styles.formTitle}>Welcome Back</h2>
            <p style={styles.formSubtitle}>Sign in to your account</p>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Username</label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>

              {error && <div style={styles.error}>⚠️ {error}</div>}

              <button type="submit" style={styles.submitBtn} disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div style={styles.testAccounts}>
              <p style={styles.testTitle}>Test Accounts</p>
              <div style={styles.testGrid}>
                <div style={styles.testItem}><strong>manager1</strong> / Test1234!</div>
                <div style={styles.testItem}><strong>staff1</strong> / Test1234!</div>
                <div style={styles.testItem}><strong>resident1</strong> / Test1234!</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { 
    minHeight: '100vh', 
    backgroundColor: '#f0f2f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem'
  },
  container: {
    display: 'flex',
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
    overflow: 'hidden',
    maxWidth: '900px',
    width: '100%',
  },
  brandPanel: {
    flex: '1',
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    padding: '2.5rem',
    display: 'flex',
    alignItems: 'center',
  },
  brandContent: {
    color: '#fff',
  },
  logoIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  brandTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    margin: '0 0 0.5rem',
  },
  brandSubtitle: {
    fontSize: '1rem',
    opacity: 0.85,
    marginBottom: '2rem',
  },
  roleCards: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  roleCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    fontSize: '0.9rem',
  },
  roleIcon: {
    fontSize: '1.5rem',
  },
  formPanel: {
    flex: '1',
    padding: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: '320px',
  },
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 0.25rem',
  },
  formSubtitle: {
    color: '#64748b',
    fontSize: '0.95rem',
    marginBottom: '1.75rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#475569',
  },
  input: {
    padding: '0.8rem 1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border 0.2s, box-shadow 0.2s',
  },
  error: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  submitBtn: {
    padding: '0.85rem',
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: '600',
    marginTop: '0.5rem',
    transition: 'background 0.2s',
  },
  testAccounts: {
    marginTop: '2rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid #e2e8f0',
  },
  testTitle: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.75rem',
  },
  testGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  testItem: {
    fontSize: '0.85rem',
    color: '#64748b',
    backgroundColor: '#f8fafc',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
  },
}

export default Login
