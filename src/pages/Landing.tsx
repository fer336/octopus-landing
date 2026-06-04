import { useEffect, useMemo, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type HTMLAttributes, type MouseEvent as ReactMouseEvent, type RefObject } from 'react'
import { ArrowRight, CheckCircle2, Menu, X, MessageCircle, Package, Receipt, DollarSign, Wallet, Truck, RefreshCw, FileText, Wrench, Wheat, Warehouse, Droplets, Sun, Moon, Magnet } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Button from '../components/ui/Button'
import AnimatedTentacleLogo from '../components/ui/AnimatedTentacleLogo'
import { TextDisperse } from '../components/ui/text-disperse'

const WHATSAPP_URL = 'https://wa.me/5492254596618'
const ASSET_WEBHOOK_URL = import.meta.env.VITE_LANDING_ASSET_WEBHOOK_URL || '#webhook-no-configured'
const FORM_WEBHOOK_URL = import.meta.env.VITE_FORM_WEBHOOK_URL || ''
const VISITOR_WEBHOOK_URL = import.meta.env.VITE_VISITOR_WEBHOOK_URL || ''
const DEMO_WEBHOOK_URL = import.meta.env.VITE_DEMO_WEBHOOK_URL || ''
const DEMO_SECRET = import.meta.env.VITE_DEMO_SECRET || ''
const FORM_SECRET = import.meta.env.VITE_FORM_SECRET || ''

interface LandingProps {
  loginUrl?: string
}

type ThemeMode = 'light' | 'night'

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light'
  return window.localStorage.getItem('octopustrack-theme') === 'night' ? 'night' : 'light'
}

function scrollToId(id: string, event?: { preventDefault?: () => void }, desktopOffset = 90, mobileOffset = 82) {
  event?.preventDefault?.()
  const element = document.getElementById(id)
  if (!element) return

  const offset = window.innerWidth >= 768 ? desktopOffset : mobileOffset
  const top = element.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' })
}

function useVisitorTracking() {
  useEffect(() => {
    if (!VISITOR_WEBHOOK_URL || VISITOR_WEBHOOK_URL.startsWith('#')) return

    const search = new URLSearchParams(window.location.search)
    const query = new URLSearchParams({
      page_url: window.location.href,
      referrer: document.referrer || '',
      utm_source: search.get('utm_source') || '',
      utm_medium: search.get('utm_medium') || '',
      utm_campaign: search.get('utm_campaign') || '',
      visited_at: new Date().toISOString(),
    })

    fetch(`${VISITOR_WEBHOOK_URL}?${query.toString()}`).catch(() => {})
  }, [])
}

function useScrollReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.registerPlugin(ScrollTrigger)

    const elements = gsap.utils.toArray<HTMLElement>('.reveal-on-scroll')
    if (elements.length === 0) return

    elements.forEach((el) => {
      const rawDelay = el.style.getPropertyValue('--reveal-delay') || getComputedStyle(el).getPropertyValue('--reveal-delay') || '0'
      const delay = parseFloat(rawDelay) / 1000

      gsap.fromTo(
        el,
        { opacity: 0, y: 36, filter: 'blur(6px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.85,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
          },
        },
      )
    })

    return () => ScrollTrigger.getAll().forEach((t) => t.kill())
  }, [])
}

// 3D perspective tilt on hover — wraps any content
function TiltCard({
  children,
  className = '',
  strength = 10,
  tag: Tag = 'div',
  style,
}: {
  children: React.ReactNode
  className?: string
  strength?: number
  tag?: 'div' | 'article'
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const card = ref.current
    if (!card || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0

    function onMove(e: MouseEvent) {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const r = card!.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - 0.5
        const y = (e.clientY - r.top) / r.height - 0.5
        card!.style.transform = `perspective(1000px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) translateZ(6px)`
      })
    }

    function onEnter() {
      card!.style.transition = 'transform 0.08s linear, box-shadow 0.3s ease'
    }

    function onLeave() {
      cancelAnimationFrame(frame)
      card!.style.transition = 'transform 0.55s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s ease'
      card!.style.transform = ''
    }

    card.addEventListener('mousemove', onMove as EventListener)
    card.addEventListener('mouseenter', onEnter)
    card.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(frame)
      card.removeEventListener('mousemove', onMove as EventListener)
      card.removeEventListener('mouseenter', onEnter)
      card.removeEventListener('mouseleave', onLeave)
    }
  }, [strength])

  return (
    <Tag ref={ref as React.RefObject<HTMLDivElement & HTMLElement>} className={className} style={style}>
      {children}
    </Tag>
  )
}



function shouldShowThankYou() {
  const params = new URLSearchParams(window.location.search)
  const purchase = params.get('purchase')
  const status = params.get('status')
  const payment = params.get('payment')
  const mpStatus = params.get('mp_status')
  return purchase === 'success' || status === 'success' || payment === 'success' || mpStatus === 'approved'
}

function buildAssetWebhookUrl(format: 'excel' | 'sheets') {
  if (!ASSET_WEBHOOK_URL || ASSET_WEBHOOK_URL.startsWith('#')) return ASSET_WEBHOOK_URL
  const separator = ASSET_WEBHOOK_URL.includes('?') ? '&' : '?'
  return `${ASSET_WEBHOOK_URL}${separator}format=${format}`
}


