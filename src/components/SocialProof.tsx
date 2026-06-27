import { useState } from 'react'
import { Wrench, Truck, Wheat, Droplets, Wallet } from 'lucide-react'
import AnimatedTentacleLogo from './ui/AnimatedTentacleLogo'

export default function SocialProof() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const rubros = [
    { icon: Wrench,   label: 'Ferreterías',   detail: 'Stock y presupuestos al instante' },
    { icon: Truck,    label: 'Distribuidoras', detail: 'Rutas, clientes y cobranzas' },
    { icon: Wheat,    label: 'Forrajerías',    detail: 'Granel, bolsas y acopios' },
    { icon: Droplets, label: 'Sanitarios',     detail: 'Cuentas corrientes y pedidos' },
    { icon: Wallet,   label: 'Electricidad',   detail: 'Presupuestos y materiales' },
  ]

  const N = rubros.length
  const R = 38 // orbit radius in SVG viewBox units (0–100)

  const positions = rubros.map((_, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / N
    return { x: 50 + R * Math.cos(angle), y: 50 + R * Math.sin(angle) }
  })

  // Pentagram: each vertex connects to vertex+2 (star pattern)
  const starLines = positions.map((from, i) => {
    const to = positions[(i + 2) % N]
    return { x1: from.x, y1: from.y, x2: to.x, y2: to.y }
  })

  const paused = activeIndex !== null

  return (
    <section id="rubros" className="relative overflow-hidden bg-background px-4 py-16 sm:px-6 sm:py-28">
      <style>{`
        @keyframes orbit-spin    { to { transform: rotate(360deg);  } }
        @keyframes counter-spin  { to { transform: translate(-50%, -50%) rotate(-360deg); } }
        .rubros-ring             { animation: orbit-spin   28s linear infinite; transform-origin: center; }
        .rubros-ring.paused      { animation-play-state: paused; }
        .rubros-node-inner       { animation: counter-spin 28s linear infinite; transform: translate(-50%, -50%); transform-origin: 50% 50%; }
        .rubros-ring.paused .rubros-node-inner { animation-play-state: paused; }
      `}</style>

      <div className="pointer-events-none absolute -top-24 left-1/4 h-[480px] w-[700px] rounded-full bg-primary-600/8 blur-[120px]" />

      <div className="section-container">
        <div className="reveal-on-scroll mb-12 text-center sm:mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Pensado para comercios que necesitan ordenarse
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Cada rubro tiene sus reglas. Nosotros las conocemos.
          </p>
        </div>

        {/* Orbital pentagon — all screen sizes */}
        <div className="relative mx-auto aspect-square w-full max-w-[340px] sm:max-w-[520px]">

          {/* Static background: orbit ring + inner glow ring */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={R} fill="none" stroke="oklch(68% 0.14 290)" strokeWidth="0.18" strokeOpacity="0.22" strokeDasharray="1 1.4" />
            <circle cx="50" cy="50" r="11" fill="none" stroke="oklch(68% 0.14 290)" strokeWidth="0.22" strokeOpacity="0.18" />
            <circle cx="50" cy="50" r="11" fill="oklch(68% 0.14 290 / 0.06)" />
          </svg>

          {/* Rotating layer: pentagram lines + nodes */}
          <div className={`rubros-ring absolute inset-0${paused ? ' paused' : ''}`}>

            <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100">
              {starLines.map((l, i) => (
                <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                  stroke="oklch(68% 0.18 290)" strokeWidth="0.3"
                  strokeOpacity={paused ? 0.1 : 0.22}
                  style={{ transition: 'stroke-opacity 0.4s' }}
                />
              ))}
              {positions.map((p, i) => (
                <line key={`sp-${i}`} x1="50" y1="50" x2={p.x} y2={p.y}
                  stroke="oklch(68% 0.18 290)" strokeWidth="0.18"
                  strokeOpacity={paused ? 0.08 : 0.16}
                  strokeDasharray="1.2 0.8"
                  style={{ transition: 'stroke-opacity 0.4s' }}
                />
              ))}
            </svg>

            {/* Orbit nodes */}
            {rubros.map((rubro, i) => (
              <div
                key={rubro.label}
                className="absolute"
                style={{ left: `${positions[i].x}%`, top: `${positions[i].y}%` }}
              >
                <div
                  className="rubros-node-inner"
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <div className={[
                    'flex w-[78px] flex-col items-center gap-1 rounded-xl px-2 py-2 select-none cursor-default',
                    'sm:w-[112px] sm:gap-1.5 sm:rounded-2xl sm:px-3 sm:py-2.5',
                    'ring-1 backdrop-blur-sm transition-all duration-300',
                    activeIndex === i
                      ? 'bg-primary/12 ring-primary/50 shadow-xl shadow-primary/20 scale-110'
                      : 'bg-card/80 ring-border/50',
                  ].join(' ')}>
                    <div className={[
                      'flex h-7 w-7 items-center justify-center rounded-lg sm:h-9 sm:w-9 sm:rounded-xl transition-colors duration-300',
                      activeIndex === i ? 'bg-primary/22' : 'bg-primary/12',
                    ].join(' ')}>
                      <rubro.icon className="h-3.5 w-3.5 sm:h-[18px] sm:w-[18px] text-primary" />
                    </div>
                    <span className="text-[10px] sm:text-[12px] font-semibold leading-tight text-foreground/90 text-center whitespace-nowrap">{rubro.label}</span>
                    {activeIndex === i && (
                      <span className="hidden sm:block text-[10px] leading-snug text-muted-foreground text-center">{rubro.detail}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Center hub — never rotates */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
            <div className="flex flex-col items-center gap-1 rounded-xl sm:rounded-2xl bg-card/90 px-2.5 py-2 sm:px-4 sm:py-3 ring-2 ring-primary/30 shadow-lg shadow-primary/10 backdrop-blur-sm">
              <AnimatedTentacleLogo className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="text-[7px] sm:text-[9px] font-bold tracking-[0.18em] text-primary uppercase">OctopusTrack</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
