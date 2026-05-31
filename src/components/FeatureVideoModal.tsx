import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import gsap from 'gsap'

export interface FeatureVideoItem {
  label: string
  icon: React.ComponentType<{ className?: string }>
  /** URL del video. Si no está, muestra placeholder "Próximamente" */
  videoUrl?: string
}

interface FeatureVideoModalProps {
  feature: FeatureVideoItem | null
  onClose: () => void
}

export default function FeatureVideoModal({ feature, onClose }: FeatureVideoModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!feature || !cardRef.current) return

    document.body.style.overflow = 'hidden'

    const tl = gsap.timeline()

    // Backdrop fade
    tl.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: 'power2.out' },
      0
    )

    // Magic lamp card entry: scale up from center with elastic bounce
    tl.fromTo(
      cardRef.current,
      { scale: 0.5, opacity: 0, y: 60 },
      { scale: 1, opacity: 1, y: 0, duration: 0.65, ease: 'back.out(1.7)' },
      0.05
    )

    // Subtle glow pulse
    if (glowRef.current) {
      tl.fromTo(
        glowRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' },
        0.1
      )
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feature?.label])

  const handleClose = () => {
    if (!cardRef.current || !overlayRef.current) {
      onClose()
      return
    }

    // Reverse animation for exit
    gsap.to(cardRef.current, {
      scale: 0.5,
      opacity: 0,
      y: 60,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: onClose,
    })
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.2,
    })
    if (glowRef.current) {
      gsap.to(glowRef.current, { opacity: 0, duration: 0.15 })
    }
  }

  if (!feature) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#05070a]/85 px-4 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === overlayRef.current) handleClose()
      }}
    >
      {/* Ambient glow behind card */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute h-[500px] w-[500px] rounded-full bg-primary-500/10 blur-[100px]"
      />

      <div
        ref={cardRef}
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#0d0f1a] shadow-2xl shadow-black/60"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-black/50 p-2 text-white/50 backdrop-blur-sm transition-colors hover:border-white/20 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Video or placeholder */}
        {feature.videoUrl ? (
          <video
            key={feature.label}
            src={feature.videoUrl}
            controls
            autoPlay
            playsInline
            className="w-full aspect-video"
          />
        ) : (
          /* Placeholder — no video yet */
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#0a0c14] to-[#080a10]">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <feature.icon className="h-7 w-7 text-primary-400/50" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-white/30">Video en preparación</p>
              <p className="mt-1 text-sm text-white/15">{feature.label}</p>
            </div>
          </div>
        )}

        {/* Footer label */}
        <div className="border-t border-white/5 px-6 py-4">
          <p className="text-sm font-medium text-white/70">{feature.label}</p>
        </div>
      </div>
    </div>
  )
}
