import { useEffect, useState } from 'react'
import { T } from '../lang'

const slides = [
  { n: 1, href: '#mother', eyebrow: ['For the new mother', 'പുതിയ അമ്മയ്ക്ക്'], title: ['Forty-two days of being cared for.', 'കരുതലിന്റെ നാൽപ്പത്തിരണ്ട് ദിവസങ്ങൾ.'], body: ['Expecting soon? Reserve with ₹499. Nothing is picked until the baby arrives.', 'ഉടൻ പ്രതീക്ഷിക്കുന്നുണ്ടോ? ₹499 കൊണ്ട് ഉറപ്പിക്കാം. കുഞ്ഞ് എത്തുന്നതുവരെ ഒന്നും പറിക്കില്ല.'], cta: ['See the forty-two days', 'നാൽപ്പത്തിരണ്ട് ദിവസങ്ങൾ കാണാം'], alt: "Week one's dated packets of kanji mix and a bottle of oil, on wood", note: "Your photo: week one's dated packets and the oil, on wood" },
  { n: 2, href: '#begin', eyebrow: ['For the gut', 'ദഹനത്തിന്'], title: ['Twenty-one quiet mornings.', 'ഇരുപത്തിയൊന്ന് ശാന്തമായ പ്രഭാതങ്ങൾ.'], body: ['A sachet in warm water each morning, a tea after dinner. Nothing more to remember.', 'രാവിലെ ചെറുചൂടുവെള്ളത്തിൽ ഒരു സാഷെ, രാത്രി ഭക്ഷണശേഷം ഒരു ചായ. ഓർത്തുവെക്കാൻ മറ്റൊന്നുമില്ല.'], cta: ['Begin this ritual', 'ഈ ചര്യ തുടങ്ങാം'], alt: 'Day-counted sachets of isabgol and spices on linen', note: 'Your photo: the 21 sachets, each marked with its day, on linen' },
  { n: 3, href: '#begin', eyebrow: ['Scents', 'സുഗന്ധങ്ങൾ'], title: ['Vetiver, sandalwood, jasmine. Worn close.', 'രാമച്ചം, ചന്ദനം, മുല്ലപ്പൂ. ചേർന്നു നിൽക്കുന്ന സുഗന്ധം.'], body: ['Alcohol-free attars in a small wooden roll-on. Choose three to try, and keep the one that feels like yours.', 'ആൽക്കഹോൾ ഇല്ലാത്ത അത്തറുകൾ, ചെറിയ മരക്കുപ്പിയിൽ. മൂന്നെണ്ണം പരീക്ഷിക്കൂ, നിങ്ങളുടേതെന്ന് തോന്നുന്നത് സൂക്ഷിക്കൂ.'], cta: ['Choose three', 'മൂന്നെണ്ണം തിരഞ്ഞെടുക്കാം'], alt: 'Three small wooden roll-on attars in warm light', note: 'Your photo: three wooden roll-ons, close, warm light' },
  { n: 4, href: '#begin', eyebrow: ['A gift of care', 'കരുതലിന്റെ സമ്മാനം'], title: ['Care, sent to someone you love.', 'നിങ്ങൾക്ക് പ്രിയപ്പെട്ടവർക്ക് കരുതൽ എത്തിക്കാം.'], body: ['Ordering from far away? The vaidyar speaks with her, and the ritual arrives at her door in India.', 'ദൂരെ നിന്നാണോ ഓർഡർ ചെയ്യുന്നത്? വൈദ്യർ അവരോട് സംസാരിക്കും, ചര്യ ഇന്ത്യയിലെ അവരുടെ വീട്ടുപടിക്കൽ എത്തും.'], cta: ['Begin for someone I love', 'പ്രിയപ്പെട്ടവർക്കായി തുടങ്ങാം'], alt: 'Hands preparing herbs in soft light', note: 'Your photo: hands tying a ritual bundle, soft light, no faces' },
]

const INTERVAL = 8000

export default function Carousel() {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hover, setHover] = useState(false)
  const count = slides.length
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (paused || hover || reduced) return
    const id = setTimeout(() => setI((x) => (x + 1) % count), INTERVAL)
    return () => clearTimeout(id)
  }, [i, paused, hover, reduced, count])

  const go = (n) => setI((n + count) % count)

  return (
    <section
      className="kz-hero"
      aria-roledescription="carousel"
      aria-label="Featured rituals"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      {slides.map((s, idx) => (
        <div key={idx} className={`kz-slide${idx === i ? ' on' : ''}`} role="group" aria-roledescription="slide" aria-label={`${idx + 1} of ${count}`} aria-hidden={idx !== i}>
          <img className="kz-bg" src={`${import.meta.env.BASE_URL}placeholders/p${s.n}.svg`} alt={s.alt} />
          <div className="kz-scrim" />
          <div className="kz-stext wrap">
            <p className="eyebrow"><T en={s.eyebrow[0]} ml={s.eyebrow[1]} /></p>
            <h2 className="serif"><T en={s.title[0]} ml={s.title[1]} /></h2>
            <p className="lede"><T en={s.body[0]} ml={s.body[1]} /></p>
            <a className="kz-hero-btn" href={s.href} tabIndex={idx === i ? 0 : -1}><T en={s.cta[0]} ml={s.cta[1]} /></a>
          </div>
          <span className="note kz-bgnote">{s.note}</span>
        </div>
      ))}

      <button type="button" className="kz-arrow kz-prev" aria-label="Previous banner" onClick={() => go(i - 1)}>
        <svg aria-hidden="true" width="9" height="15" viewBox="0 0 9 15" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 1.5L1.5 7.5l6 6" /></svg>
      </button>
      <button type="button" className="kz-arrow kz-next" aria-label="Next banner" onClick={() => go(i + 1)}>
        <svg aria-hidden="true" width="9" height="15" viewBox="0 0 9 15" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M1.5 1.5l6 6-6 6" /></svg>
      </button>

      <div className="kz-ctrls">
        {slides.map((_, d) => (
          <button type="button" key={d} className="kz-dotl" aria-label={`Show banner ${d + 1} of ${count}`} aria-current={d === i} onClick={() => go(d)}>
            <i className={d === i ? 'kz-cur' : ''} />
          </button>
        ))}
        <button type="button" className="kz-pausel" aria-label="Pause or play the banner" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
          {paused ? (
            <svg aria-hidden="true" width="10" height="12" viewBox="0 0 12 14" fill="currentColor"><path d="M1.5 0.8l9.5 6.2-9.5 6.2z" /></svg>
          ) : (
            <svg aria-hidden="true" width="10" height="12" viewBox="0 0 12 14" fill="currentColor"><rect x="1" width="3.2" height="14" rx="1" /><rect x="7.8" width="3.2" height="14" rx="1" /></svg>
          )}
        </button>
      </div>
    </section>
  )
}
