<template>
  <div ref="coin" class="coin" @click="spinCoin()">
    <div class="heads"></div>
    <div class="tails"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from 'vue'

export default defineComponent({
  name: 'SneaselHomeIcon',
  setup() {
    const coin = ref<HTMLElement | null>(null)
    let intervalId: number | null = null
    let currentRotation = 0

    const spinCoin = (speed = 1, isUserInitiated = false) => {
      if (coin.value) {
        if (isUserInitiated) {
          const randomFullRotations = Math.floor(Math.random() * 10)
          currentRotation += randomFullRotations * 360 + 180
        } else {
          currentRotation += 540
        }

        coin.value.style.transition = `transform ${speed}s ease-in-out`
        coin.value.style.transform = `rotateY(${currentRotation}deg)`
      }
    }

    const autoSpin = () => {
      spinCoin(0.5)
    }

    onMounted(() => {
      intervalId = window.setInterval(autoSpin, 10000)
    })

    onUnmounted(() => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    })

    return {
      coin,
      spinCoin: () => spinCoin(1, true)
    }
  }
})
</script>

<style lang="scss">
.coin {
  height: 300px;
  width: 300px;
  text-align: center;
  transform-style: preserve-3d;
  outline: none;
  position: relative;
  cursor: pointer;
  perspective: 1000px;
}

.heads,
.tails {
  position: absolute;
  height: 100%;
  width: 100%;
  backface-visibility: hidden;
}

.heads {
  background: url('/images/site/home-doctor.png') no-repeat center center;
  background-size: contain;
}

.tails {
  background: url('/images/site/home-sneasel.png') no-repeat center center;
  background-size: contain;
  transform: rotateY(180deg);
}
</style>
