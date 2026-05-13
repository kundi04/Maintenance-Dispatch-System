const STORAGE_KEY = 'dispatch_csrf_token'

export function getCookie(name) {
  let cookieValue = null

  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';')

    for (let cookie of cookies) {
      cookie = cookie.trim()
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
        break
      }
    }
  }

  return cookieValue
}

/** Cross-site (Vercel → Render): csrftoken cookie is not visible on document.cookie; use sessionStorage. */
export function getCsrfToken() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) return stored
  } catch {
    /* ignore */
  }
  return getCookie('csrftoken')
}

export function setCsrfToken(token) {
  if (!token) return
  try {
    sessionStorage.setItem(STORAGE_KEY, token)
  } catch {
    /* ignore */
  }
}

export function clearCsrfToken() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
