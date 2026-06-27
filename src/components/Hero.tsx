import { useRef, type CSSProperties, type MouseEvent as ReactMouseEvent, type RefObject } from 'react'

const gridLayerStyle: CSSProperties = {
  backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
  backgroundSize: '40px 40px',
}

const activeGridLayerStyle: CSSProperties = {
  ...gridLayerStyle,
  maskImage: 'radial-gradient(320px circle at var(--grid-mask-x, 50%) var(--grid-mask-y, 35%), black, transparent 72%)',
  WebkitMaskImage: 'radial-gradient(320px circle at var(--grid-mask-x, 50%) var(--grid-mask-y, 35%), black, transparent 72%)',
}

function InfiniteGridBackdrop({ gridRef }: { gridRef: RefObject<HTMLDivElement> }) {
  return (
    <div
      ref={gridRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden [--grid-mask-x:50%] [--grid-mask-y:35%]"
    >
      <div className="infinite-grid-drift absolute inset-0 text-primary-700 opacity-[0.08]" style={gridLayerStyle} />
      <div className="infinite-grid-drift absolute inset-0 text-primary-300 opacity-45" style={activeGridLayerStyle} />

      <div className="absolute inset-0">
        <div className="absolute right-[-18%] top-[-20%] h-[42%] w-[42%] rounded-full bg-primary-500/30 blur-[120px]" />
        <div className="absolute right-[8%] top-[-8%] h-[22%] w-[22%] rounded-full bg-primary-700/24 blur-[96px]" />
        <div className="absolute bottom-[-22%] left-[-12%] h-[44%] w-[44%] rounded-full bg-primary-300/24 blur-[130px]" />
      </div>
    </div>
  )
}

export default function Hero() {
  const gridRef = useRef<HTMLDivElement>(null)

  const handleHeroMouseMove = (event: ReactMouseEvent<HTMLElement>) => {
    const target = gridRef.current
    if (!target) return

    const { left, top } = event.currentTarget.getBoundingClientRect()
    target.style.setProperty('--grid-mask-x', `${event.clientX - left}px`)
    target.style.setProperty('--grid-mask-y', `${event.clientY - top}px`)
  }

  const handleHeroMouseLeave = () => {
    const target = gridRef.current
    if (!target) return

    target.style.setProperty('--grid-mask-x', '50%')
    target.style.setProperty('--grid-mask-y', '35%')
  }

  return (
    <section
      id="inicio"
      onMouseMove={handleHeroMouseMove}
      onMouseLeave={handleHeroMouseLeave}
      className="relative overflow-hidden bg-background px-4 pb-20 pt-24 sm:px-6 sm:pt-32 lg:pb-28"
    >
      <InfiniteGridBackdrop gridRef={gridRef} />

      <div className="relative z-10 mx-auto max-w-5xl animate-fade-in-up text-center">
        <p className="text-sm font-semibold tracking-wide text-primary">Ahorrá tiempo, vendé más</p>
        <h1 className="mx-auto mt-5 max-w-4xl font-display text-[44px] font-black leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-[82px]">
          El sistema de gestión para{' '}
          <span className="text-primary">ferreterías, sanitarios y casas de Electricidad</span>
        </h1>
        <p className="mx-auto mt-8 max-w-3xl text-xl leading-relaxed text-muted-foreground sm:text-2xl">
          que necesitan controlar ventas, stock y cuentas corrientes sin complicarse.
        </p>
        <p className="mx-auto mt-2 max-w-3xl text-lg leading-relaxed text-muted-foreground/85 sm:text-xl">
          Acopios, listas de precio personalizadas, Actualización masiva de precios y varias funciones más.
        </p>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground/75 sm:text-xl">
          Simple, rápido y sin complicaciones. En minutos empezás, sin límites escalás.
        </p>
      </div>

      <div className="relative z-10 mx-auto mt-10 w-full max-w-[1180px] sm:mt-14 lg:mt-16">
        <div className="pointer-events-none absolute inset-x-12 -top-8 h-24 rounded-full bg-primary-500/20 blur-[70px]" />
        <img
          src="/assets/dashboard-1200.webp"
          alt="OctopusTrack funcionando en escritorio y celular"
          className="relative mx-auto w-full rounded-[28px] shadow-2xl shadow-background/60 ring-1 ring-border/80"
          loading="eager"
        />
      </div>
    </section>
  )
}