// ========================================
// Header — scroll-driven: shows product name when in product section
// ========================================
function Header({ section = 'none', theme, onToggleTheme }: { section?: HeaderSection; theme: ThemeMode; onToggleTheme: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const showProduct = section !== 'none'

  const productLabel = 'OctopusTrack'
  const headerChrome = 'border-border/60 bg-background/75'
  const activeTextColor = 'text-primary'
  const menuChrome = 'border-border/60 bg-background/95'
  const activeButton = 'bg-primary text-primary-foreground shadow-primary/20 hover:bg-primary/90'
  const menuButtonChrome = 'border-border/70 bg-card/70 text-muted-foreground hover:bg-card hover:text-foreground'

  const menuItems = [
    { label: 'OctopusTrack', id: 'caracteristicas', scrollTargetId: 'octopustrack-content', desktopOffset: 126, mobileOffset: 104 },
    { label: 'Contacto', id: 'contacto' },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-2xl transition-colors duration-500 ${headerChrome}`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo + sliding product name */}
        <a href="#inicio" className="flex items-center gap-3">
          <span className="inline-flex shrink-0 overflow-visible" style={{ transition: 'filter 0.6s ease' }}>
            <AnimatedTentacleLogo className="h-[52px] w-[52px]" alt="OctopusTrack" />
          </span>

          {/* Product name — unfurls like a tentacle when the active section changes */}
          <span
            className="header-product-shell overflow-hidden transition-all duration-500 ease-out"
            style={{ maxWidth: showProduct ? '180px' : '0px', opacity: showProduct ? 1 : 0 }}
          >
            <span key={section} className="header-product-label-wrap block whitespace-nowrap">
              <span className={`header-product-label block text-[17px] font-bold leading-tight tracking-tight transition-colors duration-500 ${activeTextColor}`}>
                {productLabel}
              </span>
            </span>
          </span>
        </a>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'night' ? 'Cambiar a modo claro' : 'Cambiar a modo noche'}
            title={theme === 'night' ? 'Modo claro' : 'Modo noche'}
            className={`relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border transition-all duration-500 hover:scale-[1.03] ${menuButtonChrome}`}
          >
            <span className="absolute inset-0 bg-primary/10 opacity-0 transition-opacity duration-300 hover:opacity-100" />
            {theme === 'night' ? <Sun className="relative z-10 h-4 w-4" /> : <Moon className="relative z-10 h-4 w-4" />}
          </button>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`hidden rounded-lg px-3 sm:inline-flex items-center justify-center gap-2 py-1.5 text-sm font-semibold shadow-lg transition-all duration-500 hover:scale-[1.03] ${activeButton}`}
          >
            <MessageCircle className="h-4 w-4" />
            Demo
          </a>
          <button
            type="button"
            aria-label="Abrir menú"
            className={`relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border transition-all duration-500 ${menuButtonChrome}`}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span className={`absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.18),transparent_55%)] transition-opacity duration-300 ${menuOpen ? 'opacity-100' : 'opacity-0'}`} />
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden border-t transition-all duration-500 ease-out ${menuChrome} ${
          menuOpen ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="relative mx-auto flex w-full max-w-7xl flex-col gap-2 overflow-hidden px-4 py-4 sm:px-6 sm:py-5">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:28px_28px] opacity-40" />
              <div className="pointer-events-none absolute right-6 top-0 h-28 w-28 rounded-full bg-primary-500/18 blur-3xl" />
          {menuItems.map((item, index) => (
            <a
              key={item.label}
              href={`#${item.scrollTargetId ?? item.id}`}
              onClick={(event) => {
                setMenuOpen(false)
                scrollToId(item.scrollTargetId ?? item.id, event, item.desktopOffset ?? 94, item.mobileOffset ?? 86)
              }}
              className={`group relative flex translate-y-0 items-center justify-between overflow-hidden rounded-xl border border-border/70 bg-card/70 px-4 py-3 text-sm font-medium text-muted-foreground shadow-lg shadow-background/30 transition-all duration-500 hover:-translate-y-0.5 hover:border-border hover:bg-card hover:text-foreground ${menuOpen ? 'opacity-100' : 'opacity-0'}`}
              style={{ transitionDelay: menuOpen ? `${index * 45}ms` : '0ms' }}
            >
              <span className="relative z-10 flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary transition-transform duration-300 group-hover:scale-150" />
                {item.label}
              </span>
              <span className="relative z-10 text-xs font-mono text-muted-foreground/60 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-muted-foreground">0{index + 1}</span>
              <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-primary/70 transition-transform duration-500 group-hover:scale-x-100" />
            </a>
          ))}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`relative mt-2 flex items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-3 text-center text-sm font-semibold shadow-lg transition-all duration-500 hover:-translate-y-0.5 ${activeButton}`}
          >
            <MessageCircle className="h-4 w-4" />
            Demo
          </a>
        </nav>
      </div>
    </header>
  )
}

// ========================================
// Hero
// ========================================
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

function Hero() {
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
          El sistema que{' '}
          <span className="text-primary">tu comercio necesita</span>
        </h1>
        <p className="mx-auto mt-8 max-w-3xl text-xl leading-relaxed text-muted-foreground sm:text-2xl">
          Gestioná stock, ventas, clientes y facturación electrónica ARCA en un solo lugar.
        </p>
        <p className="mx-auto mt-2 max-w-3xl text-lg leading-relaxed text-muted-foreground/85 sm:text-xl">
          Acopios, Listas de precio personalizadas, Cuentas corrientes.
        </p>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground/75 sm:text-xl">
          Simple, rápido y sin complicaciones. En minutos empezás, sin límites escalás.
        </p>
      </div>

      <div className="relative z-10 mx-auto mt-12 max-w-[1480px] sm:mt-16 lg:mt-20">
        <div className="pointer-events-none absolute inset-x-12 -top-8 h-24 rounded-full bg-primary-500/20 blur-[70px]" />
        <img
          src="/assets/dashboard.png"
          alt="OctopusTrack funcionando en escritorio y celular"
          className="relative mx-auto w-full rounded-[28px] shadow-2xl shadow-background/60 ring-1 ring-border/80"
          loading="eager"
        />
      </div>
    </section>
  )
}

