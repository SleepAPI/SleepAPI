<template>
  <v-menu v-model="menu" :close-on-content-click="false" location="bottom" width="250px">
    <template #activator="{ props }">
      <v-btn v-bind="props" id="navBarIcon" icon>
        <v-avatar size="36" color="background">
          <img
            v-if="userStore.loggedIn"
            :src="`/images/avatar/${userStore.avatar}.png`"
            alt="User Profile Picture"
            style="width: 100%; height: 100%; object-fit: cover"
          />
          <v-icon v-else size="36">mdi-account-circle</v-icon>
        </v-avatar>
      </v-btn>
    </template>

    <v-container class="account-menu-container">
      <v-card>
        <v-col cols="auto" class="text-center">
          <v-avatar size="72" color="background" class="mb-2">
            <img
              v-if="userStore.loggedIn"
              :src="`/images/avatar/${userStore.avatar}.png`"
              alt="User Profile Picture"
              style="width: 100%; height: 100%; object-fit: cover"
            />
            <v-icon v-else size="48">mdi-account-circle</v-icon>
          </v-avatar>

          <h6 class="text-h6">{{ userStore.name }}</h6>
        </v-col>

        <v-divider />

        <v-list>
          <v-list-item
            :to="'/profile'"
            :disabled="!userStore.loggedIn"
            prepend-icon="mdi-account-box"
            @click="toggleMenu"
            >Profile</v-list-item
          >
          <v-list-item
            :to="'/settings'"
            :disabled="!userStore.loggedIn"
            prepend-icon="mdi-cog"
            @click="toggleMenu"
            >Settings</v-list-item
          >
        </v-list>

        <v-divider />

        <v-list>
          <v-list-item v-if="!userStore.loggedIn">
            <GoogleLogin :callback="callback" style="width: 100%">
              <!-- should not hard code color -->
              <v-card
                title="Login"
                class="text-center"
                rounded="xl"
                color="#181717"
                style="cursor: pointer"
              >
                <template #prepend>
                  <GoogleIcon class="icon-24" />
                </template>
                <template #append>
                  <v-icon size="24">mdi-open-in-new</v-icon>
                </template>
              </v-card>
            </GoogleLogin>
          </v-list-item>
          <v-list-item v-else id="logoutButton" prepend-icon="mdi-logout" @click="logout">
            Log out
          </v-list-item>
        </v-list>
      </v-card>
    </v-container>
  </v-menu>
</template>

<script lang="ts">
import GoogleIcon from '@/components/icons/icon-google.vue'
import { useUserStore } from '@/stores/user-store'
import { defineComponent } from 'vue'
import type { CallbackTypes } from 'vue3-google-login'
import { GoogleLogin } from 'vue3-google-login'

export default defineComponent({
  name: 'AccountMenu',
  components: {
    GoogleLogin,
    GoogleIcon
  },
  setup() {
    const userStore = useUserStore()
    return { userStore }
  },
  data: () => ({
    menu: false
  }),
  methods: {
    async callback(response: CallbackTypes.CodePopupResponse) {
      const authCode = response.code
      if (authCode) {
        try {
          await this.userStore.login(authCode)
        } catch {
          this.logout()
        }
      }
    },
    logout() {
      this.userStore.logout()
      this.toggleMenu()
    },
    toggleMenu() {
      this.menu = !this.menu
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/colors';
</style>
