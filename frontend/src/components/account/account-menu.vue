<template>
  <v-menu v-model="menu" :close-on-content-click="false" location="bottom" width="250px">
    <template #activator="{ props }">
      <v-btn icon v-bind="props">
        <v-avatar size="36" color="background">
          <img
            v-if="loggedIn"
            :src="user.picture"
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
              v-if="loggedIn"
              :src="user.picture"
              alt="User Profile Picture"
              style="width: 100%; height: 100%; object-fit: cover"
            />
            <v-icon v-else size="48">mdi-account-circle</v-icon>
          </v-avatar>

          <h6 class="text-h6">{{ user.name }}</h6>
        </v-col>

        <v-divider />

        <v-list>
          <v-list-item :to="'/profile'" :disabled="!loggedIn" prepend-icon="mdi-account-box"
            >Profile</v-list-item
          >
          <v-list-item :to="'/settings'" :disabled="!loggedIn" prepend-icon="mdi-cog"
            >Settings</v-list-item
          >
        </v-list>

        <v-divider />

        <v-list>
          <v-list-item v-if="!loggedIn">
            <GoogleLogin :callback="callback" style="width: 100%">
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
          <v-list-item v-else prepend-icon="mdi-logout" @click="logout"> Log out </v-list-item>
        </v-list>
      </v-card>
    </v-container>
  </v-menu>
</template>

<script lang="ts">
import GoogleIcon from '@/components/icons/icon-google.vue'
import router from '@/router/router'
import { GoogleService } from '@/services/login/google-service'
import type { DecodedUserData, LoginResponse } from 'sleepapi-common'
import { defineComponent } from 'vue'
import type { CallbackTypes } from 'vue3-google-login'
import { GoogleLogin, decodeCredential, googleLogout } from 'vue3-google-login'

export default defineComponent({
  name: 'AccountMenu',
  components: {
    GoogleLogin,
    GoogleIcon
  },
  data: () => ({
    menu: false,
    loggedIn: false,
    user: {
      picture: '',
      name: 'Guest',
      email: '',
      id: ''
    }
  }),
  async mounted() {
    const expiryDate = localStorage.getItem('expiry_date')

    if (expiryDate) {
      try {
        const idToken = localStorage.getItem('id_token')
        if (!idToken) {
          throw new Error('Missing id-token, logging out user')
        }
        const userData: DecodedUserData = decodeCredential(idToken) as DecodedUserData

        if (Date.now() > +expiryDate) {
          const refresh_token = localStorage.getItem('refresh_token')
          const { access_token, expiry_date } = await GoogleService.refresh(refresh_token!) // we force here so we fail and logout if missing
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('expiry_date', '' + expiry_date)
        }
        this.updateUserData(userData)
      } catch {
        this.logout()
      }
    } else {
      this.logout()
    }
  },
  methods: {
    async callback(response: CallbackTypes.CodePopupResponse) {
      const authCode = response.code
      if (authCode) {
        try {
          const loginResponse: LoginResponse = await GoogleService.login(authCode)

          localStorage.setItem('access_token', loginResponse.access_token)
          localStorage.setItem('refresh_token', loginResponse.refresh_token)
          localStorage.setItem('expiry_date', '' + loginResponse.expiry_date)
          localStorage.setItem('id_token', loginResponse.id_token)

          const userData: DecodedUserData = decodeCredential(
            loginResponse.id_token
          ) as DecodedUserData
          this.updateUserData(userData)
        } catch {
          this.logout()
        }
      }
    },
    updateUserData(userData: DecodedUserData) {
      this.loggedIn = true
      this.user = {
        picture: userData.picture,
        name: userData.given_name,
        email: userData.email,
        id: userData.sub
      }
    },
    logout() {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('deviceId')
      localStorage.removeItem('expiryDate')
      localStorage.removeItem('idToken')

      this.loggedIn = false
      this.user = {
        picture: '',
        name: 'Guest',
        email: '',
        id: ''
      }

      googleLogout()
      router.push('/')
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/colors';
</style>
