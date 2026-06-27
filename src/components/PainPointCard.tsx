import { useEffect, useRef, useState } from 'react'
import { TextDisperse } from './ui/text-disperse'
import { MagnetizeCard, createMagnetParticles, type MagnetParticle } from './MagnetizeCta'

export default function PainPointCard({
  pain,
}: {
  pain: { icon: React.ComponentType<{ className?: string }>; title: string; description: string }
}) {
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
        <span
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 block h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30 opacity-0 blur-2xl transition-opacity duration-500"
          style={{ opacity: isBursting ? 0.85 : 0 }}
        />
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
        <h3 className="min-w-0 text-lg font-medium leading-relaxed text-foreground transition-transform duration-300 group-hover:translate-x-0.5">
          <TextDisperse className="w-full gap-x-1" dispersed={!hasOrdered}>{pain.title}</TextDisperse>
        </h3>
        <p className="mt-auto pt-4 text-sm leading-relaxed text-muted-foreground">{pain.description}</p>
      </MagnetizeCard>
    </div>
  )
}
