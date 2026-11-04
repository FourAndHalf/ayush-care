const STAR = 'M10 0l2.9 6.2 6.8.8-5 4.7 1.3 6.7L10 15l-6 3.4 1.3-6.7-5-4.7 6.8-.8z'

export function Stars({ width = 84 }) {
  return (
    <svg aria-hidden="true" width={width} height={(width * 20) / 116} viewBox="0 0 116 20" fill="#B8913A">
      {[0, 24, 48, 72, 96].map((x) => (
        <path key={x} transform={`translate(${x} 0)`} d={STAR} />
      ))}
    </svg>
  )
}

export function Photo({ n, alt, note, className = '', style, children }) {
  return (
    <div className={`photo ${className}`} style={style}>
      <img src={`${import.meta.env.BASE_URL}placeholders/p${n}.svg`} alt={alt} loading="lazy" />
      {children}
      {note && <span className="note">{note}</span>}
    </div>
  )
}

export function Check() {
  return (
    <svg aria-hidden="true" width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="#B8913A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="6" />
      <path d="M4.2 7.2l2 2 3.6-4" />
    </svg>
  )
}

export function Plus() {
  return (
    <span className="kz-plus" aria-hidden="true" style={{ display: 'inline-flex' }}>
      <svg width="12" height="12" viewBox="0 0 14 14" stroke="#8C6B22" strokeWidth="1.4">
        <path d="M7 0v14M0 7h14" />
      </svg>
    </span>
  )
}
