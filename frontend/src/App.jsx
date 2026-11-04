import { LangProvider, T, useLang } from './lang'
import { Check, Photo, Plus, Stars } from './components/bits'
import Carousel from './components/Carousel'
import Rituals from './components/Rituals'

const Kasavu = () => <div className="kz-kasavu" aria-hidden="true" />

function Header() {
  const { lang, setLang } = useLang()
  return (
    <header className="kz-header wrap">
      <a href="#top" className="kz-logo serif" aria-label="Rooted in You, home">rooted in you</a>
      <nav className="kz-nav" aria-label="Main">
        <a href="#rituals" className="kz-hide-sm"><T en="Rituals" ml="ചര്യകൾ" /></a>
        <a href="#made" className="kz-hide-sm"><T en="How it's made" ml="തയ്യാറാക്കുന്ന വിധം" /></a>
        <div className="kz-lang" role="radiogroup" aria-label="Language">
          <button type="button" role="radio" aria-checked={lang === 'en'} onClick={() => setLang('en')}>EN</button>
          <button type="button" role="radio" aria-checked={lang === 'ml'} lang="ml" style={{ fontFamily: "'Manjari', sans-serif", letterSpacing: 0 }} onClick={() => setLang('ml')}>മലയാളം</button>
        </div>
        <a className="kz-begin-btn" href="#begin"><T en="Begin" ml="തുടങ്ങാം" /></a>
      </nav>
    </header>
  )
}

function Hero() {
  return (
    <section id="top" className="kz-top wrap">
      <svg aria-hidden="true" width="220" height="24" viewBox="0 0 220 24" style={{ overflow: 'visible' }}>
        <path className="kz-thread" d="M0 12 C 40 2, 70 22, 110 12 S 180 2, 220 12" fill="none" stroke="#B8913A" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      <h1 className="serif"><T en="Care, the way it was once given." ml="പണ്ട് നൽകിയിരുന്ന അതേ കരുതൽ." /></h1>
      <p><T en="Kerala rituals for gentle digestion and for the first forty-two days of motherhood. Made by hand, only when you ask." ml="സുഖമായ ദഹനത്തിനും, അമ്മയായതിനു ശേഷമുള്ള ആദ്യ നാൽപ്പത്തിരണ്ട് ദിവസങ്ങൾക്കുമുള്ള കേരളീയ ചര്യകൾ. നിങ്ങൾ ആവശ്യപ്പെടുമ്പോൾ മാത്രം, കൈകൊണ്ട് തയ്യാറാക്കുന്നത്." /></p>
      <div className="row">
        <a className="btn" href="#begin"><T en="Begin with a conversation" ml="ഒരു സംഭാഷണത്തോടെ തുടങ്ങാം" /></a>
        <button type="button" className="kz-listen" aria-pressed="false">
          <svg aria-hidden="true" width="22" height="16" viewBox="0 0 22 16" fill="none" stroke="#B8913A" strokeWidth="1.4" strokeLinecap="round"><path d="M1 8h0M5 5v6M9 2v12M13 6v4M17 3v10M21 8h0" /></svg>
          <T en="Listen to the field" ml="തോട്ടത്തിലെ ശബ്ദം കേൾക്കാം" />
        </button>
      </div>
    </section>
  )
}

function MadeByHand() {
  return (
    <section aria-label="Made by hand" className="kz-hand wrap">
      <figure style={{ margin: 0 }}>
        <Photo src="photos/grinding-herbs.webp" alt="Hands grinding fresh herbs on a granite grinding stone, in window light" />
        <figcaption>
          <span><T en="Ground by hand, the morning after your consultation." ml="കൺസൾട്ടേഷന്റെ പിറ്റേന്ന് രാവിലെ, കൈകൊണ്ട് അരച്ചെടുക്കുന്നു." /></span>
          <span lang="ml" style={{ fontFamily: "'Manjari', sans-serif", color: '#8C6B22' }}>കൈകൊണ്ട്</span>
        </figcaption>
      </figure>
    </section>
  )
}

const steps = [
  [['Day 0', 'ദിവസം 0'], ['Fifteen minutes with a vaidyar.', 'വൈദ്യരോടൊപ്പം പതിനഞ്ച് മിനിറ്റ്.']],
  [['Day 1', 'ദിവസം 1'], ['Your herbs are picked at first light.', 'നിങ്ങളുടെ പച്ചമരുന്നുകൾ പുലർച്ചെ പറിക്കുന്നു.']],
  [['Day 2', 'ദിവസം 2'], ['Dried, ground and blended by hand.', 'കൈകൊണ്ട് ഉണക്കി, അരച്ച്, ചേർത്തെടുക്കുന്നു.']],
  [['Day 4', 'ദിവസം 4'], ['At your door, every day counted out.', 'ഓരോ ദിവസത്തേതും വേർതിരിച്ച്, നിങ്ങളുടെ വീട്ടുപടിക്കൽ.']],
]

