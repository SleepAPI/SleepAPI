import { phrases } from '@/composables/use-random-phrase/phrases'
import type { nature } from 'sleepapi-common'
import { onMounted, onUnmounted, ref } from 'vue'

export function useRandomPhrase() {
  const randomPhrase = ref<string>('')
  const fullPhrase = ref<string>('')
  let typingInterval: number | null = null
  let previousPhrase = ''
  let typingIndex = 0

  const getRandomPhrase = (nature: nature.Nature) => {
    const naturePhrases = phrases[nature.name]
    if (!naturePhrases) {
      fullPhrase.value = '...'
    } else {
      let newPhrase = ''
      do {
        newPhrase = naturePhrases[Math.floor(Math.random() * naturePhrases.length)]
      } while (newPhrase === previousPhrase)
      previousPhrase = newPhrase
      fullPhrase.value = newPhrase
    }
    randomPhrase.value = ''
    typingIndex = 0
    startTypingAnimation()
  }

  const startTypingAnimation = () => {
    if (typingInterval) {
      clearInterval(typingInterval)
      typingInterval = null
    }

    typingInterval = window.setInterval(() => {
      if (typingIndex < fullPhrase.value.length) {
        randomPhrase.value += fullPhrase.value[typingIndex]
        typingIndex++
      } else {
        clearInterval(typingInterval!)
        typingInterval = null
      }
    }, 15)
  }

  const handleVisibilityChange = () => {
    if (!document.hidden && typingIndex < fullPhrase.value.length) {
      startTypingAnimation()
    }
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    if (typingInterval) {
      clearInterval(typingInterval)
    }
  })

  return {
    randomPhrase,
    getRandomPhrase
  }
}
