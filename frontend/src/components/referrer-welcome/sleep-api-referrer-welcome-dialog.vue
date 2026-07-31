<template>
  <v-dialog v-model="showDialog" max-width="560" scrollable>
    <v-card>
      <div class="header">
        <img class="doctor" :src="'/images/home-page/doctor-home.png'" alt="" />
        <div class="titles">
          <v-card-title class="title">Welcome to Neroli's Lab</v-card-title>
          <v-card-subtitle class="subtitle">Thanks for coming over from Sleep API!</v-card-subtitle>
        </div>
      </div>
      <v-card-text class="body">
        <p class="mb-3">
          Neroli's Lab is the successor to the Sleep API website. Here is a quick map of where things live:
        </p>
        <ul class="pl-4 mb-3">
          <li>
            <strong><router-link class="simple" to="/calculator/">Calculator</router-link></strong
            >: simulate berry, ingredient, and skill production.
          </li>
          <li>
            <strong><router-link class="simple" to="/compare/">Compare</router-link></strong
            >: compare Pokémon side by side.
          </li>
          <li>
            <strong><router-link class="simple" to="/recipes/">Recipes</router-link></strong
            >: browse dishes and set your recipe levels
          </li>
          <li>
            <strong><router-link class="simple" to="/tier-lists/">Tier lists</router-link></strong
            >: just like in Sleep API.
          </li>
        </ul>
        <p class="text-strength mb-3"><strong>You can optionally log in to save your teams and settings!</strong></p>
        <p class="mb-3">
          Need help or want to influence what we build next? Chat on
          <a class="simple" href="https://discord.gg/ndzTXRHWzK" target="_blank" rel="noopener noreferrer">Discord</a>
          or use our
          <a class="simple" href="https://feedback.nerolislab.com" target="_blank" rel="noopener noreferrer"
            >feedback site</a
          >.
        </p>
      </v-card-text>
      <v-card-actions class="justify-end px-4 pb-4">
        <v-checkbox
          v-model="dontShowAgain"
          hide-details
          density="compact"
          color="primary"
          label="Don't show this welcome again"
          class="hide-message"
        ></v-checkbox>
        <v-btn color="primary" variant="flat" @click="closeWelcome">Got it</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import {
  SLEEP_API_REFERRER_QUERY_KEY,
  SLEEP_API_SUPPRESS_MESSAGE_KEY,
  isSleepApiReferrerQuery
} from '@/utils/referrer/sleep-api-referrer-utils'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const showDialog = ref(false)
const dontShowAgain = ref(false)

function isOptedOutForever(): boolean {
  if (typeof localStorage === 'undefined') {
    return false
  }
  try {
    return localStorage.getItem(SLEEP_API_SUPPRESS_MESSAGE_KEY) === '1'
  } catch {
    return false
  }
}

function tryOpenDialog(): void {
  if (!isSleepApiReferrerQuery(route.query)) {
    return
  }
  if (isOptedOutForever()) {
    showDialog.value = false
    stripReferrerFromUrl()
    return
  }
  showDialog.value = true
  stripReferrerFromUrl()
}

function stripReferrerFromUrl(): void {
  const nextQuery = { ...route.query }
  delete nextQuery[SLEEP_API_REFERRER_QUERY_KEY]
  void router.replace({ path: route.path, query: nextQuery })
}

function persistOptOutIfRequested(): void {
  if (!dontShowAgain.value || typeof localStorage === 'undefined') {
    return
  }
  try {
    localStorage.setItem(SLEEP_API_SUPPRESS_MESSAGE_KEY, '1')
  } catch {
    // can fail during private browsing
  }
}

function closeWelcome(): void {
  showDialog.value = false
}

onMounted(() => {
  tryOpenDialog()
})

watch(
  () => route.query[SLEEP_API_REFERRER_QUERY_KEY],
  () => {
    tryOpenDialog()
  }
)

watch(showDialog, (visible) => {
  if (visible) {
    dontShowAgain.value = false
    return
  }
  persistOptOutIfRequested()
})
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 16px 0;
}

.doctor {
  flex-shrink: 0;
  width: 88px;
  height: auto;
  max-height: 104px;
  object-fit: contain;
}

.title.v-card-title {
  padding: 0;
  text-align: left;
  text-wrap: wrap;
  white-space: normal;
  line-height: 1.35;
  font-size: 20px !important; //override Vuetify's adaptive font size

  @media (min-width: 500px) {
    font-size: 24px !important;
  }
}

.body,
.hide-message {
  font-family: 'Roboto', sans-serif;
}

.subtitle {
  padding: 4px 0 0;
  white-space: normal;
}
</style>
