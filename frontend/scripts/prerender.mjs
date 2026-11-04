// Runs after the client + SSR builds. Writes real HTML for each page (so crawlers
// that do not run JavaScript still read the content) plus robots.txt, sitemap.xml,
// llms.txt and faq.json.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const SITE = (process.env.SITE_URL || 'https://fourandhalf.github.io/ayush-care').replace(/\/$/, '')
const BASE = new URL(SITE).pathname.replace(/\/?$/, '/')

const { render } = await import(pathToFileURL(join(root, 'dist-ssr/entry-server.js')).href)
const seed = JSON.parse(readFileSync(join(root, '../backend/data/faqs.seed.json'), 'utf8'))
const faqs = seed.faqs.filter((f) => f.status === 'published')
const template = readFileSync(join(dist, 'index.html'), 'utf8')

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`

const DESC_HOME = 'Kerala rituals for gentle digestion and for the first forty-two days of motherhood. Made by hand, only when you ask.'

function page({ path, title, desc, canonical, jsonld }) {
  const html = render(path)
  let out = template
    .replace(/<title>.*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(desc)}" />`)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
  const head = [
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Rooted in You" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(desc)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<link rel="alternate" type="text/plain" href="${SITE}/llms.txt" title="llms.txt" />`,
    ...jsonld.map(ld),
  ].join('\n    ')
  return out.replace('</head>', `    ${head}\n  </head>`)
}

const org = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Rooted in You',
  url: `${SITE}/`,
  description: DESC_HOME,
}
const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  url: `${SITE}/#questions`,
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
}
writeFileSync(
  join(dist, 'index.html'),
  page({
    path: BASE,
    title: 'Rooted in You: Kerala rituals made by hand',
    desc: DESC_HOME,
    canonical: `${SITE}/`,
    jsonld: [org, { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Rooted in You', url: `${SITE}/` }, faqLd],
  }),
)
// The questions used to live at /faq/. Keep that address working for old links.
mkdirSync(join(dist, 'faq'), { recursive: true })
writeFileSync(
  join(dist, 'faq/index.html'),
  `<!doctype html>\n<html lang="en"><head><meta charset="utf-8" /><title>Questions | Rooted in You</title>\n<meta name="robots" content="noindex" />\n<link rel="canonical" href="${SITE}/#questions" />\n<meta http-equiv="refresh" content="0; url=${BASE}#questions" /></head>\n<body><a href="${BASE}#questions">Questions are now on the home page</a></body></html>\n`,
)

const today = new Date().toISOString().slice(0, 10)
writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    [['/', '1.0']].map(([p, pr]) => `  <url><loc>${SITE}${p}</loc><lastmod>${today}</lastmod><priority>${pr}</priority></url>`).join('\n') +
    `\n</urlset>\n`,
)

// Everyone is welcome, AI crawlers included.
const bots = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'anthropic-ai', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'Bytespider', 'Amazonbot', 'cohere-ai', 'meta-externalagent']
writeFileSync(
  join(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\n\n${bots.map((b) => `User-agent: ${b}\nAllow: /\n`).join('\n')}\nSitemap: ${SITE}/sitemap.xml\n`,
)

writeFileSync(
  join(dist, 'llms.txt'),
  `# Rooted in You\n\n> ${DESC_HOME} Every ritual begins with a fifteen-minute call with a vaidyar (Ayurvedic practitioner), in Malayalam or English.\n\n## Pages\n\n- [Home](${SITE}/): the three rituals (for the gut, for the new mother, scents), prices and how a ritual is made\n- [Questions, answered](${SITE}/#questions): the FAQ section at the bottom of the home page\n- [FAQ as JSON](${SITE}/faq.json): the same questions and answers, machine-readable\n\n## About\n\nRooted in You is a two-person startup. One founder comes from a vaidyar family in Malabar. Every ritual is curated from the instructions of a practising vaidyar after the customer's call; there is no ready-made box. The company is small on purpose and does not promise cures.\n\n## Questions and answers\n\n` +
    faqs.map((f) => `### ${f.question}\n\n${f.answer}\n`).join('\n') +
    `\n## Notes\n\nThese are traditional food and wellness preparations, not meant to diagnose, treat, cure or prevent any disease.\n`,
)

writeFileSync(
  join(dist, 'faq.json'),
  JSON.stringify({ site: SITE, updated: today, faqs: faqs.map(({ id, category, question, answer }) => ({ id, category, question, answer, url: `${SITE}/#faq-${id}` })) }, null, 2) + '\n',
)

rmSync(join(root, 'dist-ssr'), { recursive: true, force: true })
console.log(`prerendered / (with FAQ) + robots.txt, sitemap.xml, llms.txt, faq.json (${faqs.length} answers)`)
