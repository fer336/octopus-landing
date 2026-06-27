import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Button from './ui/Button'
import DemoModal, { type DemoProduct } from './DemoModal'
import Header from './Header'
import Hero from './Hero'
import PainPoints from './PainPoints'
import SocialProof from './SocialProof'
import OctopusTrackShowcase from './OctopusTrackShowcase'
import ContactForm from './ContactForm'
import { MagnetizeButton } from './MagnetizeCta'

const WHATSAPP_URL = 'https://wa.me/5492254596618'
const VISITOR_WEBHOOK_URL = import.meta.env.VITE_VISITOR_WEBHOOK_URL || ''

type HeaderSection = 'none' | 'track'

// ── Scroll animation hooks ─────────────────────────────────────────────────

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

// ── Inline static-ish sub-components ──────────────────────────────────────
// These are kept here because LandingContent is a React island and cannot
// import .astro components. Phase 6 will move them to vanilla JS / Astro.

function SectionDivider({ from, to }: { from: string; to: string }) {
  return (
    <div
      className="section-divider"
      style={{ background: `linear-gradient(to bottom, ${from}, ${to})` }}
      aria-hidden="true"
    />
  )
}

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
    <div className="overflow-hidden border-y border-border bg-background py-3" aria-hidden="true">
      <div
        className={reversed ? 'animate-marquee-rtl' : 'animate-marquee-ltr'}
        style={
          {
            '--marquee-duration': `${duration}s`,
            display: 'flex',
            gap: 0,
          } as CSSProperties
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
        style={{ '--marquee-duration': '34s' } as CSSProperties}
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

function OctopusFlowCrossSell() {
  return (
    <section className="relative overflow-hidden bg-background px-4 py-16 sm:px-6 sm:py-20">
      <div className="reveal-on-scroll mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-6 sm:p-10 lg:p-12">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            <div className="flex shrink-0 items-center justify-center">
              <img
                src="/images/logos/logo-header1.svg"
                alt="OctopusFlow"
                className="h-16 w-16 rounded-full ring-2 ring-primary/30 sm:h-20 sm:w-20"
              />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-1">
                OctopusFlow
              </p>
              <h3 className="text-xl font-bold text-foreground sm:text-2xl">
                Sistema para profesionales independientes
              </h3>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                Creá presupuestos profesionales, compartilos por WhatsApp al instante y guardá todos tus clientes.
                Pensado para electricistas, plomeros, gasistas y más.
              </p>
            </div>
            <a
              href="/octopusflow"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.02] hover:bg-primary/90"
            >
              Obtener OctopusFlow
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function StartInMinutesSection({ openDemoModal }: { openDemoModal?: () => void }) {
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
              Te mostramos cómo ordenar stock, ventas, listas de precio, cuentas corrientes y facturación sin cambiar
              la forma en que trabaja tu comercio.
            </p>

            <div className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              {['Sin tarjeta', 'Sin contratos largos', 'Acompañamiento real', 'Configurado para tu rubro'].map(
                (item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </div>
                ),
              )}
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <MagnetizeButton
                type="button"
                onClick={() => openDemoModal?.()}
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

function FloatingContactButtonInline() {
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

function FooterInline() {
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

// ── Main LandingContent component ──────────────────────────────────────────

export default function LandingContent() {
  useScrollReveal()
  useDeviceFrameReveal()
  useStaggerEntrance()
  const headerSection = useHeaderSection()

  const [demoOpen, setDemoOpen] = useState(false)
  const openDemoModal = () => setDemoOpen(true)
  const closeDemoModal = () => setDemoOpen(false)

  const demoProduct: DemoProduct = useMemo(
    () => ({ type: 'octopustrack', name: 'OctopusTrack' }),
    [],
  )

  const industriasTicker = ['Ferreterías', 'Distribuidoras', 'Forrajerías', 'Sanitarios', 'Electricidad']

  return (
    <>
      <Header section={headerSection} />
      <FloatingContactButtonInline />
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
        <OctopusFlowCrossSell />
        <ContactForm />
      </main>
      <FooterInline />

      <DemoModal product={demoProduct} open={demoOpen} onClose={closeDemoModal} />
    </>
  )
}
