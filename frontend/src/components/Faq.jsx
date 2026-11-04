import { useEffect, useMemo, useState } from 'react'
import seed from '../../../backend/data/faqs.seed.json'
import { T, useLang } from '../lang'
import { fetchFaqs, submitQuestion } from '../api'
import { Plus } from './bits'

// Bundled copy of the published answers: this is what crawlers see in the
// pre-rendered HTML, and what visitors see if the API can't be reached.
export const SEED_FAQS = seed.faqs.filter((f) => f.status === 'published')

function Answers({ faqs, query, category }) {
  const q = query.trim().toLowerCase()
  const shown = faqs.filter(
    (f) =>
      (category === 'all' || f.category === category) &&
      (!q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)),
  )
  useEffect(() => {
    const id = window.location.hash.replace('#', '')
    const el = id.startsWith('faq-') && document.getElementById(id)
    if (el && el.tagName === 'DETAILS') {
      el.open = true
      el.scrollIntoView({ block: 'center' })
    }
  }, [])
  if (!shown.length)
    return (
      <p className="faq-empty">
        <T en="No answers match that yet. Ask us below and we will add it." ml="ഇതിന് ഉത്തരം ഇതുവരെ ഇല്ല. താഴെ ചോദിക്കൂ, ഞങ്ങൾ ചേർക്കാം." />
      </p>
    )
  return (
    <div className="faq-list">
      {shown.map((f) => (
        <details key={f.id} id={`faq-${f.id}`} className="faq-item">
          <summary>
            <h3 className="serif">{f.question}</h3>
            <Plus />
          </summary>
          <div className="faq-answer">
            <p>{f.answer}</p>
            <a className="faq-link" href={`#faq-${f.id}`} aria-label={`Link to: ${f.question}`}>
              #
            </a>
          </div>
        </details>
      ))}
    </div>
  )
}

function AskForm() {
  const { lang } = useLang()
  const [state, setState] = useState('idle') // idle | sending | ok | error
  const [msg, setMsg] = useState('')
  const [f, setF] = useState({ question: '', name: '', email: '', website: '' })
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))
  const ml = lang === 'ml'

  async function onSubmit(e) {
    e.preventDefault()
    setState('sending')
    try {
      await submitQuestion(f)
      setState('ok')
      setF({ question: '', name: '', email: '', website: '' })
    } catch (err) {
      setState('error')
      setMsg(
        err.message === 'rate'
          ? ml ? 'ഒരുപാട് ചോദ്യങ്ങൾ. കുറച്ചു കഴിഞ്ഞ് വീണ്ടും ശ്രമിക്കൂ.' : 'That is a lot of questions in a short time. Please try again a little later.'
          : ['server', 'Failed to fetch'].includes(err.message) || err instanceof TypeError
            ? ml ? 'ഇപ്പോൾ സെർവറുമായി ബന്ധപ്പെടാൻ കഴിഞ്ഞില്ല. ദയവായി പിന്നീട് ശ്രമിക്കൂ.' : 'We could not reach the server just now. Please try again later.'
            : err.message,
      )
    }
  }

  return (
    <section className="faq-ask" aria-labelledby="ask-title">
      <h2 id="ask-title" className="serif"><T en="Did not find it? Ask us." ml="കണ്ടില്ലേ? ഞങ്ങളോട് ചോദിക്കൂ." /></h2>
      <p className="faq-sub"><T en="Every question is read by a person. Once we have answered it, it joins the list above." ml="ഓരോ ചോദ്യവും ഒരാൾ വായിക്കും. ഉത്തരം നൽകിക്കഴിഞ്ഞാൽ അത് മുകളിലെ പട്ടികയിൽ ചേരും." /></p>
      <form onSubmit={onSubmit} noValidate>
        <label className="faq-field">
          <span><T en="Your question" ml="നിങ്ങളുടെ ചോദ്യം" /></span>
          <textarea required minLength={10} maxLength={500} rows={4} value={f.question} onChange={set('question')} />
        </label>
        <div className="faq-row">
          <label className="faq-field">
            <span><T en="Name (optional)" ml="പേര് (ഐച്ഛികം)" /></span>
            <input type="text" maxLength={80} autoComplete="name" value={f.name} onChange={set('name')} />
          </label>
          <label className="faq-field">
            <span><T en="Email (optional, only to tell you when it is answered)" ml="ഇമെയിൽ (ഐച്ഛികം, ഉത്തരം അറിയിക്കാൻ മാത്രം)" /></span>
            <input type="email" maxLength={120} autoComplete="email" value={f.email} onChange={set('email')} />
          </label>
        </div>
        {/* honeypot: hidden from people, tempting to bots */}
        <label className="faq-hp" aria-hidden="true">
          Website <input type="text" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} />
        </label>
        <button className="btn" type="submit" disabled={state === 'sending'}>
          {state === 'sending' ? <T en="Sending…" ml="അയയ്ക്കുന്നു…" /> : <T en="Send my question" ml="ചോദ്യം അയയ്ക്കൂ" />}
        </button>
        <p className="faq-status" role="status" aria-live="polite" data-state={state}>
          {state === 'ok' && <T en="Thank you. We have your question and will answer it here." ml="നന്ദി. നിങ്ങളുടെ ചോദ്യം ലഭിച്ചു, ഇവിടെ ഉത്തരം നൽകും." />}
          {state === 'error' && msg}
        </p>
      </form>
    </section>
  )
}

export default function FaqSection() {
  const [faqs, setFaqs] = useState(SEED_FAQS)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')

  // Prefer live answers from the Go backend; fall back to the bundled copy.
  useEffect(() => {
    const ctl = new AbortController()
    fetchFaqs(ctl.signal).then((live) => live.length && setFaqs(live)).catch(() => {})
    return () => ctl.abort()
  }, [])

  const categories = useMemo(() => [...new Set(faqs.map((f) => f.category))], [faqs])

  return (
    <>
      <section id="questions" className="faq wrap" aria-labelledby="faq-title">
        <header className="faq-head">
          <p className="eyebrow faq-eyebrow"><T en="Questions" ml="ചോദ്യങ്ങൾ" /></p>
          <h2 id="faq-title" className="serif"><T en="Questions, answered." ml="ചോദ്യങ്ങൾ, ഉത്തരങ്ങൾ." /></h2>
          <p className="faq-sub"><T en="How a ritual begins, what it costs, how it is made and when it arrives." ml="ഒരു ചര്യ എങ്ങനെ തുടങ്ങുന്നു, എന്ത് ചെലവ്, എങ്ങനെ തയ്യാറാക്കുന്നു, എപ്പോൾ എത്തുന്നു." /></p>
        </header>

        <div className="faq-tools">
          <label className="faq-search">
            <span className="sr-only"><T en="Search the questions" ml="ചോദ്യങ്ങൾ തിരയുക" /></span>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#8C6B22" strokeWidth="1.4" strokeLinecap="round"><circle cx="7" cy="7" r="5" /><path d="M11 11l3.5 3.5" /></svg>
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" />
          </label>
          <div role="radiogroup" aria-label="Category" className="kz-chips">
            {['all', ...categories].map((c) => (
              <button type="button" role="radio" aria-checked={category === c} key={c} className="kz-chip" onClick={() => setCategory(c)}>
                {c === 'all' ? <T en="All" ml="എല്ലാം" /> : c}
              </button>
            ))}
          </div>
        </div>

        <Answers faqs={faqs} query={query} category={category} />
        <AskForm />
      </section>
    </>
  )
}
