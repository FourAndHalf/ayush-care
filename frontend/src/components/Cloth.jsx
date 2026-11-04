import { useEffect, useRef } from 'react'

// Procedural saree cloth, drawn once per viewport size.
// One smooth "fold surface" h(x,y) drives everything: the zari lines bend with it
// and the light/shadow comes from its slope, so the folds read as real drape.

const WAVES = [
  // [wavelength px, angle rad, amplitude, phase]
  [980, 0.42, 0.62, 0.3],
  [640, 1.15, 0.38, 2.1],
  [1500, -0.35, 0.7, 4.0],
  [420, 0.8, 0.14, 1.2],
].map(([wl, a, amp, ph]) => ({ kx: (Math.cos(a) * 2 * Math.PI) / wl, ky: (Math.sin(a) * 2 * Math.PI) / wl, amp, ph }))

const CELL_X = 80
const CELL_Y = 70

function hash(x, y) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}
const sstep = (t) => t * t * (3 - 2 * t)
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y)
  const fx = sstep(x - xi), fy = sstep(y - yi)
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1)
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy
}
const clamp = (v, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v)

function paint(canvas) {
  const w = Math.max(320, window.innerWidth)
  const h = Math.max(400, Math.min(Math.max(window.innerHeight, window.screen?.height || 0), 1400))
  const scale = Math.min(1, Math.sqrt(3_000_000 / (w * h)))
  const cw = Math.round(w * scale), ch = Math.round(h * scale)
  canvas.width = cw
  canvas.height = ch
  canvas.style.width = w + 'px'
  canvas.style.height = h + 'px'
  const ctx = canvas.getContext('2d')
  const img = ctx.createImageData(cw, ch)
  const px = img.data
  const inv = 1 / scale
  const LX = -0.62, LY = -0.5

  for (let j = 0; j < ch; j++) {
    const y = j * inv
    for (let i = 0; i < cw; i++) {
      const x = i * inv

      // fold surface + slope
      let fh = 0, fx = 0, fy = 0
      for (let k = 0; k < WAVES.length; k++) {
        const wv = WAVES[k]
        const ph = wv.kx * x + wv.ky * y + wv.ph
        fh += wv.amp * Math.sin(ph)
        const c = wv.amp * Math.cos(ph)
        fx += c * wv.kx
        fy += c * wv.ky
      }
      const u = x + 20 * fh
      const v = y + 16 * fh

      // cloth: weft streaks, warp grain, slubs
      const row = Math.floor(v / 1.6)
      let L = (hash(row, 7) - 0.5) * 13 + (vnoise(u * 0.006, row * 0.45) - 0.5) * 24
      L += (hash(Math.floor(u / 1.4), Math.floor(v / 1.4)) - 0.5) * 7
      if (hash(Math.floor(u / 9), row) > 0.985) L += 13
      let r = 238 + L, g = 232 + L * 0.97, b = 216 + L * 0.88

      // zari lines (vertical every CELL_X, horizontal every CELL_Y)
      const iu = Math.round((u - 40) / CELL_X)
      const du = u - (40 + CELL_X * iu)
      const iv = Math.round((v - 35) / CELL_Y)
      const dv = v - (35 + CELL_Y * iv)
      for (let pass = 0; pass < 2; pass++) {
        const d = pass === 0 ? du : dv
        const idx = pass === 0 ? iu : iv
        const along = pass === 0 ? v : u
        const dark = (((idx % 3) + 3) % 3) === (pass === 0 ? 1 : 2)
        const ad = Math.abs(d)
        const cover = clamp(1.7 - ad)
        const tw = 0.5 + 0.5 * Math.sin(along * 1.9)
        if (cover > 0) {
          const lr = dark ? 143 + tw * 80 * 0.35 : 214 + tw * 37 * 0.6
          const lg = dark ? 126 + tw * 100 * 0.35 : 178 + tw * 61 * 0.6
          const lb = dark ? 62 + tw * 98 * 0.35 : 78 + tw * 106 * 0.6
          const a = cover * 0.7
          r = r * (1 - a) + lr * a
          g = g * (1 - a) + lg * a
          b = b * (1 - a) + lb * a
        } else if (d > 0 && ad < 3.2) {
          const s = clamp(1 - Math.abs(ad - 2.1) / 1.1) * 0.13
          r -= r * s; g -= g * s; b -= b * s
        }
      }

      // small gold flower motifs in some cells
      const cu = Math.round(u / CELL_X), cv = Math.round(v / CELL_Y)
      if (hash(cu, cv) > 0.87) {
        const dx = u - CELL_X * cu, dy = v - CELL_Y * cv
        const rr = Math.hypot(dx, dy)
        if (rr < 7) {
          const f = 2 + 3.4 * Math.abs(Math.cos(2.5 * Math.atan2(dy, dx)))
          const a = clamp(f - rr) * 0.9
          if (a > 0) {
            const core = rr < 1.4 ? 0.45 : 0
            r = r * (1 - a) + (216 + 30 * core) * a
            g = g * (1 - a) + (181 + 46 * core) * a
            b = b * (1 - a) + (79 + 80 * core) * a
          }
        }
      }

      // light from the fold slope + vignette
      let shade = 1 + 24 * (-(fx * LX + fy * LY))
      shade = clamp(shade, 0.84, 1.12)
      const vx = x / w - 0.5, vy = y / h - 0.45
      const vig = 1 - 0.17 * clamp((Math.hypot(vx, vy) - 0.38) / 0.45)
      shade *= vig

      const o = (j * cw + i) * 4
      px[o] = clamp(r * shade, 0, 255)
      px[o + 1] = clamp(g * shade, 0, 255)
      px[o + 2] = clamp(b * shade, 0, 255)
      px[o + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
}

export default function Cloth() {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current
    let raf = 0, t = 0, lastW = 0
    const run = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => paint(c))
    }
    run()
    lastW = window.innerWidth
    const onResize = () => {
      // ignore mobile address-bar height changes
      if (window.innerWidth === lastW) return
      lastW = window.innerWidth
      clearTimeout(t)
      t = setTimeout(run, 150)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(raf)
      clearTimeout(t)
    }
  }, [])
  return <canvas ref={ref} className="kz-cloth" aria-hidden="true" />
}
