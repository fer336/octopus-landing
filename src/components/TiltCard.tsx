import { useEffect, useRef, type CSSProperties } from 'react'

// 3D perspective tilt on hover — wraps any content
export default function TiltCard({
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
  style?: CSSProperties
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
