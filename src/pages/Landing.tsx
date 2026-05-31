import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, CheckCircle2, Menu, X, MessageCircle } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Button from '../components/ui/Button'
import AnimatedTentacleLogo from '../components/ui/AnimatedTentacleLogo'

const WHATSAPP_URL = 'https://wa.me/5492254596618'
const ASSET_WEBHOOK_URL = import.meta.env.VITE_LANDING_ASSET_WEBHOOK_URL || '#webhook-no-configured'
const FORM_WEBHOOK_URL = 'https://n8nw.qeva.xyz/webhook/octopus-landing-contacto'
const MP_CHECKOUT_WEBHOOK_URL = 'https://n8nw.qeva.xyz/webhook/octopus-mp'
const VISITOR_WEBHOOK_URL = import.meta.env.VITE_VISITOR_WEBHOOK_URL || ''
interface LandingProps {
  loginUrl?: string
}

function normalizeWhatsappLink(input: string) {
  const trimmed = input.trim()
  if (!trimmed) return WHATSAPP_URL
  if (trimmed.startsWith('http')) return trimmed

  const digits = trimmed.replace(/\D/g, '')
  if (!digits) return WHATSAPP_URL
  return `https://wa.me/${digits}`
}

function openWhatsAppWithMessage(message: string) {
  const target = normalizeWhatsappLink(WHATSAPP_URL)
  const separator = target.includes('?') ? '&' : '?'
  const finalUrl = `${target}${separator}text=${encodeURIComponent(message)}`
  window.open(finalUrl, '_blank', 'noopener,noreferrer')
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
function Header({ loginUrl, section = 'none' }: { loginUrl: string; section?: HeaderSection }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const isBlue = section === 'flow'
  const isGreen = section === 'tool'
  const showProduct = section !== 'none'

  const productLabel = section === 'flow' ? 'OctopusFlow' : section === 'tool' ? 'OctopusTool' : 'OctopusTrack'
  const headerChrome = 'border-white/5 bg-[#0d0d1a]/60'
  const activeTextColor = isBlue ? 'text-blue-200' : isGreen ? 'text-tool-highlight' : 'text-primary-300'
  const menuChrome = 'border-white/5 bg-[#0d0d1a]/95'
  const activeButton = isBlue
    ? 'bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-500'
    : isGreen
      ? 'bg-tool-primary text-white shadow-tool-primary/25 hover:bg-tool-accent'
      : 'bg-primary-600 text-white shadow-primary-700/20 hover:bg-primary-500'
  const menuButtonChrome = isBlue
    ? 'border-blue-400/30 bg-blue-500/10 text-white/80 hover:text-white hover:bg-blue-500/20'
    : isGreen
      ? 'border-tool-highlight/30 bg-tool-highlight/10 text-white/80 hover:text-white hover:bg-tool-highlight/20'
      : 'border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10'

  const menuItems = [
    { label: 'OctopusTool', id: 'excel-start', scrollTargetId: 'octopustool-content', desktopOffset: 126, mobileOffset: 104 },
    { label: 'OctopusFlow', id: 'octopusflow', scrollTargetId: 'octopusflow-content', desktopOffset: 126, mobileOffset: 104 },
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
          <span
            className="inline-flex shrink-0 overflow-visible"
            style={{
              filter: isBlue ? 'hue-rotate(310deg) saturate(1.4) brightness(1.1)' : 'none',
              transition: 'filter 0.6s ease',
            }}
          >
            <AnimatedTentacleLogo className="h-[52px] w-[52px]" alt="OctopusTrack" palette={isGreen ? 'tool' : 'default'} />
          </span>

          {/* Product name — unfurls like a tentacle when the active section changes */}
          <span
            className="header-product-shell overflow-hidden transition-all duration-500 ease-out"
            style={{ maxWidth: showProduct ? '180px' : '0px', opacity: showProduct ? 1 : 0 }}
          >
            <span key={section} className="header-product-label-wrap block whitespace-nowrap">
              <span className={`header-product-label block font-display text-[17px] font-black leading-tight transition-colors duration-500 ${activeTextColor}`}>
                {productLabel}
              </span>
            </span>
          </span>
        </a>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => (window.location.href = loginUrl)}
            className={`hidden rounded-lg px-3 py-1.5 text-sm font-semibold shadow-lg transition-all duration-500 hover:scale-[1.03] sm:block ${activeButton}`}
          >
            Apps
          </button>
          <button
            type="button"
            aria-label="Abrir menú"
            className={`relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border text-white/80 transition-all duration-500 hover:text-white ${menuButtonChrome}`}
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
              className={`group relative flex translate-y-0 items-center justify-between overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.035] px-4 py-3 text-sm font-semibold text-white/72 shadow-lg shadow-black/10 transition-all duration-500 hover:-translate-y-0.5 hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-white ${menuOpen ? 'opacity-100' : 'opacity-0'}`}
              style={{ transitionDelay: menuOpen ? `${index * 45}ms` : '0ms' }}
            >
              <span className="relative z-10 flex items-center gap-3">
                <span className={`h-1.5 w-1.5 rounded-full transition-transform duration-300 group-hover:scale-150 ${item.label === 'OctopusFlow' ? 'bg-blue-400' : item.label === 'OctopusTool' ? 'bg-tool-highlight' : 'bg-primary-400'}`} />
                {item.label}
              </span>
              <span className="relative z-10 text-xs font-mono text-white/25 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white/50">0{index + 1}</span>
              <span className={`absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100 ${item.label === 'OctopusFlow' ? 'bg-blue-400/70' : item.label === 'OctopusTool' ? 'bg-tool-highlight/70' : 'bg-primary-400/70'}`} />
            </a>
          ))}
          <a
            href={loginUrl}
            className={`relative mt-2 overflow-hidden rounded-xl px-4 py-3 text-center text-sm font-semibold text-white shadow-lg transition-all duration-500 hover:-translate-y-0.5 ${activeButton}`}
          >
            Apps
          </a>
        </nav>
      </div>
    </header>
  )
}

