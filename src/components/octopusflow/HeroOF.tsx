import { useRef, type CSSProperties, type MouseEvent, type RefObject } from 'react'
import { ArrowRight } from 'lucide-react'

const OCTOPUSFLOW_CHECKOUT_API = '/api/octopusflow-checkout'

const gridLayerStyle: CSSProperties = {
  backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
  backgroundSize: '40px 40px',
}

function InfiniteGridBackdrop({ gridRef }: { gridRef: RefObject<HTMLDivElement> }) {
  const activeGridLayerStyle: CSSProperties = {
    ...gridLayerStyle,
    maskImage: 'radial-gradient(320px circle at var(--grid-mask-x, 50%) var(--grid-mask-y, 35%), black, transparent 72%)',
    WebkitMaskImage: 'radial-gradient(320px circle at var(--grid-mask-x, 50%) var(--grid-mask-y, 35%), black, transparent 72%)',
  }

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

function PurchaseButtonReact({
  source,
  className,
  children,
}: {
  source: string
  className: string
  children: React.ReactNode
}) {
  return (
    <form method="post" action={OCTOPUSFLOW_CHECKOUT_API} className="contents">
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="page" value="octopusflow" />
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  )
}

export default function HeroOF() {
  const gridRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    const target = gridRef.current
    if (!target) return
    const { left, top } = event.currentTarget.getBoundingClientRect()
    target.style.setProperty('--grid-mask-x', `${event.clientX - left}px`)
    target.style.setProperty('--grid-mask-y', `${event.clientY - top}px`)
  }

  const handleMouseLeave = () => {
    const target = gridRef.current
    if (!target) return
    target.style.setProperty('--grid-mask-x', '50%')
    target.style.setProperty('--grid-mask-y', '35%')
  }

  return (
    <section
      id="inicio"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden bg-background px-4 pb-20 pt-24 sm:px-6 sm:pt-32 lg:pb-28"
    >
      <InfiniteGridBackdrop gridRef={gridRef} />

      <div className="relative z-10 mx-auto max-w-5xl animate-fade-in-up text-center">
        <p className="text-sm font-semibold tracking-wide text-primary">
          Para profesionales independientes
        </p>
        <h1 className="mx-auto mt-5 max-w-4xl font-display text-[44px] font-black leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-[82px]">
          Presupuestos que{' '}
          <span className="text-primary">cierran ventas</span>
        </h1>
        <p className="mx-auto mt-8 max-w-3xl text-xl leading-relaxed text-muted-foreground sm:text-2xl">
          Creá, compartí y gestioná presupuestos profesionales desde tu celular. Envialos por WhatsApp al instante.
        </p>
        <p className="mx-auto mt-2 max-w-3xl text-lg leading-relaxed text-muted-foreground/85 sm:text-xl">
          Sin planillas, sin papeles, sin perder clientes.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <PurchaseButtonReact
            source="octopusflow-hero"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 hover:scale-[1.02] hover:bg-primary/90"
          >
            Obtener OctopusFlow
            <ArrowRight className="h-5 w-5" />
          </PurchaseButtonReact>
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-10 w-full max-w-[1180px] sm:mt-14 lg:mt-16">
        <div className="pointer-events-none absolute inset-x-12 -top-8 h-24 rounded-full bg-primary-500/20 blur-[70px]" />
        <img
          src="/assets/dashboard-2.webp"
          alt="Panel de OctopusFlow en escritorio"
          className="relative mx-auto w-full rounded-[28px] shadow-2xl shadow-background/60 ring-1 ring-border/80"
          loading="eager"
        />
      </div>
    </section>
  )
}