// ========================================
// OctopusTrack Showcase — restored zig-zag image narrative
// ========================================
function OctopusTrackShowcase() {
  const features = [
    {
      image: '/assets/ventas-cajas.png',
      description: 'Centralizá todo tu proceso de ventas en una única pantalla, diseñada para operar rápido, sin errores y sin cambiar de entorno.',
      lines: [
        'Cotizaciones, remitos, facturación y retiros de cuentas corrientes en un solo lugar.',
        'Carga ágil de productos con atajos pensados para mostrador.',
        'Comprobantes profesionales con datos del cliente y detalle completo.',
        'Seguimiento claro entre presupuestos, remitos y facturas.',
      ],
    },
    {
      image: '/assets/catalogo-inventario.png',
      description: 'Control total de productos, precios y stock sin depender de planillas sueltas.',
      lines: [
        'Carga manual o importación desde Excel.',
        'Actualización masiva de precios por categorías y listas.',
        'Inventario más claro para controlar stock físico y reposición.',
        'Optimización de compras con costos reales.',
      ],
    },
    {
      image: '/assets/lista_de_precios.webp',
      description: 'Listas de precios por cliente para cuentas corrientes, acopios y acuerdos comerciales.',
      lines: [
        'Precios especiales por cliente, obra o convenio.',
        'Márgenes ajustados sin modificar el precio base del producto.',
        'Aplicación automática en ventas, presupuestos y pedidos.',
        'Control de vigencia para mantener listas actualizadas.',
      ],
    },
    {
      image: '/assets/Contacto-categorias.png',
      description: 'Ordená clientes, proveedores, autorizados y categorías para que cada operación salga más rápido.',
      lines: [
        'Clientes con terceros autorizados para retirar o comprar.',
        'Categorías para organizar el catálogo sin mezclar productos.',
        'Proveedores centralizados para compras y reposición.',
        'Datos comerciales listos para vender mejor.',
      ],
    },
    {
      image: '/assets/reportes.png',
      description: 'Tomá decisiones con información clara, actualizada y fácil de compartir.',
      lines: [
        'Ventas por período con resúmenes y comparativas.',
        'Productos más vendidos para saber qué mueve el negocio.',
        'Estado de stock y alertas de productos bajos.',
        'Cuentas corrientes con saldos y antigüedad.',
      ],
    },
  ]

  return (
    <section id="caracteristicas" className="relative overflow-hidden bg-background px-4 py-20 sm:px-6 sm:py-28">
      <div className="pointer-events-none absolute left-[-18%] top-[8%] h-[520px] w-[520px] rounded-full bg-primary-300/18 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[18%] right-[-12%] h-[620px] w-[620px] rounded-full bg-primary-700/10 blur-[130px]" />

      <div className="relative mx-auto w-full max-w-6xl">
        <div id="octopustrack-content" className="reveal-on-scroll scroll-mt-24 text-center">
          <p className="mx-auto mb-5 max-w-2xl text-base font-medium text-primary/80 sm:text-lg">
            Cuando tu comercio crece, necesitás orden real: ventas, stock, clientes, precios y reportes trabajando juntos.
          </p>
          <h2 className="mx-auto max-w-3xl font-display text-3xl font-black leading-[1.05] text-foreground sm:text-4xl lg:text-5xl">
            Sistema completo para{' '}
            <span className="text-primary">hacer crecer tu negocio</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Una solución diseñada para comercios que quieren escalar ventas sin perder control operativo.
          </p>
        </div>

        <div className="mt-14 space-y-20 sm:mt-16 sm:space-y-24">
          {features.map((feature, index) => (
            <article
              id={feature.image.includes('reportes') ? 'octopustrack-reportes' : undefined}
              key={feature.image}
              style={{ ['--reveal-delay' as string]: `${index * 90}ms` }}
              className={`reveal-on-scroll mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-14 ${
                index % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
              }`}
            >
              <TiltCard strength={7} className="relative overflow-hidden rounded-3xl border border-border bg-card/75 p-1 shadow-2xl shadow-primary-950/10 backdrop-blur-sm dark:shadow-black/35">
                <img
                  src={feature.image}
                  alt="Pantalla de OctopusTrack"
                  className="relative h-auto w-full rounded-2xl"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              </TiltCard>

              <div className="flex flex-col justify-center">
                <p className="text-xl font-semibold leading-relaxed text-foreground/85">{feature.description}</p>

                <ul className="mt-6 space-y-3">
                  {feature.lines.map((line) => (
                    <li key={line} className="flex items-start gap-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  )
}

// ========================================
// PainPoints — dolores conocidos del comercio
// ========================================
function PainPointCard({ pain }: { pain: { icon: typeof DollarSign; title: string; description: string } }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const burstTimeoutRef = useRef<number | null>(null)
  const [hasOrdered, setHasOrdered] = useState(false)
  const [isBursting, setIsBursting] = useState(false)
  const [burstParticles] = useState<MagnetParticle[]>(() => createMagnetParticles(14, 42))

  const orderAndBurst = () => {
    if (hasOrdered) return
    setHasOrdered(true)
    setIsBursting(true)
    if (burstTimeoutRef.current) window.clearTimeout(burstTimeoutRef.current)
    burstTimeoutRef.current = window.setTimeout(() => setIsBursting(false), 720)
  }

  useEffect(() => {
    return () => {
      if (burstTimeoutRef.current) window.clearTimeout(burstTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    const card = cardRef.current
    if (!card || hasOrdered) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) orderAndBurst()
      },
      { rootMargin: '-12% 0px -18% 0px', threshold: 0.45 },
    )

    observer.observe(card)
    return () => observer.disconnect()
  }, [hasOrdered])

  return (
    <div ref={cardRef} className="h-full">
      <MagnetizeCard
        className="group flex h-full min-h-[230px] flex-col rounded-2xl bg-card/70 p-6 ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:bg-card hover:shadow-2xl hover:shadow-primary/10"
        particleCount={10}
        attractRadius={28}
        onMouseEnter={orderAndBurst}
        onTouchStart={orderAndBurst}
      >
        <span className="pointer-events-none absolute left-1/2 top-1/2 -z-10 block h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30 opacity-0 blur-2xl transition-opacity duration-500" style={{ opacity: isBursting ? 0.85 : 0 }} />
        {burstParticles.map((particle) => (
          <span
            key={particle.id}
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-1.5 w-1.5 rounded-full bg-primary-300 shadow-[0_0_16px_rgb(var(--primary-300)/0.7)] transition-[opacity,transform] duration-700 ease-out"
            style={{
              opacity: isBursting ? 0.9 : 0,
              transform: isBursting
                ? `translate3d(calc(-50% + ${particle.x}px), calc(-50% + ${particle.y}px), 0) scale(1)`
                : 'translate3d(-50%, -50%, 0) scale(0.25)',
            }}
          />
        ))}
        <pain.icon className="mb-4 h-6 w-6 shrink-0 text-primary" />
        <h3 className="text-lg font-medium leading-relaxed text-foreground transition-transform duration-300 group-hover:translate-x-0.5">
          <TextDisperse className="gap-x-1" dispersed={!hasOrdered}>{pain.title}</TextDisperse>
        </h3>
        <p className="mt-auto pt-4 text-sm leading-relaxed text-muted-foreground">{pain.description}</p>
      </MagnetizeCard>
    </div>
  )
}

function PainPoints() {
  const pains = [
    {
      icon: DollarSign,
      title: 'No sabés rápido quién te debe',
      description: 'Las cuentas corrientes se mezclan y perdés el control de los pagos.',
    },
    {
      icon: Package,
      title: 'El stock no siempre coincide',
      description: 'Lo que decís que tenés no es lo que hay en el depósito.',
    },
    {
      icon: RefreshCw,
      title: 'Los precios cambian y después no hay vuelta atrás',
      description: 'Necesitás manejar listas distintas sin romper cuentas corrientes ni operaciones viejas.',
    },
    {
      icon: FileText,
      title: 'Cada cliente puede tener una lista distinta',
      description: 'Mayorista, minorista, obra o convenio: si todo vive en una sola planilla, se mezcla.',
    },
    {
      icon: Receipt,
      title: 'Hacer facturas desde la página de ARCA te demora tiempo',
      description: 'Entrar, cargar datos y volver al sistema te corta el ritmo de venta.',
    },
    {
      icon: Package,
      title: 'Los acopios quedan atados a mensajes sueltos',
      description: 'Acopiás por obra o edificio, pero después cuesta remitir con el precio congelado.',
    },
    {
      icon: FileText,
      title: 'Los presupuestos quedan perdidos entre mensajes',
      description: 'Se te pierden los presupuestos en WhatsApp o mail y no les das seguimiento.',
    },
    {
      icon: Wallet,
      title: 'La cuenta corriente la llevás en cuaderno',
      description: 'Saber saldos, vencimientos y deudas es una tarea manual que atrasa.',
    },
  ]

  return (
    <section id="dolores" className="relative overflow-hidden bg-background px-4 py-20 sm:px-6 sm:py-28">
      <div className="section-container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Lo que ves acá, <span className="text-primary">lo ven tus clientes todos los días</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Facturás a mano, buscás los productos en carpetas y rehacés cada presupuesto desde cero. Ese desorden se nota. Con un solo cambio, lo ordenamos.
          </p>
        </div>
        <div className="mx-auto mt-14 grid max-w-6xl auto-rows-fr items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pains.map((pain) => (
            <PainPointCard key={pain.title} pain={pain} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ========================================
// Social Proof — Rubros
// ========================================
function SocialProof() {
  const rubros = [
    { icon: Wrench, label: 'Ferreterías' },
    { icon: Warehouse, label: 'Corralones' },
    { icon: Truck, label: 'Distribuidoras' },
    { icon: Wheat, label: 'Forrajerías' },
    { icon: Droplets, label: 'Sanitarios' },
    { icon: Package, label: 'Mayoristas' },
    { icon: Wallet, label: 'Electricidad' },
  ]

  return (
    <section id="rubros" className="relative overflow-hidden bg-background px-4 py-16 sm:px-6 sm:py-28">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-20 left-[20%] h-[400px] w-[600px] rounded-full bg-primary-600/10 blur-[100px]" />

      <div className="section-container">
        <div className="reveal-on-scroll text-center">
          <h2 className="bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            Pensado para comercios que necesitan ordenarse
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Cada rubro tiene sus reglas. Nosotros las conocemos.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {rubros.map((rubro, index) => (
            <MagnetizeCard
              key={rubro.label}
              className="reveal-on-scroll flex min-h-[72px] items-center gap-2.5 rounded-xl bg-card/70 px-3 py-3 ring-1 ring-border transition-all duration-300 hover:bg-card sm:min-h-[88px] sm:gap-3 sm:rounded-2xl sm:p-5"
              style={{ '--reveal-delay': index * 100 } as React.CSSProperties}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 sm:h-10 sm:w-10 sm:rounded-xl">
                <rubro.icon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
              </div>
              <span className="text-[13px] font-medium leading-tight text-foreground/85 sm:text-sm">{rubro.label}</span>
            </MagnetizeCard>
          ))}
        </div>

      </div>
    </section>
  )
}

interface MagnetParticle {
  id: number
  x: number
  y: number
}

interface MagnetizeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  particleCount?: number
  attractRadius?: number
}

interface MagnetizeCardProps extends HTMLAttributes<HTMLDivElement> {
  particleCount?: number
  attractRadius?: number
}

function createMagnetParticles(particleCount: number, attractRadius: number): MagnetParticle[] {
  return Array.from({ length: particleCount }, (_, id) => {
    const angle = (Math.PI * 2 * id) / particleCount
    const distance = attractRadius + Math.random() * attractRadius

    return {
      id,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    }
  })
}

function MagnetizeButton({
  children,
  className = '',
  particleCount = 12,
  attractRadius = 34,
  onMouseEnter,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  ...props
}: MagnetizeButtonProps) {
  const [isAttracting, setIsAttracting] = useState(false)
  const [particles, setParticles] = useState<MagnetParticle[]>(() =>
    createMagnetParticles(particleCount, attractRadius),
  )

  useEffect(() => {
    setParticles(createMagnetParticles(particleCount, attractRadius))
  }, [particleCount, attractRadius])

  return (
    <button
      className={`group relative isolate touch-none overflow-visible ${className}`}
      onMouseEnter={(event) => {
        setIsAttracting(true)
        onMouseEnter?.(event)
      }}
      onMouseLeave={(event) => {
        setIsAttracting(false)
        onMouseLeave?.(event)
      }}
      onTouchStart={(event) => {
        setIsAttracting(true)
        onTouchStart?.(event)
      }}
      onTouchEnd={(event) => {
        setIsAttracting(false)
        onTouchEnd?.(event)
      }}
      {...props}
    >
      <span className="pointer-events-none absolute left-1/2 top-1/2 -z-10 block h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-[inherit] bg-primary/35 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-70" />
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-1.5 w-1.5 rounded-full bg-primary-200 shadow-[0_0_16px_rgb(var(--primary-200)/0.7)] transition-[opacity,transform] duration-500 ease-out"
          style={{
            opacity: isAttracting ? 0.95 : 0.35,
            transform: isAttracting
              ? 'translate3d(-50%, -50%, 0) scale(1.2)'
              : `translate3d(calc(-50% + ${particle.x}px), calc(-50% + ${particle.y}px), 0) scale(0.85)`,
          }}
        />
      ))}
      <span className="relative flex w-full items-center justify-center gap-2">
        <Magnet className={`h-4 w-4 transition-transform duration-300 ${isAttracting ? 'scale-110 rotate-6' : ''}`} />
        {children}
      </span>
    </button>
  )
}

function MagnetizeCard({
  children,
  className = '',
  particleCount = 8,
  attractRadius = 24,
  onMouseEnter,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  ...props
}: MagnetizeCardProps) {
  const [isAttracting, setIsAttracting] = useState(false)
  const [particles, setParticles] = useState<MagnetParticle[]>(() =>
    createMagnetParticles(particleCount, attractRadius),
  )

  useEffect(() => {
    setParticles(createMagnetParticles(particleCount, attractRadius))
  }, [particleCount, attractRadius])

  return (
    <div
      className={`group relative isolate overflow-visible ${className}`}
      onMouseEnter={(event) => {
        setIsAttracting(true)
        onMouseEnter?.(event)
      }}
      onMouseLeave={(event) => {
        setIsAttracting(false)
        onMouseLeave?.(event)
      }}
      onTouchStart={(event) => {
        setIsAttracting(true)
        onTouchStart?.(event)
      }}
      onTouchEnd={(event) => {
        setIsAttracting(false)
        onTouchEnd?.(event)
      }}
      {...props}
    >
      <span className="pointer-events-none absolute left-1/2 top-1/2 -z-10 block h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-70" />
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-1 w-1 rounded-full bg-primary-300 shadow-[0_0_12px_rgb(var(--primary-300)/0.65)] transition-[opacity,transform] duration-500 ease-out"
          style={{
            opacity: isAttracting ? 0.9 : 0.25,
            transform: isAttracting
              ? 'translate3d(-50%, -50%, 0) scale(1.25)'
              : `translate3d(calc(-50% + ${particle.x}px), calc(-50% + ${particle.y}px), 0) scale(0.85)`,
          }}
        />
      ))}
      {children}
    </div>
  )
}

// ========================================
// Start Section — split CTA without public pricing
// ========================================
function StartInMinutesSection({ openDemoModal }: { openDemoModal?: (product: 'octopustrack') => void }) {
  return (
    <section id="precios" className="relative overflow-hidden bg-background px-4 py-20 sm:px-6 sm:py-28">
      <div className="section-container">
        <div className="reveal-on-scroll overflow-hidden rounded-[28px] border border-primary/20 bg-card shadow-2xl shadow-primary/10 md:grid md:grid-cols-[0.92fr_1.08fr]">
          <div className="relative overflow-hidden bg-primary px-6 py-10 text-primary-foreground sm:px-10 sm:py-14 lg:px-12 lg:py-16">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-foreground/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-8 h-56 w-56 rounded-full bg-background/20 blur-3xl" />
            <div className="relative">
              <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-primary-foreground/70">
                Demo guiada
              </p>
              <h2 className="mt-5 max-w-xl font-display text-4xl font-black leading-[0.98] tracking-tight sm:text-5xl lg:text-6xl">
                Empezá en minutos. Sin complicaciones.
              </h2>
            </div>
          </div>

          <div className="bg-card px-6 py-10 sm:px-10 sm:py-14 lg:px-12 lg:py-16">
            <p className="max-w-xl text-lg leading-relaxed text-foreground sm:text-xl">
              Te mostramos cómo ordenar stock, ventas, listas de precio, cuentas corrientes y facturación sin cambiar la forma en que trabaja tu comercio.
            </p>

            <div className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              {['Sin tarjeta', 'Sin contratos largos', 'Acompañamiento real', 'Configurado para tu rubro'].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <MagnetizeButton
                type="button"
                onClick={() => openDemoModal?.('octopustrack')}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:scale-[1.02] hover:bg-primary/90 sm:min-w-[210px]"
              >
                Probar demo
              </MagnetizeButton>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background/40 px-6 py-3.5 text-sm font-medium text-foreground transition-all duration-200 hover:bg-background"
              >
                Hablar por WhatsApp
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ========================================
// Contact Form — captures lead, price sent privately
// ========================================
function ContactForm() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')

  const isValid = /\S+@\S+\.\S+/.test(email.trim()) && message.trim().length > 2

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || status === 'loading') return
    setStatus('loading')
    try {
      const params = new URLSearchParams(window.location.search)
      await fetch(FORM_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _secret: FORM_SECRET,
          email: email.trim(),
          message: message.trim(),
          source: 'landing-contact-form',
          action: 'contact',
          entry_point: 'contact-form-bottom',
          page_url: window.location.href,
          referrer: document.referrer || undefined,
          user_agent: navigator.userAgent,
          utm_source: params.get('utm_source') || undefined,
          utm_medium: params.get('utm_medium') || undefined,
          utm_campaign: params.get('utm_campaign') || undefined,
          created_at: new Date().toISOString(),
        }),
      })
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contacto" className="relative overflow-hidden bg-background px-4 py-20 sm:px-6 sm:py-28">
      <div className="section-container">
        <div className="mx-auto w-full max-w-xl">
          {status === 'sent' ? (
            <div className="text-center">
              {/* Animated checkmark SVG (Task 4.4) */}
              <svg className="mx-auto mb-6 h-14 w-14 text-primary" viewBox="0 0 52 52" fill="none" aria-hidden="true">
                  <circle
                    className="checkmark-circle"
                    cx="26"
                    cy="26"
                    r="24"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="checkmark-path"
                    d="M14 27l7 7 16-16"
                    stroke="currentColor"
                    strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Listo, te contactamos.</h2>
              <p className="mx-auto mt-4 max-w-sm text-base text-muted-foreground">
                Revisá tu correo. Te respondemos con el plan que mejor se adapta a tu negocio.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-12 text-center">
                <h2 className="bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
                  ¿Querés saber más? Escribinos.
                </h2>
                <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
                  Dejanos tu correo y contanos qué necesita tu negocio. Te respondemos a la brevedad.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="cf-email" className="mb-2 block text-sm font-medium text-muted-foreground">
                    Correo electrónico
                  </label>
                  <input
                    id="cf-email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-border bg-card/70 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-300 focus:border-ring focus:bg-card focus:outline-none focus:ring-1 focus:ring-ring/40"
                  />
                </div>

                <div>
                  <label htmlFor="cf-message" className="mb-2 block text-sm font-medium text-muted-foreground">
                    ¿Qué necesita tu negocio?
                  </label>
                  <textarea
                    id="cf-message"
                    name="message"
                    rows={4}
                    placeholder="Ej: tengo una ferretería, cotizo todos los días y quiero manejar el stock y las cuentas corrientes..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="w-full resize-none rounded-xl border border-border bg-card/70 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-300 focus:border-ring focus:bg-card focus:outline-none focus:ring-1 focus:ring-ring/40"
                  />
                </div>

                {status === 'error' && (
                  <p key={Date.now()} className="animate-shake text-sm text-destructive">
                    Algo salió mal. Intentá de nuevo o escribinos por{' '}
                    <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="underline">WhatsApp</a>.
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className={`w-full gap-2 ${isValid && status === 'idle' ? 'animate-pulse-subtle' : ''}`}
                  isLoading={status === 'loading'}
                  disabled={!isValid}
                >
                  Enviar consulta
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  O escribinos directo por{' '}
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-primary transition-colors hover:text-primary/80">
                    WhatsApp
                  </a>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

// ========================================
// Footer
// ========================================
function Footer() {
  return (
    <footer id="contacto" className="border-t border-border bg-background px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-6">
        <nav aria-label="Enlaces legales" className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <a
            href="/politicas-privacidad.html"
            className="text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Política de privacidad
          </a>
          <span className="text-muted-foreground/40" aria-hidden="true">
            •
          </span>
          <a
            href="/politicas-seguridad.html"
            className="text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Política de seguridad
          </a>
        </nav>
        <p className="text-xs text-muted-foreground">
          Contacto:{' '}
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-primary transition-colors hover:text-primary/80">
            WhatsApp
          </a>
        </p>
      </div>
    </footer>
  )
}

// ========================================
// Floating Contact Button
// ========================================
function FloatingContactButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Comunicate con nosotros por WhatsApp"
      className="fixed bottom-6 right-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-500 hover:scale-105 hover:bg-primary/90"
    >
        <MessageCircle className="h-5 w-5" />
    </a>
  )
}

// ========================================
// ThankYouPage — Premium after purchase
// ========================================
function ThankYouPage({ theme }: { theme: ThemeMode }) {
  return (
    <div className={`${theme === 'night' ? 'dark ' : ''}min-h-screen bg-background text-foreground`}>
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-12 sm:px-6">
        <section className="w-full rounded-3xl bg-card/80 p-8 text-center shadow-2xl ring-1 ring-border">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm font-semibold tracking-widest text-primary uppercase">Pago confirmado</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Tu cotizador ya está listo</h1>
          <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
            Acá tenés acceso inmediato al archivo Excel y Google Sheets. Descargalo y empezá a usar tu nuevo cotizador.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <a href={buildAssetWebhookUrl('excel')} target="_blank" rel="noopener noreferrer">
              <Button className="w-full gap-2 py-3">
                Descargar Excel
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <a href={buildAssetWebhookUrl('sheets')} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full gap-2 py-3">
                Obtener Google Sheets
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </div>

          <div className="mt-10 rounded-xl bg-muted/40 p-4">
            <p className="text-sm text-muted-foreground">
              ¿Necesitás ayuda?{' '}
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
                Escribinos por WhatsApp
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

// ========================================
// Main Landing Component
// ========================================
type HeaderSection = 'none' | 'track'

function useHeaderSection(): HeaderSection {
  const [section, setSection] = useState<HeaderSection>('none')

  useEffect(() => {
    const trackSection = document.getElementById('caracteristicas')
    const reportesMarker = document.getElementById('octopustrack-reportes')

    if (!trackSection || !reportesMarker) return

    let frame = 0

    const resolve = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const activationLine = Math.min(window.innerHeight * 0.28, 190)
        const sectionRect = trackSection.getBoundingClientRect()
        const reportesRect = reportesMarker.getBoundingClientRect()
        const isBeforeReportes = reportesRect.top > activationLine
        const isInsideTrackIntro = sectionRect.top <= activationLine && sectionRect.bottom >= activationLine

        setSection(isInsideTrackIntro && isBeforeReportes ? 'track' : 'none')
      })
    }

    resolve()
    window.addEventListener('scroll', resolve, { passive: true })
    window.addEventListener('resize', resolve)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', resolve)
      window.removeEventListener('resize', resolve)
    }
  }, [])

  return section
}

// Clip-path reveal for device frames — GSAP ScrollTrigger from inset(100%) to inset(0)
function useDeviceFrameReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.registerPlugin(ScrollTrigger)

    const frames = gsap.utils.toArray<HTMLElement>('.device-frame-reveal')
    if (!frames.length) return

    frames.forEach((el, i) => {
      gsap.fromTo(
        el,
        { clipPath: 'inset(0 0 100% 0)' },
        {
          clipPath: 'inset(0 0 0% 0)',
          duration: 1.2,
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
            id: `device-reveal-${i}`,
          },
        },
      )
    })

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.vars.id?.startsWith('device-reveal-')) t.kill()
      })
    }
  }, [])
}