// ========================================
// Hero
// ========================================
function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden bg-[#0a0a14] px-4 pb-24 pt-24 sm:px-6 sm:pt-32 sm:pb-36">
      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_70%_at_10%_20%,black_5%,transparent_85%)]" />

      {/* Subtle violet glow */}
      <div className="pointer-events-none absolute bottom-0 left-[-5%] h-[280px] w-[560px] rounded-full bg-primary-700/15 blur-[90px]" />

      <div className="relative z-10 mx-auto max-w-5xl animate-fade-in-up">
        <p className="text-sm font-semibold tracking-wide text-primary-400">Ahorrá tiempo, vendé más</p>

        <h1 className="mt-5 font-display text-[44px] font-black leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-[76px]">
          Tu negocio necesita
          <br />
          <span className="text-primary-300">una herramienta que se adapte a vos.</span>
        </h1>

        <p className="mt-8 max-w-3xl text-xl leading-relaxed text-white/60 sm:text-2xl">
          Tenemos 3 soluciones para profesionales independientes y comerciantes que quieren trabajar más rápido y ordenado.
        </p>

        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/42 sm:text-xl">
          Empezá simple, profesionalizá tu gestión y escalá cuando tu operación crezca.
        </p>
      </div>
    </section>
  )
}

// ========================================
// ExcelOffer — Feature showcase (pricing moved to end)
// ========================================
function ExcelOffer({ sectionActive = false }: { sectionActive?: boolean }) {
  const features = [
    'Excel descargable + Google Sheets',
    'Cotizador que trabaja en segundos',
    '4 planillas listas para usar',
    'Base de datos de productos',
    'Configurá tu empresa una vez',
    'Instrucciones paso a paso',
    'Sin instalaciones ni servidores',
    'Para negocios que cotizan todos los días',
  ]
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [downloadEmail, setDownloadEmail] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')

  const handleDownload = (event?: React.FormEvent) => {
    event?.preventDefault()
    const email = downloadEmail.trim()
    if (!email || downloading) return
    if (!/\S+@\S+\.\S+/.test(email)) {
      setDownloadError('Ingresá un correo válido para continuar.')
      return
    }

    if (!MP_CHECKOUT_WEBHOOK_URL) {
      setDownloadError('No pudimos iniciar la descarga. Escribinos por WhatsApp y te ayudamos.')
      return
    }

    setDownloading(true)
    setDownloadError('')

    const params = new URLSearchParams(window.location.search)

    // Build a dynamic form for a real browser POST — avoids CORS
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = MP_CHECKOUT_WEBHOOK_URL

    const fields: Record<string, string> = {
      email,
      product: 'OctopusTool',
      precio: '6',
      format: 'excel',
      source: 'landing-download',
      page_url: window.location.href,
      created_at: new Date().toISOString(),
      referrer: document.referrer || '',
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
    }

    Object.entries(fields).forEach(([key, value]) => {
      if (!value) return
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = value
      form.appendChild(input)
    })

    document.body.appendChild(form)
    form.submit()
  }

  return (
    <section id="excel-start" className="relative overflow-hidden bg-[#07090f] px-4 py-24 sm:px-6 sm:py-32">
      <div className="pointer-events-none absolute -top-20 left-[15%] h-[400px] w-[600px] rounded-full bg-tool-primary/18 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 right-[5%] h-[300px] w-[400px] rounded-full bg-tool-surface/22 blur-[80px]" />
      <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,rgba(126,207,134,0.06)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_50%_60%_at_85%_30%,black_5%,transparent_80%)]" />

      <div className="relative mx-auto w-full max-w-6xl">
        <div
          className="mb-12 flex items-center gap-4 transition-opacity duration-500"
          style={{ opacity: sectionActive ? 0 : 1, pointerEvents: sectionActive ? 'none' : 'auto' }}
        >
          <span className="inline-flex h-14 w-14 shrink-0 overflow-visible">
            <AnimatedTentacleLogo className="h-[52px] w-[52px]" alt="OctopusTool" palette="tool" />
          </span>
          <div>
            <p className="text-xs font-semibold text-tool-highlight">Cotizador Excel</p>
            <p className="font-display text-xl font-black text-white">OctopusTool</p>
          </div>
        </div>

        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
        {/* Content */}
        <article id="octopustool-content" className="reveal-on-scroll scroll-mt-24">
          <h2 className="font-display text-3xl font-black leading-[1.05] text-white sm:text-4xl lg:text-5xl">
            Tu cotizador{' '}
            <span className="text-tool-highlight">
              profesional en Excel
            </span>
          </h2>

          <p className="mt-5 max-w-lg text-lg text-white/55">
            Generá presupuestos profesionales en segundos. Sin instalaciones, sin servidores, sin complicaciones.
          </p>

          <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-white/65">
                <span className="mt-0.5 shrink-0 font-bold text-tool-accent">—</span>
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => openWhatsAppWithMessage('Hola! Me interesa saber sobre OctopusTool.')}
              className="flex w-fit items-center justify-center gap-2 rounded-xl border border-tool-highlight/30 bg-gradient-to-r from-tool-primary to-tool-accent px-7 py-3.5 text-sm font-semibold text-tool-background shadow-lg shadow-tool-primary/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-tool-accent/30"
            >
              Me interesa OctopusTool
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setDownloadError('')
                setShowDownloadModal(true)
              }}
              className="flex w-fit items-center justify-center gap-2 rounded-xl border border-tool-highlight/30 bg-tool-highlight/10 px-7 py-3.5 text-sm font-semibold text-tool-highlight shadow-lg shadow-tool-background/20 transition-all duration-200 hover:scale-[1.02] hover:border-tool-highlight/45 hover:bg-tool-highlight/18 hover:text-tool-highlight"
            >
              Descargar Excel
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {showDownloadModal && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
              <button
                type="button"
                aria-label="Cerrar descarga de OctopusTool"
                className="absolute inset-0 bg-[#05070a]/80 backdrop-blur-sm"
                onClick={() => !downloading && setShowDownloadModal(false)}
              />

              <form
                onSubmit={handleDownload}
                className="relative w-full max-w-md overflow-hidden rounded-3xl border border-tool-highlight/25 bg-[#07100b] p-6 shadow-2xl shadow-tool-background/70"
              >
                <div className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-tool-primary/20 blur-3xl" />
                <button
                  type="button"
                  aria-label="Cerrar"
                  onClick={() => !downloading && setShowDownloadModal(false)}
                  className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 p-2 text-white/60 transition-colors hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="relative">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-tool-highlight">OctopusTool</p>
                  <h3 className="mt-3 font-display text-2xl font-black text-white">Descargar Excel</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">
                    Dejanos tu correo para iniciar la compra segura y recibir el acceso al cotizador.
                  </p>

                  <label htmlFor="octopustool-download-email" className="mt-6 block text-sm font-medium text-white/60">
                    Correo electrónico
                  </label>
                  <input
                    id="octopustool-download-email"
                    type="email"
                    placeholder="tu@email.com"
                    value={downloadEmail}
                    onChange={(e) => setDownloadEmail(e.target.value)}
                    required
                    className="mt-2 w-full rounded-xl border border-tool-highlight/30 bg-tool-background/30 px-4 py-3 text-sm text-white placeholder:text-white/30 transition-colors focus:border-tool-highlight focus:outline-none focus:ring-1 focus:ring-tool-highlight/40"
                  />

                  {downloadError && <p className="mt-3 text-sm text-red-300">{downloadError}</p>}

                  <button
                    type="submit"
                    disabled={downloading}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-tool-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-tool-primary/25 transition-all duration-200 hover:scale-[1.01] hover:bg-tool-accent disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {downloading ? 'Redirigiendo…' : 'Continuar a descarga'}
                    {!downloading && <ArrowRight className="h-4 w-4" />}
                  </button>
                </div>
              </form>
            </div>
          )}
        </article>

        {/* OctopusTool screenshot */}
        <TiltCard
          tag="article"
          strength={7}
          className="reveal-on-scroll group relative overflow-hidden rounded-3xl border border-tool-border/25 shadow-2xl shadow-tool-background/40"
        >
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-tool-primary/12 to-tool-highlight/10 blur-sm transition-opacity duration-500 group-hover:from-tool-primary/20 group-hover:to-tool-highlight/18" />
          <img
            src="/assets/octopustool.png"
            alt="OctopusTool — cotizador profesional en Excel"
            className="relative w-full rounded-3xl"
          />
        </TiltCard>
        </div>
      </div>
    </section>
  )
}

