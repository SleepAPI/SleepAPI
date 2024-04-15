<template>
  <v-app>
    <v-container id="section1" class="blue-bg" :style="{ height: appHeight }">
      <v-row class="fill-height align-center justify-center">
        <SneaselHomeIcon style="height: 200px; width: 200px"></SneaselHomeIcon>
        <v-btn large @click="scrollTo('section2')">Scroll Down</v-btn>
      </v-row>
    </v-container>

    <v-container id="section2" class="green-bg" :style="{ height: appHeight }">
      <v-row class="fill-height align-center justify-center">
        <v-btn large color="white" @click="scrollTo('section3')">Scroll Down</v-btn>
      </v-row>
    </v-container>

    <v-container id="section3" class="purple-bg" :style="{ height: appHeight }">
      <v-row class="fill-height align-center justify-center">
        <v-btn large color="white" @click="scrollTo('section1')">To the top </v-btn>
      </v-row>
    </v-container>
  </v-app>
</template>

<script lang="ts">
import SneaselHomeIcon from '@/components/icons/sneasel-home-icon.vue'
import { defineComponent, nextTick, onMounted, ref } from 'vue'

export default defineComponent({
  components: {
    SneaselHomeIcon
  },
  setup() {
    const appHeight = ref('100vh')
    const navbarHeight = ref(0)

    onMounted(async () => {
      await nextTick() // Ensures that all rendering is flushed and the DOM is updated.
      const navbar = document.querySelector('.v-app-bar')
      if (navbar) {
        navbarHeight.value = navbar.clientHeight // Updates navbar height.
        appHeight.value = `calc(100vh - ${navbarHeight.value}px)` // Adjust the section heights.
        console.log('Navbar height:', navbarHeight.value) // Log navbar height for debugging.
      }
    })

    const scrollTo = (elementId: string) => {
      nextTick(() => {
        // Ensures we are calculating positions after any reactive updates.
        const element = document.getElementById(elementId)
        if (element) {
          const yOffset = -navbarHeight.value // Negative offset for the navbar height.
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
          window.scrollTo({ top: y, behavior: 'smooth' }) // Perform the scroll.
        }
      })
    }

    return { appHeight, scrollTo }
  }
})
</script>

<style lang="scss">
body,
#app {
  margin: 0;
  padding: 0;
  height: 100%;
}
html {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.v-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Ensure full height rows are correctly styled */
.fill-height {
  height: 100%;
}

.align-center {
  align-items: center; /* Align items vertically center */
}

.justify-center {
  justify-content: center; /* Align items horizontally center */
}

.blue-bg {
  background-color: #2196f3;
}
.green-bg {
  background-color: #4caf50;
}
.purple-bg {
  background-color: #9c27b0;
}
</style>
