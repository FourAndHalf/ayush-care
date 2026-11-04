import { T } from '../lang'
import { Photo } from './bits'

const principles = [
  {
    title: ['Curated to you', 'നിങ്ങൾക്കായി ഒരുക്കുന്നത്'],
    body: [
      'There is no ready-made box. After your call, a practising vaidyar tells us what you need, and we put your ritual together from those instructions.',
      'തയ്യാറാക്കി വെച്ച പെട്ടികളില്ല. നിങ്ങളുടെ കോളിനു ശേഷം, പ്രാക്ടീസ് ചെയ്യുന്ന വൈദ്യർ നിങ്ങൾക്ക് വേണ്ടതെന്തെന്ന് ഞങ്ങളോട് പറയും, ആ നിർദ്ദേശങ്ങളിൽ നിന്ന് ഞങ്ങൾ നിങ്ങളുടെ ചര്യ ഒരുക്കും.',
    ],
  },
  {
    title: ['Small on purpose', 'ചെറുതായിരിക്കുന്നത് മനഃപൂർവം'],
    body: [
      'There are two of us. A person reads every message and every question, and nothing is made until you ask.',
      'ഞങ്ങൾ രണ്ടുപേരേയുള്ളൂ. ഓരോ സന്ദേശവും ഓരോ ചോദ്യവും ഒരാൾ വായിക്കും, നിങ്ങൾ ആവശ്യപ്പെടുന്നതുവരെ ഒന്നും തയ്യാറാക്കില്ല.',
    ],
  },
  {
    title: ['Honest about what it is', 'എന്താണെന്ന് തുറന്നു പറയുന്നു'],
    body: [
      'Traditional food and wellness preparations. We do not promise cures, and we will tell you plainly what a ritual is and is not.',
      'പരമ്പരാഗത ഭക്ഷ്യ, സൗഖ്യ തയ്യാറെടുപ്പുകൾ. ഞങ്ങൾ രോഗശമനം വാഗ്ദാനം ചെയ്യില്ല, ഒരു ചര്യ എന്താണെന്നും അല്ലെന്നും വ്യക്തമായി പറയും.',
    ],
  },
]

export default function About() {
  return (
    <section id="about" className="about wrap" aria-labelledby="about-title">
      <div className="about-grid">
        <div className="about-copy">
          <p className="eyebrow"><T en="About us" ml="ഞങ്ങളെക്കുറിച്ച്" /></p>
          <h2 id="about-title" className="serif">
            <T en="Two of us, and a family's way of caring." ml="ഞങ്ങൾ രണ്ടുപേർ, ഒരു കുടുംബത്തിന്റെ കരുതലിന്റെ വഴി." />
          </h2>
          <p>
            <T
              en="Rooted in You is a two-person startup. One of us comes from a vaidyar family in Malabar, where looking after people was not a job you applied for but something you grew up around."
              ml="റൂട്ടഡ് ഇൻ യു രണ്ടുപേരുടെ ചെറിയ സംരംഭമാണ്. ഞങ്ങളിൽ ഒരാൾ മലബാറിലെ ഒരു വൈദ്യകുടുംബത്തിൽ നിന്നാണ്. അവിടെ ആളുകളെ പരിചരിക്കുക എന്നത് അപേക്ഷിച്ചു നേടുന്ന ജോലിയല്ല, കണ്ടുവളർന്ന ഒന്നായിരുന്നു."
            />
          </p>
          <p>
            <T
              en="We started this so that kind of care could reach a kitchen far from home, without losing the one thing that made it work: someone listening first. So we stay small, and we follow the vaidyar."
              ml="അത്തരം കരുതൽ വീട്ടിൽ നിന്ന് ദൂരെയുള്ള ഒരു അടുക്കളയിലും എത്തണം എന്നതിനാലാണ് ഞങ്ങൾ ഇത് തുടങ്ങിയത്, അത് ഫലിക്കുന്ന ഒരൊറ്റ കാര്യം നഷ്ടപ്പെടുത്താതെ: ആദ്യം ഒരാൾ കേൾക്കുക. അതുകൊണ്ട് ഞങ്ങൾ ചെറുതായിരിക്കുന്നു, വൈദ്യരെ പിന്തുടരുന്നു."
            />
          </p>
          <ul className="about-people" aria-label="Founders">
            <li>
              <span className="nm serif">[Name]</span>
              <span className="rl"><T en="Grew up in a Malabar vaidyar family" ml="മലബാറിലെ വൈദ്യകുടുംബത്തിൽ വളർന്നു" /></span>
            </li>
            <li>
              <span className="nm serif">[Name]</span>
              <span className="rl"><T en="Co-founder" ml="സഹസ്ഥാപകൻ" /></span>
            </li>
          </ul>
        </div>
        <Photo n={7} alt="The two founders together" note="Your photo: the two of you together, working, not posed" />
      </div>

      <div className="about-principles">
        {principles.map((p, i) => (
          <div key={i} className="about-principle">
            <h3 className="serif"><T en={p.title[0]} ml={p.title[1]} /></h3>
            <p><T en={p.body[0]} ml={p.body[1]} /></p>
          </div>
        ))}
      </div>
    </section>
  )
}