function Statement() {
  return (
    <section id="made" className="kz-statement wrap">
      <p className="big serif"><T en="Nothing is made until you ask." ml="നിങ്ങൾ ആവശ്യപ്പെടുന്നതുവരെ ഒന്നും തയ്യാറാക്കില്ല." /></p>
      <p className="sub"><T en="Your herbs are picked at first light, ground for you alone, and carry your name and the date." ml="നിങ്ങളുടെ പച്ചമരുന്നുകൾ പുലർച്ചെ പറിച്ച്, നിങ്ങൾക്കു മാത്രമായി അരച്ച്, നിങ്ങളുടെ പേരും തീയതിയും ചേർത്ത് എത്തുന്നു." /></p>
      <details className="kz-acc">
        <summary>
          <T en="How a ritual is made" ml="ഒരു ചര്യ തയ്യാറാകുന്ന വിധം" />
          <Plus />
        </summary>
        <ol className="kz-steps">
          {steps.map(([d, t], k) => (
            <li key={k}>
              <span className="d serif"><T en={d[0]} ml={d[1]} /></span>
              <span className="t"><T en={t[0]} ml={t[1]} /></span>
            </li>
          ))}
        </ol>
      </details>
    </section>
  )
}

const quotes = [
  { photo: 0, q: ['“Her own words, about how it felt to be looked after. Describe the days, not a medical result.”', '“അവളുടെ സ്വന്തം വാക്കുകൾ, പരിചരിക്കപ്പെട്ടത് എങ്ങനെ തോന്നി എന്ന്. ദിവസങ്ങളെക്കുറിച്ച് പറയൂ, ചികിത്സാഫലമല്ല.”'], who: ['[First name], Thrissur', '[പേര്], തൃശ്ശൂർ'], role: ['New mother, week six', 'പുതിയ അമ്മ, ആറാം ആഴ്ച'] },
  { q: ['“A relative, in her own words, about ordering from far away and how it arrived.”', '“ദൂരെ നിന്ന് ഓർഡർ ചെയ്തതിനെക്കുറിച്ചും അത് എത്തിയ വിധത്തെക്കുറിച്ചും, ഒരു ബന്ധുവിന്റെ വാക്കുകളിൽ.”'], who: ['[First name], Dubai', '[പേര്], ദുബായ്'], role: ['Ordered for her mother', 'അമ്മയ്ക്കായി ഓർഡർ ചെയ്തത്'] },
  { q: ['“What the mornings were like: the routine, the call, the little packets. No claims.”', '“പ്രഭാതങ്ങൾ എങ്ങനെയായിരുന്നു: ദിനചര്യ, കോൾ, ചെറിയ പൊതികൾ. അവകാശവാദങ്ങൾ വേണ്ട.”'], who: ['[First name], Kozhikode', '[പേര്], കോഴിക്കോട്'], role: ['For the gut, 21 mornings', 'ദഹനത്തിന്, 21 പ്രഭാതങ്ങൾ'] },
]

function Words() {
  return (
    <section id="words" aria-label="In their words" className="kz-words wrap">
      <div className="head-row">
        <h2 className="title serif"><T en="In their words" ml="അവരുടെ വാക്കുകളിൽ" /></h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'var(--muted)' }}>
          <Stars />
          <T en="[4.9] from [n] verified families" ml="[n] സ്ഥിരീകരിച്ച കുടുംബങ്ങളിൽ നിന്ന് [4.9]" />
        </div>
      </div>
      <div className="kz-quotes">
        {quotes.map((c, k) => (
          <figure className="kz-quote" key={k}>
            <Stars />
            <blockquote className="serif"><T en={c.q[0]} ml={c.q[1]} /></blockquote>
            <figcaption>
              <span className="who"><T en={c.who[0]} ml={c.who[1]} /></span>
              <span><T en={c.role[0]} ml={c.role[1]} /></span>
              <span className="ver"><Check /><T en="Verified purchase" ml="സ്ഥിരീകരിച്ച വാങ്ങൽ" /></span>
            </figcaption>
            <span className="note inline">Sample layout: replace with a real quote, used with written consent</span>
          </figure>
        ))}
      </div>

      <div style={{ marginTop: 'clamp(64px, 8vw, 112px)' }}>
        <div className="head-row" style={{ marginBottom: 20, gap: '8px 32px' }}>
          <h3 className="serif" style={{ margin: 0, fontWeight: 400, fontSize: 'clamp(28px, 2.6vw, 34px)', lineHeight: 1.1 }}>
            <T en="From our families' kitchens" ml="ഞങ്ങളുടെ കുടുംബങ്ങളുടെ അടുക്കളകളിൽ നിന്ന്" />
          </h3>
          <span style={{ fontSize: 14, color: 'var(--muted)' }}><T en="Shared with their permission." ml="അവരുടെ അനുമതിയോടെ പങ്കുവെച്ചത്." /></span>
        </div>
        <div className="kz-strip">
          {[[4, 'Hands working herbs'], [6, 'Morning field'], [7, 'Family archive photo'], [8, 'Leaves in window light'], [9, 'Old kitchen, warm light']].map(([n, alt]) => (
            <Photo key={n} n={n} alt={alt} />
          ))}
        </div>
        <span className="note inline" style={{ marginTop: 14 }}>Sample tiles: replace with photos families have shared, with written permission. No faces.</span>
      </div>
    </section>
  )
}

