import { useEffect, useState } from 'react'
import { Menu, X, MessageCircle, Sun, Moon } from 'lucide-react'
import AnimatedTentacleLogo from './ui/AnimatedTentacleLogo'

const WHATSAPP_URL = 'https://wa.me/5492254596618'

type ThemeMode = 'light' | 'night'
type HeaderSection = 'none' | 'track'

function scrollToId(
  id: string,
  event?: { preventDefault?: () => void },
  desktopOffset = 90,
  mobileOffset = 82,
) {
  event?.preventDefault?.()
  const element = document.getElementById(id)
  if (!element) return

  const offset = window.innerWidth >= 768 ? desktopOffset : mobileOffset
  const top = element.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' })
}

export default function Header({ section = 'none' }: { section?: HeaderSection }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const onToggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('octopustrack-theme', next ? 'night' : 'light')
  }

  const theme: ThemeMode = isDark ? 'night' : 'light'

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
              <span className="relative z-10 text-xs font-mono text-muted-foreground/60 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-muted-foreground">
                0{index + 1}
              </span>
              <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-primary/70 transition-transform duration-500 group-hover:scale-x-100" />
            </a>
          ))}
          <a
            href="/octopusflow"
            className="group relative flex items-center justify-between overflow-hidden rounded-xl border border-border/70 bg-card/70 px-4 py-3 text-sm font-medium text-muted-foreground shadow-lg shadow-background/30 transition-all duration-500 hover:-translate-y-0.5 hover:border-border hover:bg-card hover:text-foreground"
          >
            <span className="relative z-10 flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-primary transition-transform duration-300 group-hover:scale-150" />
              OctopusFlow
            </span>
            <span className="relative z-10 font-mono text-xs text-muted-foreground/60">Nuevo</span>
          </a>
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