// ========================================
// OctopusTrack Showcase — Screenshot + HUD frame
// ========================================
function OctopusTrackShowcase({ sectionActive = false }: { sectionActive?: boolean }) {
  const features = [
    'Acopios por importe',
    'Facturación Electrónica',
    'Cotizaciones',
    'Cuentas corrientes',
    'Remitos',
    'Actualización masiva de precios',
    'Importación y exportación de listas de precio',
    'Datos en PDF y Excel',
    'Uso rápido y fácil',
    'Órdenes de compra',
  ]

  return (
    <section id="caracteristicas" className="relative overflow-hidden bg-[#0a0a14] px-4 py-24 sm:px-6 sm:py-32">
      <div className="pointer-events-none absolute left-[55%] top-[10%] h-[500px] w-[500px] rounded-full bg-primary-800/12 blur-[110px]" />

      <div className="relative mx-auto w-full max-w-6xl">
        {/* Product brand row — fades out when header takes over */}
        <div
          className="mb-12 flex items-center gap-4 transition-opacity duration-500"
          style={{ opacity: sectionActive ? 0 : 1, pointerEvents: sectionActive ? 'none' : 'auto' }}
        >
          <AnimatedTentacleLogo className="h-[52px] w-[52px]" alt="OctopusTrack" />
          <div>
            <p className="text-xs font-semibold text-primary-400">Sistema ERP</p>
            <p className="font-display text-xl font-black text-white">OctopusTrack</p>
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Content */}
          <div id="octopustrack-content" className="reveal-on-scroll scroll-mt-24">
            <h2 className="font-display text-3xl font-black leading-[1.05] text-white sm:text-4xl lg:text-5xl">
              Todo lo que tu negocio necesita,{' '}
              <span className="text-primary-300">en un solo lugar</span>
            </h2>
            <p className="mt-5 max-w-lg text-base text-white/55">
              Rápido, directo y sin complicaciones. Empezás en minutos y crecés sin cambiar de sistema.
            </p>

            <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-white/65">
                  <span className="mt-0.5 shrink-0 font-bold text-primary-500">—</span>
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => openWhatsAppWithMessage('Hola! Me interesa saber sobre OctopusTrack.')}
                className="flex w-fit items-center justify-center gap-2 rounded-xl border border-primary-500/30 bg-primary-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition-all duration-200 hover:scale-[1.02] hover:bg-primary-500"
              >
                Me interesa OctopusTrack
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="https://app.octopustrack.shop"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-fit items-center justify-center gap-2 rounded-xl border border-primary-400/30 bg-primary-500/10 px-7 py-3.5 text-sm font-semibold text-primary-200 shadow-lg shadow-primary-950/20 transition-all duration-200 hover:scale-[1.02] hover:border-primary-300/45 hover:bg-primary-500/18 hover:text-white"
              >
                Probar demo 7 días
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* OctopusTrack screenshot — HUD frame */}
          <TiltCard strength={7} className="reveal-on-scroll group relative lg:mt-10">
            <div className="absolute -inset-px rounded-3xl bg-primary-600/15 blur-sm transition-opacity duration-500 group-hover:bg-primary-500/22" />

            <div className="relative overflow-hidden rounded-3xl border border-primary-500/20 bg-[#0d0a1a] shadow-2xl shadow-primary-950/60">
              {/* Corner brackets */}
              <span className="absolute left-3 top-3 z-10 block h-6 w-6 border-l-2 border-t-2 border-primary-400/50" />
              <span className="absolute right-3 top-3 z-10 block h-6 w-6 border-r-2 border-t-2 border-primary-400/50" />
              <span className="absolute bottom-10 left-3 z-10 block h-6 w-6 border-b-2 border-l-2 border-primary-400/50" />
              <span className="absolute bottom-10 right-3 z-10 block h-6 w-6 border-b-2 border-r-2 border-primary-400/50" />

              {/* Scanlines */}
              <div className="pointer-events-none absolute inset-0 z-10 [background-image:repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(255,255,255,0.007)_3px,rgba(255,255,255,0.007)_4px)]" />

              <img
                src="/assets/octopustrack.png"
                alt="Panel de OctopusTrack"
                className="w-full"
              />

              {/* Status bar */}
              <div className="flex items-center gap-2.5 border-t border-primary-500/10 bg-[#0a0814]/80 px-4 py-2.5 backdrop-blur-sm">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-400" />
                </span>
                <span className="font-mono text-[11px] text-primary-400/60">Sistema activo</span>
                <span className="ml-auto font-mono text-[11px] text-white/15">OctopusTrack v1.4.29</span>
              </div>
            </div>
          </TiltCard>
        </div>
      </div>
    </section>
  )
}

