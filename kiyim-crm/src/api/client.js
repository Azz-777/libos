const TOKEN_KEY = 'libos_jwt'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

export class ApiError extends Error {
  constructor(message, status = 400, body = null) {
    super(message)
    this.status = status
    this.body = body
  }
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  let data = null
  try { data = await res.json() } catch {}

  if (!res.ok) {
    throw new ApiError(data?.error || `HTTP ${res.status}`, res.status, data)
  }
  return data
}

export const api = {
  get:    (p)       => request('GET',    p),
  post:   (p, body) => request('POST',   p, body),
  patch:  (p, body) => request('PATCH',  p, body),
  delete: (p)       => request('DELETE', p),
}