// Stagger entrance for feature list items — GSAP with per-item delay
function useStaggerEntrance() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.registerPlugin(ScrollTrigger)

    const lists = gsap.utils.toArray<HTMLElement>('.stagger-list')
    if (!lists.length) return

    lists.forEach((list, i) => {
      const items = list.querySelectorAll<HTMLElement>('.stagger-item')
      if (!items.length) return

      const stagger = items.length >= 10 ? 0.04 : 0.06

      gsap.fromTo(
        items,
        { opacity: 0, y: 20, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: list,
            start: 'top 85%',
            once: true,
            id: `stagger-list-${i}`,
          },
        },
      )
    })

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.vars.id?.startsWith('stagger-list-')) t.kill()
      })
    }
  }, [])
}

// ========================================
// Hero Canvas Particle Background (Task 4.1)
// ========================================

// ========================================
// Section Divider (Task 4.3)
// ========================================
function SectionDivider({ from, to }: { from: string; to: string }) {
  return (
    <div
      className="section-divider"
      style={{ background: `linear-gradient(to bottom, ${from}, ${to})` }}
      aria-hidden="true"
    />
  )
}

// ========================================
// Scroll Progress Bar — thin line at top of viewport
// ========================================
function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.registerPlugin(ScrollTrigger)

    gsap.to(bar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0,
        id: 'scroll-progress-bar',
      },
    })

    return () => ScrollTrigger.getById('scroll-progress-bar')?.kill()
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] h-[2px]" aria-hidden="true">
      <div
        ref={barRef}
        className="h-full origin-left scale-x-0 bg-primary-400"
        style={{ willChange: 'transform' }}
      />
    </div>
  )
}

