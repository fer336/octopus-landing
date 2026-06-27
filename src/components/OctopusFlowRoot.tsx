import { useEffect, useState, type CSSProperties } from 'react'
import { ArrowRight, CheckCircle2, MessageCircle, FileText, Timer, Search, TrendingUp, Zap, Share2, Users, BarChart3 } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import HeaderOF from './octopusflow/HeaderOF'
import HeroOF from './octopusflow/HeroOF'

const WHATSAPP_URL = 'https://wa.me/5492254596618'
const VISITOR_WEBHOOK_URL = import.meta.env.VITE_VISITOR_WEBHOOK_URL || ''
const OCTOPUSFLOW_CHECKOUT_API = '/api/octopusflow-checkout'
const OF_THEME = 'octopusflow'

type ThemeMode = 'light' | 'night'

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light'
  return window.localStorage.getItem('octopusflow-theme') === 'night' ? 'night' : 'light'
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
        const rawDelay =
          el.style.getPropertyValue('--reveal-delay') ||
          getComputedStyle(el).getPropertyValue('--reveal-delay') ||
          '0'
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
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          },
        )
      })
    })
    return () => ctx.revert()
  }, [])
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

function CtaSection() {
  const checkItems = [
    'Compra segura con Mercado Pago',
    'Activación inmediata',
    'Acceso al sistema',
    'Soporte por WhatsApp',
  ]

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
              {checkItems.map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <PurchaseButtonReact
                source="octopusflow-pricing"
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.02] hover:bg-primary/90 sm:min-w-[210px]"
              >
                Obtener OctopusFlow
              </PurchaseButtonReact>
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
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary transition-colors hover:text-primary/80"
          >
            WhatsApp
          </a>
        </p>
      </div>
    </footer>
  )
}

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

// ── Main OctopusFlowRoot component ─────────────────────────────────────────

export default function OctopusFlowRoot() {
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme())

  useEffect(() => {
    window.localStorage.setItem('octopusflow-theme', theme)
    if (theme === 'night') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
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

      <HeaderOF theme={theme} onToggleTheme={toggleTheme} />
      <FloatingContactButton />
      <main>
        <HeroOF />
        <PainPoints />
        <Features />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
