// Empty base = same origin (Vite dev proxy). Set VITE_API_URL when the API lives elsewhere.
const API = import.meta.env.VITE_API_URL ?? ''

export async function fetchFaqs(signal) {
  const res = await fetch(`${API}/api/faqs`, { signal, headers: { Accept: 'application/json' } })
  if (!res.ok || !(res.headers.get('content-type') || '').includes('json')) throw new Error('faq api unavailable')
  const data = await res.json()
  if (!Array.isArray(data.faqs)) throw new Error('bad faq payload')
  return data.faqs
}

export async function submitQuestion(payload) {
  const res = await fetch(`${API}/api/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (res.status === 429) throw new Error('rate')
  if (res.status === 400) {
    const e = await res.json().catch(() => ({}))
    throw new Error(e.error || 'invalid')
  }
  if (!res.ok) throw new Error('server')
  return res.json()
}
