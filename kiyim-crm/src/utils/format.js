export const som = (n) => {
  if (n == null || isNaN(n)) return "0 so'm"
  return new Intl.NumberFormat('uz-UZ').format(Math.round(n)) + " so'm"
}

export const somShort = (n) => {
  if (n == null || isNaN(n)) return '0'
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace('.0', '') + ' mlrd'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + ' mln'
  if (n >= 1_000) return Math.round(n / 1_000) + ' ming'
  return String(Math.round(n))
}

export const num = (n) => new Intl.NumberFormat('uz-UZ').format(n || 0)

const MONTHS = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek']

export const date = (d) => {
  if (!d) return '—'
  const x = new Date(d)
  return `${x.getDate()} ${MONTHS[x.getMonth()]} ${x.getFullYear()}`
}

export const dateTime = (d) => {
  if (!d) return '—'
  const x = new Date(d)
  return `${x.getDate()} ${MONTHS[x.getMonth()]}, ${String(x.getHours()).padStart(2, '0')}:${String(x.getMinutes()).padStart(2, '0')}`
}

export const timeAgo = (d) => {
  if (!d) return '—'
  const s = Math.floor((Date.now() - new Date(d)) / 1000)
  if (s < 60) return 'hozir'
  if (s < 3600) return `${Math.floor(s / 60)} daqiqa oldin`
  if (s < 86400) return `${Math.floor(s / 3600)} soat oldin`
  if (s < 604800) return `${Math.floor(s / 86400)} kun oldin`
  return date(d)
}

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()

export const dayLabel = (iso) => {
  const x = new Date(iso)
  return `${x.getDate()} ${MONTHS[x.getMonth()]}`
}