// ========================================
// OctopusFlow — New product for freelancers
// ========================================
function OctopusFlowSection({ sectionActive = false }: { sectionActive?: boolean }) {
  const features = [
    'Creá presupuestos profesionales en minutos',
    'Compartí por link directo o PDF con tu cliente',
    'Seguimiento de estado: enviado, aceptado, rechazado',
    'Historial completo por cliente',
    'Tu marca en cada presupuesto',
  ]

  const handleWhatsApp = () => {
    openWhatsAppWithMessage('Hola! Me interesa saber sobre OctopusFlow.')
  }

  return (
    <section id="octopusflow" className="relative overflow-hidden bg-[#07090f] px-4 py-24 sm:px-6 sm:py-32">
      {/* Blue ambient glows */}
      <div className="pointer-events-none absolute -top-20 left-[15%] h-[400px] w-[600px] rounded-full bg-blue-800/12 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 right-[5%] h-[300px] w-[400px] rounded-full bg-blue-900/10 blur-[80px]" />

      {/* Subtle blue dot grid on the right */}
      <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,rgba(59,130,246,0.06)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_50%_60%_at_85%_30%,black_5%,transparent_80%)]" />

      <div className="relative mx-auto w-full max-w-6xl">
        {/* Product brand row — fades out when header takes over */}
        <div
          className="mb-12 flex items-center gap-4 transition-opacity duration-500"
          style={{ opacity: sectionActive ? 0 : 1, pointerEvents: sectionActive ? 'none' : 'auto' }}
        >
          <span
            className="inline-flex h-14 w-14 shrink-0 overflow-visible"
            style={{ filter: 'hue-rotate(310deg) saturate(1.4) brightness(1.1)' }}
          >
            <AnimatedTentacleLogo className="h-[52px] w-[52px]" alt="OctopusFlow" />
          </span>
          <div>
            <p className="font-display text-xl font-black text-white">OctopusFlow</p>
          </div>
        </div>

        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Content */}
          <div id="octopusflow-content" className="reveal-on-scroll scroll-mt-24">
            <h2 className="font-display text-3xl font-black leading-[1.05] text-white sm:text-4xl lg:text-5xl">
              Presupuestos para{' '}
              <span className="text-blue-300">independientes</span>
            </h2>
            <p className="mt-5 max-w-lg text-lg text-white/55">
              Si trabajás por tu cuenta, OctopusFlow es tu herramienta. Creá presupuestos profesionales, mandáselos a tus clientes y cerrá más trabajos, sin complicaciones.
            </p>

            <ul className="mt-8 space-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-base text-white/65">
                  <span className="mt-0.5 shrink-0 font-bold text-blue-500">—</span>
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleWhatsApp}
                className="flex w-fit items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:scale-[1.02] hover:bg-blue-500"
              >
                Me interesa OctopusFlow
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="https://login-flow.octopustrack.shop"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-fit items-center justify-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/10 px-7 py-3.5 text-sm font-semibold text-blue-200 shadow-lg shadow-blue-950/20 transition-all duration-200 hover:scale-[1.02] hover:border-blue-300/45 hover:bg-blue-500/18 hover:text-white"
              >
                Probar demo 7 días
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* OctopusFlow screenshot */}
          <TiltCard
            tag="article"
            strength={7}
            className="reveal-on-scroll group relative overflow-hidden rounded-3xl border border-blue-500/15 shadow-2xl shadow-blue-950/40"
          >
            <div className="absolute -inset-px rounded-3xl bg-blue-600/10 blur-sm transition-opacity duration-500 group-hover:bg-blue-500/18" />
            <img
              src="/assets/octopusflow.png"
              alt="OctopusFlow — sistema de presupuestos"
              className="relative w-full rounded-3xl"
            />
          </TiltCard>
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
    <section id="contacto" className="relative overflow-hidden bg-[#07070f] px-4 py-24 sm:px-6 sm:py-32">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-primary-800/10 blur-[110px]" />

      <div className="relative mx-auto w-full max-w-xl">
        {status === 'sent' ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto mb-6 h-14 w-14 text-primary-400" />
            <h2 className="font-display text-3xl font-black text-white">Listo, te contactamos.</h2>
            <p className="mx-auto mt-4 max-w-sm text-base text-white/50">
              Revisá tu correo. Te respondemos con el plan que mejor se adapta a tu negocio.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-12 text-center">
              <h2 className="font-display text-3xl font-black text-white sm:text-4xl lg:text-5xl">
                ¿Querés saber más?{' '}
                <span className="text-primary-300">Escribinos.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-md text-base text-white/50">
                Dejanos tu correo y contanos qué necesita tu negocio. Te respondemos con el precio y el plan exacto para vos.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="cf-email" className="mb-2 block text-sm font-medium text-white/55">
                  Correo electrónico
                </label>
                <input
                  id="cf-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-primary-400 focus:bg-white/8 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="cf-message" className="mb-2 block text-sm font-medium text-white/55">
                  ¿Qué necesita tu negocio?
                </label>
                <textarea
                  id="cf-message"
                  rows={4}
                  placeholder="Ej: tengo una ferretería, cotizo todos los días y quiero manejar el stock y las cuentas corrientes..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-primary-400 focus:bg-white/8 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
                />
              </div>

              {status === 'error' && (
                <p className="text-sm text-red-400">
                  Algo salió mal. Intentá de nuevo o escribinos por{' '}
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="underline">WhatsApp</a>.
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full gap-2"
                isLoading={status === 'loading'}
                disabled={!isValid}
              >
                Enviar consulta
                <ArrowRight className="h-4 w-4" />
              </Button>

              <p className="text-center text-xs text-white/25">
                O escribinos directo por{' '}
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-primary-400 transition-colors hover:text-primary-300">
                  WhatsApp
                </a>
              </p>
            </form>
          </>
        )}
      </div>
    </section>
  )
}

