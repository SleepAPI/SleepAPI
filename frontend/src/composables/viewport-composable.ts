import { onMounted, onUnmounted, ref } from 'vue'

export function useViewport() {
  const isMobile = ref(window.innerWidth < 1000)
  const viewportWidth = ref(window.innerWidth)

  function update() {
    viewportWidth.value = window.innerWidth
    isMobile.value = window.innerWidth < 1000
  }

  onMounted(() => window.addEventListener('resize', update))
  onUnmounted(() => window.removeEventListener('resize', update))

  return { isMobile, viewportWidth }
}
