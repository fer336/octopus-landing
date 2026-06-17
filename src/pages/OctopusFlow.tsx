import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Menu, X, MessageCircle, Zap, Share2, Users, BarChart3, Sun, Moon, FileText, Timer, Search, TrendingUp } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const WHATSAPP_URL = 'https://wa.me/5492254596618'
const VISITOR_WEBHOOK_URL = import.meta.env.VITE_VISITOR_WEBHOOK_URL || ''
const OCTOPUSFLOW_CHECKOUT_API = '/api/octopusflow-checkout'

const PURCHASE_STATUS_COPY = {
  success: {
    title: 'Pago recibido',
    message: 'Gracias por comprar OctopusFlow. Si Mercado Pago ya confirmó la operación, te vamos a contactar con el acceso.',
  },
  pending: {
    title: 'Pago pendiente',
    message: 'Tu pago todavía está pendiente de confirmación. Te avisamos apenas Mercado Pago lo apruebe.',
  },
  failure: {
    title: 'No se completó el pago',
    message: 'No pudimos confirmar la compra. Podés intentar nuevamente o escribirnos por WhatsApp.',
  },
} as const

type ThemeMode = 'light' | 'night'
type PurchaseStatus = keyof typeof PURCHASE_STATUS_COPY

function getPurchaseStatus(): PurchaseStatus | null {
  if (typeof window === 'undefined') return null
  const status = new URLSearchParams(window.location.search).get('purchase')
  return status === 'success' || status === 'pending' || status === 'failure' ? status : null
}

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light'
  return window.localStorage.getItem('octopusflow-theme') === 'night' ? 'night' : 'light'
}

function scrollToId(id: string, event?: { preventDefault?: () => void }) {
  event?.preventDefault?.()
  const element = document.getElementById(id)
  if (!element) return
  const offset = window.innerWidth >= 768 ? 90 : 82
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
    const ctx = gsap.context(() => {
      elements.forEach((el) => {
        const rawDelay = el.style.getPropertyValue('--reveal-delay') || getComputedStyle(el).getPropertyValue('--reveal-delay') || '0'
        const delay = parseFloat(rawDelay) / 1000
        gsap.fromTo(
          el,
          { opacity: 0, y: 36, filter: 'blur(6px)' },
          {
            opacity: 1, y: 0, filter: 'blur(0px)',
            duration: 0.85, delay,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          },
        )
      })
    })
    return () => ctx.revert()
  }, [])
}

function PurchaseButton({ source, className, children }: { source: string; className: string; children: ReactNode }) {
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

function PurchaseStatusBanner() {
  const status = getPurchaseStatus()
  if (!status) return null

  const copy = PURCHASE_STATUS_COPY[status]

  return (
    <div className="border-b border-primary/20 bg-primary/10 px-4 pb-3 pt-[84px] text-primary sm:px-6">
      <div className="mx-auto max-w-6xl rounded-xl border border-primary/20 bg-card/80 px-4 py-3 text-sm shadow-lg shadow-primary/5">
        <p className="font-semibold text-foreground">{copy.title}</p>
        <p className="mt-1 text-muted-foreground">{copy.message}</p>
      </div>
    </div>
  )
}

// ========================================
// Blue palette overrides for OctopusFlow
// ========================================
const OF_THEME = 'octopusflow'

// ========================================
// Header
// ========================================
function useFloatingLogo() {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.set(el, { transformOrigin: '50% 50%' })
      gsap.to(el, {
        y: -7,
        duration: 3.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    })

    return () => ctx.revert()
  }, [])

  return ref
}