// ========================================
// Footer
// ========================================
function Footer() {
  return (
    <footer id="contacto" className="border-t border-white/5 bg-[#080810] px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-6">
        <nav aria-label="Enlaces legales" className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <a
            href="/politicas-privacidad.html"
            className="text-white/60 underline underline-offset-4 transition-colors hover:text-white"
          >
            Política de privacidad
          </a>
          <span className="text-white/20" aria-hidden="true">
            •
          </span>
          <a
            href="/politicas-seguridad.html"
            className="text-white/60 underline underline-offset-4 transition-colors hover:text-white"
          >
            Política de seguridad
          </a>
        </nav>
        <p className="text-xs text-white/25">
          Contacto:{' '}
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-primary-400 transition-colors hover:text-primary-300">
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
function FloatingContactButton({ section = 'none' }: { section?: HeaderSection }) {
  const isBlue = section === 'flow'
  const isGreen = section === 'tool'
  const buttonChrome = isBlue
    ? 'border-blue-400/40 bg-blue-600 shadow-blue-500/25 hover:bg-blue-500'
    : isGreen
      ? 'border-tool-highlight/40 bg-tool-primary shadow-tool-primary/25 hover:bg-tool-accent'
      : 'border-primary-600/40 bg-primary-600 shadow-primary-700/25 hover:bg-primary-500'

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Comunicate con nosotros por WhatsApp"
      className={`fixed bottom-6 right-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border text-white shadow-xl transition-all duration-500 hover:scale-105 ${buttonChrome}`}
    >
        <MessageCircle className="h-5 w-5" />
    </a>
  )
}

// ========================================
// ThankYouPage — Premium after purchase
// ========================================
function ThankYouPage() {
  return (
    <div className="min-h-screen bg-[#080810]">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-12 sm:px-6">
        <section className="w-full rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-500/20">
            <CheckCircle2 className="h-8 w-8 text-primary-400" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-400">Pago confirmado</p>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Tu cotizador ya está listo</h1>
          <p className="mx-auto mt-4 max-w-lg text-base text-white/60">
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

          <div className="mt-10 rounded-xl bg-white/5 p-4">
            <p className="text-sm text-white/50">
              ¿Necesitás ayuda?{' '}
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-primary-400 underline hover:text-primary-300">
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
type HeaderSection = 'none' | 'tool' | 'track' | 'flow'

function useHeaderSection(): HeaderSection {
  const [section, setSection] = useState<HeaderSection>('none')

  useEffect(() => {
    const targets: Array<{ key: HeaderSection; element: HTMLElement | null }> = [
      { key: 'tool', element: document.getElementById('octopustool-content') },
      { key: 'flow', element: document.getElementById('octopusflow-content') },
      { key: 'track', element: document.getElementById('octopustrack-content') },
    ]

    if (targets.some(({ element }) => !element)) return

    let frame = 0

    const resolve = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const activationLine = Math.min(window.innerHeight * 0.28, 190)
        const activeTarget = targets.find(({ element }) => {
          const rect = element!.getBoundingClientRect()
          return rect.top <= activationLine && rect.bottom >= activationLine
        })

        setSection(activeTarget?.key ?? 'none')
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

function LandingContent({ loginUrl }: { loginUrl: string }) {
  useScrollReveal()
  useVisitorTracking()
  const headerSection = useHeaderSection()

  return (
    <>
      <Header loginUrl={loginUrl} section={headerSection} />
      <FloatingContactButton section={headerSection} />
      <main>
        <Hero />
        <ExcelOffer sectionActive={headerSection === 'tool'} />
        <OctopusFlowSection sectionActive={headerSection === 'flow'} />
        <OctopusTrackShowcase sectionActive={headerSection === 'track'} />
        <ContactForm />
      </main>
      <Footer />
    </>
  )
}

export default function Landing({ loginUrl = '/acceder' }: LandingProps) {
  const isThankYou = useMemo(() => shouldShowThankYou(), [])
  if (isThankYou) return <ThankYouPage />

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      <LandingContent loginUrl={loginUrl} />
    </div>
  )
}
