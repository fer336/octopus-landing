import { useEffect, useState, type ButtonHTMLAttributes, type HTMLAttributes } from 'react'
import { Magnet } from 'lucide-react'

export interface MagnetParticle {
  id: number
  x: number
  y: number
}

export interface MagnetizeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  particleCount?: number
  attractRadius?: number
}

export interface MagnetizeCardProps extends HTMLAttributes<HTMLDivElement> {
  particleCount?: number
  attractRadius?: number
}

export function createMagnetParticles(particleCount: number, attractRadius: number): MagnetParticle[] {
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

export function MagnetizeButton({
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
  const [particles, setParticles] = useState<MagnetParticle[]>([])

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

export function MagnetizeCard({
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
  const [particles, setParticles] = useState<MagnetParticle[]>([])

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
