import { useEffect } from 'react'

/**
 * useScrollReveal — IntersectionObserver hook that triggers outside-to-inside scroll animations.
 * Observes all elements marked with [data-reveal].
 * Options:
 * - data-reveal="left" | "right" | "bottom" | "top" | "scale" | "tilt-card"
 * - data-delay="100" (ms delay for staggered cascades)
 */
export function useScrollReveal(dependencies = []) {
  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]')
    if (!elements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = parseInt(entry.target.getAttribute('data-delay') || 0, 10)
            if (delay > 0) {
              setTimeout(() => {
                entry.target.classList.add('revealed')
              }, Math.min(delay, 200))
            } else {
              requestAnimationFrame(() => {
                entry.target.classList.add('revealed')
              })
            }
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.02,
        rootMargin: '120px 0px 40px 0px',
      }
    )

    elements.forEach((el) => {
      // If already has revealed class, unobserve
      if (!el.classList.contains('revealed')) {
        observer.observe(el)
      }
    })

    return () => observer.disconnect()
  }, dependencies)
}
export default useScrollReveal
