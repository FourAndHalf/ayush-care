import { useState } from 'react'
import { T, useLang } from '../lang'
import { Photo, Stars } from './bits'

function Rating() {
  return (
    <div className="kz-rating">
      <Stars width={78} />
      <span>[4.9] ([n] verified)</span>
    </div>
  )
}

function Card({ href, label, n, alt, note, badge, mlword, name, tagline, chips, price, cta }) {
  return (
    <article className="kz-card">
      <a className="kz-img photo" href={href} aria-label={label}>
        <img src={`${import.meta.env.BASE_URL}placeholders/p${n}.svg`} alt={alt} loading="lazy" />
        <span className="kz-badge"><T en={badge[0]} ml={badge[1]} /></span>
        <span className="note">{note}</span>
      </a>
      <div className="kz-body">
        {mlword}
        <h3><a className="serif" href={href}><T en={name[0]} ml={name[1]} /></a></h3>
        <Rating />
        <p className="kz-desc"><T en={tagline[0]} ml={tagline[1]} /></p>
        {chips}
        <div className="kz-price">
          <span className="amt serif">{price}</span>
          <small><T en="The ₹299 call comes off." ml="₹299 കോൾ വിലയിൽ കുറയ്ക്കും." /></small>
        </div>
        <a className="kz-cta" href={href}><T en={cta[0]} ml={cta[1]} /></a>
      </div>
    </article>
  )
}

const MlWord = ({ children }) => {
  // Shown only in English mode (in Malayalam mode the whole UI is Malayalam already)
  const { lang } = useLang()
  if (lang === 'ml') return null
  return <p className="kz-mlword" lang="ml">{children}</p>
}

export default function Rituals() {
  const [kit, setKit] = useState('full')
  const kits = [
    { id: 'full', label: ['Full 42 days', '42 ദിവസം പൂർണ്ണം'], price: '₹5,499' },
    { id: 'essentials', label: ['Essentials', 'അത്യാവശ്യം'], price: '₹2,999' },
  ]
  const current = kits.find((k) => k.id === kit)

  return (
    <section id="rituals" className="wrap" style={{ paddingTop: 'clamp(96px, 12vw, 176px)' }}>
      <div className="head-row">
        <h2 className="title serif"><T en="Three rituals" ml="മൂന്ന് ചര്യകൾ" /></h2>
        <a href="#begin" style={{ fontSize: 15, textUnderlineOffset: 6, textDecorationColor: '#B8913A' }}>
          <T en="Not sure which? Begin with a call" ml="ഉറപ്പില്ലേ? ഒരു കോളിൽ തുടങ്ങാം" />
        </a>
      </div>
      <div style={{ borderTop: '1px solid var(--line)', paddingTop: 'clamp(28px, 3vw, 40px)' }}>
        <div className="kz-cards">
          <Card
            href="#begin" label="For the gut" n={2}
            alt="Day-counted sachets of isabgol and spices laid out on linen"
            note="Your photo: the 21 sachets, each marked with its day, on linen"
            badge={['Made to order', 'ആവശ്യപ്പെടുമ്പോൾ തയ്യാറാക്കുന്നത്']}
            mlword={<MlWord>ദഹനം</MlWord>}
            name={['For the gut', 'ദഹനത്തിന്']}
            tagline={['Twenty-one quiet mornings.', 'ഇരുപത്തിയൊന്ന് ശാന്തമായ പ്രഭാതങ്ങൾ.']}
            chips={<div className="kz-chips"><span className="kz-chip kz-on"><T en="21 mornings" ml="21 പ്രഭാതങ്ങൾ" /></span></div>}
            price="₹1,499"
            cta={['Begin this ritual', 'ഈ ചര്യ തുടങ്ങാം']}
          />
          <Card
            href="#mother" label="For the new mother" n={1}
            alt="Week one's dated packets of kanji mix and a bottle of oil"
            note="Your photo: week one's dated packets and the oil, on wood"
            badge={['Planned by a vaidyar', 'വൈദ്യർ ഒരുക്കുന്നത്']}
            mlword={<MlWord>പ്രസവരക്ഷ</MlWord>}
            name={['For the new mother', 'പുതിയ അമ്മയ്ക്ക്']}
            tagline={['Forty-two days of being cared for.', 'കരുതലിന്റെ നാൽപ്പത്തിരണ്ട് ദിവസങ്ങൾ.']}
            chips={
              <div role="radiogroup" aria-label="Choose a kit" className="kz-chips">
                {kits.map((k) => (
                  <button type="button" role="radio" aria-checked={kit === k.id} key={k.id} className="kz-chip" onClick={() => setKit(k.id)}>
                    <T en={k.label[0]} ml={k.label[1]} />
                  </button>
                ))}
              </div>
            }
            price={current.price}
            cta={['See the forty-two days', 'നാൽപ്പത്തിരണ്ട് ദിവസങ്ങൾ കാണാം']}
          />
          <Card
            href="#begin" label="Scents" n={3}
            alt="Three small wooden roll-on attars in warm light"
            note="Your photo: three wooden roll-ons, close, warm light"
            badge={['Alcohol-free', 'ആൽക്കഹോൾ ഇല്ലാത്തത്']}
            mlword={<MlWord>സുഗന്ധം</MlWord>}
            name={['Scents', 'സുഗന്ധങ്ങൾ']}
            tagline={['Vetiver, sandalwood, jasmine. Worn close.', 'രാമച്ചം, ചന്ദനം, മുല്ലപ്പൂ. ചേർന്നു നിൽക്കുന്ന സുഗന്ധം.']}
            chips={<div className="kz-chips"><span className="kz-chip kz-on"><T en="Set of three" ml="മൂന്നെണ്ണത്തിന്റെ സെറ്റ്" /></span></div>}
            price="₹1,499"
            cta={['Choose three', 'മൂന്നെണ്ണം തിരഞ്ഞെടുക്കാം']}
          />
        </div>
      </div>
    </section>
  )
}
