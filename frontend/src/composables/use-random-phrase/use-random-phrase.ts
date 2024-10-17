import { phrases } from '@/composables/use-random-phrase/phrases'
import type { nature } from 'sleepapi-common'
import { onMounted, onUnmounted, ref } from 'vue'

export function useRandomPhrase() {
  const randomPhrase = ref<string>('')
  const fullPhrase = ref<string>('')
  let typingInterval: number | null = null
  let previousPhrase = ''

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
    startTypingAnimation()
  }

  const startTypingAnimation = () => {
    let index = 0

    if (typingInterval) {
      clearInterval(typingInterval)
    }

    typingInterval = window.setInterval(() => {
      if (index < fullPhrase.value.length) {
        randomPhrase.value += fullPhrase.value[index]
        index++
      } else {
        clearInterval(typingInterval!)
      }
    }, 15)
  }

  const handleVisibilityChange = () => {
    if (!document.hidden && fullPhrase.value) {
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