function Header({ theme, onToggleTheme }: { theme: ThemeMode; onToggleTheme: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const logoRef = useFloatingLogo()

  const headerChrome = 'border-border/60 bg-background/75'
  const activeButton = 'bg-primary text-primary-foreground shadow-primary/20 hover:bg-primary/90'
  const menuButtonChrome = 'border-border/70 bg-card/70 text-muted-foreground hover:bg-card hover:text-foreground'

  const menuItems = [
    { label: 'Características', id: 'caracteristicas', targetId: 'caracteristicas' },
    { label: 'Contacto', id: 'contacto', targetId: 'contacto' },
  ]

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-2xl transition-colors duration-500 ${headerChrome}`}>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a href="#inicio" className="flex items-center gap-3">
          <span ref={logoRef} className="inline-flex shrink-0 overflow-visible">
            <img
              src="/images/logos/logo-header1.svg"
              alt="OctopusFlow"
              className="h-[52px] w-[52px]"
            />
          </span>
          <span className="text-[17px] font-bold leading-tight tracking-tight text-primary">
            OctopusFlow
          </span>
        </a>

        <div className="flex items-center gap-3">
          <PurchaseButton
            source="octopusflow-header"
            className={`hidden rounded-lg px-4 sm:inline-flex items-center justify-center gap-2 py-1.5 text-sm font-semibold shadow-lg transition-all duration-500 hover:scale-[1.03] ${activeButton}`}
          >
            Obtener OctopusFlow
          </PurchaseButton>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'night' ? 'Cambiar a modo claro' : 'Cambiar a modo noche'}
            className={`relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border transition-all duration-500 hover:scale-[1.03] ${menuButtonChrome}`}
          >
            {theme === 'night' ? <Sun className="relative z-10 h-4 w-4" /> : <Moon className="relative z-10 h-4 w-4" />}
          </button>
          <button
            type="button"
            aria-label="Abrir menú"
            className={`relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border transition-all duration-500 ${menuButtonChrome}`}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden border-t transition-all duration-500 ease-out ${headerChrome} ${
          menuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="relative mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6 sm:py-5">
          {menuItems.map((item, index) => (
            <a
              key={item.label}
              href={`#${item.id}`}
              onClick={(event) => {
                setMenuOpen(false)
                scrollToId(item.targetId, event)
              }}
              className={`group relative flex items-center justify-between overflow-hidden rounded-xl border border-border/70 bg-card/70 px-4 py-3 text-sm font-medium text-muted-foreground shadow-lg shadow-background/30 transition-all duration-500 hover:-translate-y-0.5 hover:border-border hover:bg-card hover:text-foreground ${menuOpen ? 'opacity-100' : 'opacity-0'}`}
              style={{ transitionDelay: menuOpen ? `${index * 45}ms` : '0ms' }}
            >
              <span className="relative z-10 flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary transition-transform duration-300 group-hover:scale-150" />
                {item.label}
              </span>
              <span className="relative z-10 font-mono text-xs text-muted-foreground/60 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-muted-foreground">
                0{index + 1}
              </span>
            </a>
          ))}
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className={`group relative flex items-center justify-between overflow-hidden rounded-xl border border-border/70 bg-card/70 px-4 py-3 text-sm font-medium text-muted-foreground shadow-lg shadow-background/30 transition-all duration-500 hover:-translate-y-0.5 hover:border-border hover:bg-card hover:text-foreground ${menuOpen ? 'opacity-100' : 'opacity-0'}`}
            style={{ transitionDelay: menuOpen ? `${menuItems.length * 45}ms` : '0ms' }}
          >
            <span className="relative z-10 flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-primary transition-transform duration-300 group-hover:scale-150" />
              OctopusTrack
            </span>
            <span className="relative z-10 font-mono text-xs text-muted-foreground/60 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-muted-foreground">
              Volver
            </span>
          </Link>
          <PurchaseButton
            source="octopusflow-mobile-menu"
            className="relative mt-2 flex items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-3 text-center text-sm font-semibold shadow-lg transition-all duration-500 hover:-translate-y-0.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Obtener OctopusFlow
          </PurchaseButton>
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

