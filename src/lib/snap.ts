import { useEffect } from 'react'

// Gentle snap scrolling on the pages made of screen-sized parts (20 Oct, Prateek: "not in reading pages but in home
// screen and other info screens"): the homepage and Pricing. "proximity", not "mandatory": the page settles on a part
// only when a scroll stops near its top, and never fights a scroll through a long part. Reading pages (Tonight, What
// you know, the Shelf, a handbook, a chapter, the policy pages) never snap. Off under reduce motion.
export function useSnapPage(topPad: string) {
  useEffect(() => {
    let still = false
    try { still = window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch { /* snap */ }
    if (still) return
    const html = document.documentElement
    html.classList.add('snap-page')
    html.style.setProperty('--snap-pad', topPad)
    return () => { html.classList.remove('snap-page'); html.style.removeProperty('--snap-pad') }
  }, [topPad])
}