// ========================================
// Marquee Ticker — horizontal infinite scroll strip
// ========================================
function MarqueeTicker({
  items,
  duration = 38,
  reversed = false,
}: {
  items: string[]
  duration?: number
  reversed?: boolean
}) {
  const doubled = [...items, ...items]

  return (
    <div
      className="overflow-hidden border-y border-border bg-background py-3"
      aria-hidden="true"
    >
      <div
        className={reversed ? 'animate-marquee-rtl' : 'animate-marquee-ltr'}
        style={
          {
            '--marquee-duration': `${duration}s`,
            display: 'flex',
            gap: 0,
          } as React.CSSProperties
        }
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="flex shrink-0 items-center gap-5 px-5 text-[11px] font-bold tracking-[0.22em] uppercase text-muted-foreground/35"
          >
            {item}
            <span className="h-1 w-1 shrink-0 rounded-full bg-primary-500/30" />
          </span>
        ))}
      </div>
    </div>
  )
}

// ========================================
// Big Text Banner — horizontal parallax text strip
// ========================================
function BigTextBanner() {
  const items = [
    'Stock',
    'Ventas',
    'Facturación',
    'Clientes',
    'Listas de precio',
    'Acopios',
    'Remitos',
    'Cuentas corrientes',
  ]
  const text = items.join(' · ')

  return (
    <div className="overflow-hidden bg-background py-12 sm:py-16" aria-hidden="true">
      <div
        className="animate-marquee-big flex items-center whitespace-nowrap will-change-transform"
        style={{ '--marquee-duration': '34s' } as React.CSSProperties}
      >
        {[text, text].map((chunk, index) => (
          <span
            key={index}
            className="shrink-0 px-8 font-bold text-foreground/5 select-none"
            style={{ fontSize: 'clamp(56px, 8.5vw, 120px)', lineHeight: 1 }}
          >
            {chunk} ·
          </span>
        ))}
      </div>
    </div>
  )
}

