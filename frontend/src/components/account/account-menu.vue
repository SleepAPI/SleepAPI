<template>
  <v-menu v-model="menu" :close-on-content-click="false" location="bottom">
    <template #activator="{ props }">
      <v-btn icon="mdi-account-circle" v-bind="props"></v-btn>
    </template>

    <v-container class="account-menu-container">
      <v-card min-width="300">
        <v-col cols="12" class="text-center">
          <v-avatar size="72" color="#333333" class="mb-2">
            <v-icon size="48">mdi-account-circle</v-icon>
          </v-avatar>

          <h6 class="text-h6">Guest</h6>
        </v-col>

        <v-divider />

        <v-list>
          <v-list-item to="/profile" prepend-icon="mdi-account-box"> Profile </v-list-item>

          <v-list-item to="/settings" prepend-icon="mdi-cog">Settings </v-list-item>
        </v-list>

        <v-divider />

        <v-list>
          <v-list-item>
            <v-card
              append-icon="mdi-open-in-new"
              class="my-1 text-center"
              href="https://github.com/sleepapi/sleepapi/"
              rel="noopener"
              target="_blank"
              title="??? on GitHub"
              rounded="xl"
              color="#181717"
            >
              <template #prepend> <GithubIcon /> </template>
            </v-card>
          </v-list-item>

          <v-list-item>
            <v-card
              append-icon="mdi-open-in-new"
              class="my-1 text-center"
              href="https://discord.gg/w97qFff8n4/"
              rel="noopener"
              target="_blank"
              title="??? on Discord"
              rounded="xl"
              color="#5865f2"
            >
              <template #prepend> <DiscordIcon /> </template>
            </v-card>
          </v-list-item>
        </v-list>
      </v-card>
    </v-container>
  </v-menu>
</template>

<script lang="ts">
import DiscordIcon from '@/components/icons/icon-discord.vue'
import GithubIcon from '@/components/icons/icon-github.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AccountMenu',
  components: { DiscordIcon, GithubIcon },
  data: () => ({
    fav: true,
    menu: false,
    message: false,
    hints: true
  })
})
</script>

<style lang="scss" scoped>
@import '@/assets/colors';
</style>