function Vaidyar() {
  return (
    <section className="kz-vaid wrap">
      <Photo n={10} alt="The vaidyar listening at her desk, in window light" note="Your photo: the vaidyar at her desk, mid-conversation, not posing" />
      <div className="col">
        <p lang="ml" style={{ margin: 0, fontFamily: "'Manjari', sans-serif", fontWeight: 100, fontSize: 30, color: '#8C6B22' }}>വൈദ്യർ</p>
        <h2 className="serif"><T en="Someone listens first." ml="ആദ്യം, ഒരാൾ കേൾക്കുന്നു." /></h2>
        <p className="sub"><T en="Every ritual begins with fifteen unhurried minutes with a vaidyar, in Malayalam or English. Then we make it for you." ml="ഓരോ ചര്യയും വൈദ്യരോടൊപ്പമുള്ള തിരക്കില്ലാത്ത പതിനഞ്ച് മിനിറ്റിൽ തുടങ്ങുന്നു, മലയാളത്തിലോ ഇംഗ്ലീഷിലോ. പിന്നെ ഞങ്ങൾ അത് നിങ്ങൾക്കായി തയ്യാറാക്കുന്നു." /></p>
        <details>
          <summary>
            <T en="Who will I speak with" ml="ആരോടാണ് ഞാൻ സംസാരിക്കുക" />
            <Plus />
          </summary>
          <ul className="kz-docs">
            <li><span><T en="Dr. [Name], BAMS" ml="ഡോ. [പേര്], BAMS" /></span><span><T en="Care after birth" ml="പ്രസവാനന്തര പരിചരണം" /></span></li>
            <li><span><T en="Dr. [Name], BAMS" ml="ഡോ. [പേര്], BAMS" /></span><span><T en="Digestion and routine" ml="ദഹനവും ദിനചര്യയും" /></span></li>
          </ul>
        </details>
      </div>
    </section>
  )
}

function Close() {
  return (
    <section id="begin" className="kz-close wrap">
      <h2 className="serif"><T en="Begin, whenever you're ready." ml="തയ്യാറാകുമ്പോൾ, തുടങ്ങാം." /></h2>
      <a className="btn" href="#begin"><T en="Begin with a conversation" ml="ഒരു സംഭാഷണത്തോടെ തുടങ്ങാം" /></a>
      <p><T en="₹299 for the call. It comes off your ritual." ml="കോളിന് ₹299. ഇത് ചര്യയുടെ വിലയിൽ കുറയ്ക്കും." /></p>
    </section>
  )
}

function Footer() {
  return (
    <footer className="kz-footer wrap">
      <span className="brand">
        <span className="serif">rooted in you</span>
        <span><T en="Kerala, since 2026" ml="കേരളം, 2026 മുതൽ" /></span>
      </span>
      <span className="links">
        <a href="#top">WhatsApp</a>
        <a href="#top">care@[domain]</a>
        <a href="#top"><T en="Lab reports" ml="ലാബ് റിപ്പോർട്ടുകൾ" /></a>
        <a href="#top">Instagram</a>
      </span>
      <span className="legal"><T en="Traditional food and wellness preparations. Not meant to diagnose, treat, cure or prevent any disease. FSSAI licence no. [licence number]." ml="പരമ്പരാഗത ഭക്ഷ്യ, സൗഖ്യ തയ്യാറെടുപ്പുകൾ. ഏതെങ്കിലും രോഗം നിർണ്ണയിക്കാനോ ചികിത്സിക്കാനോ ഭേദമാക്കാനോ തടയാനോ ഉദ്ദേശിച്ചുള്ളതല്ല. FSSAI ലൈസൻസ് നം. [ലൈസൻസ് നമ്പർ]." /></span>
    </footer>
  )
}

export default function App() {
  return (
    <LangProvider>
      <div className="kz-page">
        <Kasavu />
        <Header />
        <Carousel />
        <Hero />
        <MadeByHand />
        <Rituals />
        <Statement />
        <Words />
        <Vaidyar />
        <Close />
        <Footer />
        <Kasavu />
      </div>
    </LangProvider>
  )
}