function LandingContent({ theme, onToggleTheme }: { theme: ThemeMode; onToggleTheme: () => void }) {
  useScrollReveal()
  useVisitorTracking()
  useDeviceFrameReveal()
  useStaggerEntrance()
  const headerSection = useHeaderSection()

  const [demoModal, setDemoModal] = useState<{
    open: boolean
    email: string
    loading: boolean
    sent: boolean
  }>({
    open: false,
    email: '',
    loading: false,
    sent: false,
  })

  const openDemoModal = () => {
    setDemoModal({ open: true, email: '', loading: false, sent: false })
  }

  const closeDemoModal = () => {
    setDemoModal(prev => ({ ...prev, open: false }))
  }

  const submitDemo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!demoModal.email.trim()) return
    setDemoModal(prev => ({ ...prev, loading: true }))

    const search = new URLSearchParams(window.location.search)

    try {
      await fetch(DEMO_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _secret: DEMO_SECRET,
          email: demoModal.email.trim(),
          demo_type: 'octopustrack',
          source: 'landing',
          page_url: window.location.href,
          referrer: document.referrer || '',
          user_agent: navigator.userAgent,
          utm_source: search.get('utm_source') || '',
          utm_medium: search.get('utm_medium') || '',
          utm_campaign: search.get('utm_campaign') || '',
          created_at: new Date().toISOString(),
        }),
      })
    } catch {
      // Silently — el usuario ve success igual
    }

    setDemoModal(prev => ({ ...prev, loading: false, sent: true }))
  }

  const industriasTicker = [
    'Ferreterías', 'Corralones', 'Distribuidoras', 'Forrajerías',
    'Sanitarios', 'Mayoristas', 'Electricidad',
  ]

  return (
    <>
      <ScrollProgressBar />
      <Header section={headerSection} theme={theme} onToggleTheme={onToggleTheme} />
      <FloatingContactButton />
      <main>
        <Hero />
        <SectionDivider from="transparent" to="rgb(var(--background))" />
        <PainPoints />
        <MarqueeTicker items={industriasTicker} duration={42} />
        <SectionDivider from="transparent" to="rgb(var(--background))" />
        <OctopusTrackShowcase />
        <BigTextBanner />
        <MarqueeTicker
          items={['Stock', 'Ventas', 'Facturación ARCA', 'Cuentas corrientes', 'Listas de precio', 'Acopios', 'Órdenes de compra']}
          duration={28}
          reversed
        />
        <SectionDivider from="rgb(var(--background))" to="rgb(var(--background))" />
        <SocialProof />
        <SectionDivider from="transparent" to="rgb(var(--background))" />
        <StartInMinutesSection openDemoModal={openDemoModal} />
        <ContactForm />
      </main>
      <Footer />

      {/* Modal de solicitud de demo */}
      {demoModal.open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={closeDemoModal}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-card p-8 shadow-2xl ring-1 ring-border"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={closeDemoModal}
              className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            {demoModal.sent ? (
              <>
                <div className="mb-2 text-xs font-semibold tracking-widest text-primary uppercase">
                  Solicitud enviada
                </div>
                <h3 className="mb-1 text-2xl font-bold text-foreground">
                  ¡Te vamos a dar acceso pronto!
                </h3>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  Revisá tu correo <strong className="text-foreground">{demoModal.email}</strong> en los próximos minutos.
                  Cuando activemos tu demo, te va a llegar un mail con el link para ingresar a{' '}
                  <strong className="text-foreground">OctopusTrack</strong>.
                </p>
                <button
                  onClick={closeDemoModal}
                  className="mt-6 w-full rounded-lg border border-border bg-muted px-6 py-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground"
                >
                  Entendido
                </button>
              </>
            ) : (
              <>
                <div className="mb-2 text-xs font-semibold tracking-widest text-primary uppercase">
                  Prueba 7 días
                </div>
                <h3 className="mb-1 text-2xl font-bold text-foreground">
                  OctopusTrack
                </h3>
                <p className="mb-6 text-sm text-muted-foreground">
                  Dejanos tu correo y te avisamos cuando tengas el demo listo.
                </p>

                <form onSubmit={submitDemo} className="space-y-4">
                  <input
                    type="email"
                    required
                    placeholder="tu@correo.com"
                    value={demoModal.email}
                    onChange={e => setDemoModal(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-ring focus:bg-card"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={demoModal.loading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-muted px-6 py-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground disabled:opacity-50"
                  >
                    {demoModal.loading ? 'Enviando…' : 'Solicitar demo'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default function Landing({ loginUrl: _loginUrl }: LandingProps) {
  const isThankYou = useMemo(() => shouldShowThankYou(), [])
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme())

  useEffect(() => {
    window.localStorage.setItem('octopustrack-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((current) => current === 'night' ? 'light' : 'night')
  }

  if (isThankYou) return <ThankYouPage theme={theme} />

  return (
    <div className={`${theme === 'night' ? 'dark ' : ''}min-h-screen bg-background text-foreground`}>
      <LandingContent theme={theme} onToggleTheme={toggleTheme} />
    </div>
  )
}
