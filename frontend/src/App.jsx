import { useEffect, useState } from 'react'

function App() {
  const [message, setMessage] = useState('Loading…')

  useEffect(() => {
    fetch('/api/hello')
      .then((r) => r.json())
      .then((d) => setMessage(d.message))
      .catch(() => setMessage('Backend unreachable'))
  }, [])

  return (
    <main style={{ fontFamily: 'system-ui', maxWidth: 640, margin: '4rem auto' }}>
      <h1>Ayush Care</h1>
      <p>{message}</p>
    </main>
  )
}

export default App
