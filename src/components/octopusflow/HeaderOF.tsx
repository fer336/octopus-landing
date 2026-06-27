import { useEffect, useRef, useState } from 'react'
import { Menu, X, MessageCircle, Sun, Moon } from 'lucide-react'
import gsap from 'gsap'

const WHATSAPP_URL = 'https://wa.me/5492254596618'
const OCTOPUSFLOW_CHECKOUT_API = '/api/octopusflow-checkout'

type ThemeMode = 'light' | 'night'

function scrollToId(id: string, event?: { preventDefault?: () => void }) {
  event?.preventDefault?.()
  const element = document.getElementById(id)
  if (!element) return
  const offset = window.innerWidth >= 768 ? 90 : 82
  const top = element.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' })
}

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

function PurchaseButtonInline({
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

export default function HeaderOF({
  theme,
  onToggleTheme,
}: {
  theme: ThemeMode
  onToggleTheme: () => void
}) {
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
          <PurchaseButtonInline
            source="octopusflow-header"
            className={`hidden rounded-lg px-4 sm:inline-flex items-center justify-center gap-2 py-1.5 text-sm font-semibold shadow-lg transition-all duration-500 hover:scale-[1.03] ${activeButton}`}
          >
            Obtener OctopusFlow
          </PurchaseButtonInline>
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
          <a
            href="/"
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
          </a>
          <PurchaseButtonInline
            source="octopusflow-mobile-menu"
            className="relative mt-2 flex items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-3 text-center text-sm font-semibold shadow-lg transition-all duration-500 hover:-translate-y-0.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Obtener OctopusFlow
          </PurchaseButtonInline>
        </nav>
      </div>
    </header>
  )
}