function Hero() {
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
          <PurchaseButton
            source="octopusflow-hero"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 hover:scale-[1.02] hover:bg-primary/90"
          >
            Obtener OctopusFlow
            <ArrowRight className="h-5 w-5" />
          </PurchaseButton>
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

// ========================================
// Pain Points
// ========================================
function PainPoints() {
  const pains = [
    {
      icon: FileText,
      title: 'Presupuestos perdidos en WhatsApp',
      description: 'Entre mensajes de voz y chats, los presupuestos se pierden y no les das seguimiento.',
    },
    {
      icon: Timer,
      title: 'Cotizar te lleva demasiado tiempo',
      description: 'Buscar precios, armar el texto, mandar foto… cada presupuesto te roba 20 minutos.',
    },
    {
      icon: Search,
      title: 'Los clientes no quedan registrados',
      description: 'Cuando necesitás re-cotizar, no encontrás el histórico de lo que le mandaste.',
    },
    {
      icon: TrendingUp,
      title: 'No sabés qué presupuesto está vigente',
      description: 'Aprobaste uno hace meses y ya no recordás los detalles ni el precio pactado.',
    },
  ]

  return (
    <section id="dolores" className="relative overflow-hidden bg-background px-4 py-20 sm:px-6 sm:py-28">
      <div className="pointer-events-none absolute left-[-18%] top-[8%] h-[420px] w-[420px] rounded-full bg-primary-300/18 blur-[120px]" />

      <div className="mx-auto max-w-6xl">
        <div className="reveal-on-scroll mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Perdés tiempo y clientes{' '}
            <span className="text-primary">sin un sistema de presupuestos</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Si todavía estás armando presupuestos a mano o por mensajes, esto te pasa todos los días.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-5 sm:grid-cols-2">
          {pains.map((pain) => (
            <div
              key={pain.title}
              className="reveal-on-scroll group flex flex-col rounded-2xl bg-card/70 p-6 ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:bg-card hover:shadow-2xl hover:shadow-primary/10"
            >
              <pain.icon className="mb-4 h-6 w-6 shrink-0 text-primary" />
              <h3 className="text-lg font-medium leading-relaxed text-foreground">{pain.title}</h3>
              <p className="mt-2 pt-2 text-sm leading-relaxed text-muted-foreground">{pain.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ========================================
// Features
// ========================================
function Features() {
  const features = [
    {
      icon: Zap,
      title: 'Presupuestos en segundos',
      description: 'Armá presupuestos profesionales con precios, descripciones y totales. En minutos, no en horas.',
    },
    {
      icon: Share2,
      title: 'Compartí por WhatsApp al instante',
      description: 'Enviá el presupuesto como PDF o link directo por WhatsApp. Tu cliente lo ve al toque.',
    },
    {
      icon: Users,
      title: 'Clientes siempre guardados',
      description: 'Cada cliente queda registrado con su historial. Re-cotizá sin empezar de cero.',
    },
    {
      icon: BarChart3,
      title: 'Seguimiento de estado',
      description: 'Sabé qué presupuestos están pendientes, aprobados o vencidos. Nunca más perdés el hilo.',
    },
  ]

  return (
    <section id="caracteristicas" className="relative overflow-hidden bg-background px-4 py-20 sm:px-6 sm:py-28">
      <div className="pointer-events-none absolute bottom-[18%] right-[-12%] h-[520px] w-[520px] rounded-full bg-primary-700/10 blur-[130px]" />

      <div className="mx-auto max-w-6xl">
        <div className="reveal-on-scroll text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Todo lo que necesitás para{' '}
            <span className="text-primary">presupuestar como profesional</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Dejá de improvisar. Con OctopusFlow tenés todo ordenado para cotizar rápido y cerrar más ventas.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="reveal-on-scroll flex flex-col rounded-2xl border border-border bg-card/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-card hover:shadow-xl hover:shadow-primary/5"
              style={{ '--reveal-delay': `${index * 100}ms` } as CSSProperties}
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ========================================
// CTA Section
// ========================================
function CtaSection() {
  return (
    <section id="precios" className="relative overflow-hidden bg-background px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="reveal-on-scroll overflow-hidden rounded-[28px] border border-primary/20 bg-card shadow-2xl shadow-primary/10 md:grid md:grid-cols-[0.92fr_1.08fr]">
          <div className="relative overflow-hidden bg-primary px-6 py-10 text-primary-foreground sm:px-10 sm:py-14 lg:px-12 lg:py-16">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-foreground/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-8 h-56 w-56 rounded-full bg-background/20 blur-3xl" />
            <div className="relative">
              <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-primary-foreground/70">
                Compra directa
              </p>
              <h2 className="mt-5 max-w-xl font-display text-4xl font-black leading-[0.98] tracking-tight sm:text-5xl lg:text-6xl">
                Obtené OctopusFlow y empezá a presupuestar mejor
              </h2>
            </div>
          </div>

          <div className="bg-card px-6 py-10 sm:px-10 sm:py-14 lg:px-12 lg:py-16">
            <p className="max-w-xl text-lg leading-relaxed text-foreground sm:text-xl">
              Empezá a crear presupuestos profesionales al instante. Compartilos por WhatsApp y guardá todos tus clientes.
            </p>

            <div className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              {['Compra segura con Mercado Pago', 'Activación inmediata', 'Acceso al sistema', 'Soporte por WhatsApp'].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <PurchaseButton
                source="octopusflow-pricing"
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.02] hover:bg-primary/90 sm:min-w-[210px]"
              >
                Obtener OctopusFlow
              </PurchaseButton>
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
          <span className="text-muted-foreground/40" aria-hidden="true">•</span>
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
// OctopusFlow — Main Page Component
// ========================================
export default function OctopusFlow() {
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme())

  useEffect(() => {
    window.localStorage.setItem('octopusflow-theme', theme)
  }, [theme])

  useVisitorTracking()
  useScrollReveal()

  const toggleTheme = () => {
    setTheme((current) => (current === 'night' ? 'light' : 'night'))
  }

  return (
    <div
      data-theme={OF_THEME}
      className={`${theme === 'night' ? 'dark ' : ''}min-h-screen bg-background text-foreground`}
    >
      {/* Blue palette CSS variable overrides scoped to this page */}
      <style>{`
        [data-theme="octopusflow"] {
          --primary: 37 99 235;
          --primary-foreground: 255 255 255;
          --primary-50: 239 246 255;
          --primary-100: 219 234 254;
          --primary-200: 191 219 254;
          --primary-300: 147 197 253;
          --primary-400: 96 165 250;
          --primary-500: 59 130 246;
          --primary-600: 37 99 235;
          --primary-700: 29 78 216;
          --primary-800: 30 64 175;
          --primary-900: 23 37 84;
          --primary-950: 15 23 42;
        }
        .dark[data-theme="octopusflow"] {
          --primary: 96 165 250;
          --primary-foreground: 15 23 42;
          --primary-50: 15 23 42;
          --primary-100: 23 37 84;
          --primary-200: 30 64 175;
          --primary-300: 29 78 216;
          --primary-400: 37 99 235;
          --primary-500: 59 130 246;
          --primary-600: 96 165 250;
          --primary-700: 147 197 253;
          --primary-800: 191 219 254;
          --primary-900: 219 234 254;
          --primary-950: 239 246 255;
        }
      `}</style>

      <Header theme={theme} onToggleTheme={toggleTheme} />
      <FloatingContactButton />
      <PurchaseStatusBanner />
      <main>
        <Hero />
        <PainPoints />
        <Features />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
