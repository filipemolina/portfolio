import type { Ref } from 'vue'

/**
 * Animates an element's height between its current rendered size and its
 * post-mutation size, capped at `maxHeight()` (the element keeps its own
 * overflow-y-auto for content taller than the cap). Respects
 * prefers-reduced-motion by skipping straight to the end state.
 */
export function useAutoHeightTransition(el: Ref<HTMLElement | null>, maxHeight: () => number) {
  async function animate(mutate: () => void) {
    const node = el.value
    if (!node) {
      mutate()
      return
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const startHeight = node.getBoundingClientRect().height

    mutate()
    await nextTick()

    // scrollHeight reports the element's own explicit height (not its content's
    // natural size) whenever that height is larger than the content — which is
    // exactly the shrink case (e.g. `clear`). Measure with height cleared.
    const priorHeight = node.style.height
    node.style.height = 'auto'
    const naturalHeight = node.scrollHeight
    node.style.height = priorHeight

    const endHeight = Math.min(naturalHeight, maxHeight())

    if (reduceMotion) {
      node.style.height = `${endHeight}px`
      return
    }

    node.style.height = `${startHeight}px`
    void node.offsetHeight // force reflow so the transition has a start point
    node.style.transition = 'height 420ms cubic-bezier(0.16, 1, 0.3, 1)'

    requestAnimationFrame(() => {
      node.style.height = `${endHeight}px`
    })

    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName !== 'height') return
      node.style.transition = ''
      node.removeEventListener('transitionend', onEnd)
    }
    node.addEventListener('transitionend', onEnd)
  }

  return { animate }
}
