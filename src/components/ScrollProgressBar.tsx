import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.registerPlugin(ScrollTrigger)

    gsap.to(bar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0,
        id: 'scroll-progress-bar',
      },
    })

    return () => ScrollTrigger.getById('scroll-progress-bar')?.kill()
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] h-[2px]" aria-hidden="true">
      <div
        ref={barRef}
        className="h-full origin-left scale-x-0 bg-primary-400"
        style={{ willChange: 'transform' }}
      />
    </div>
  )
}
