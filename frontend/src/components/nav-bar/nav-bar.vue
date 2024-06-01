<template>
  <v-app-bar color="background">
    <template #prepend>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer">
        <v-icon size="36">mdi-menu</v-icon>
      </v-app-bar-nav-icon>
    </template>

    <v-app-bar-title>{{ $route.name }}</v-app-bar-title>

    <template #append>
      <AccountMenu />
    </template>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" temporary>
    <v-list nav>
      <v-list-item prepend-icon="mdi-home" title="Home" to="/"></v-list-item>
      <v-list-item prepend-icon="mdi-calculator" title="Calculator" to="/calculator"></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import AccountMenu from '@/components/account/account-menu.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TheNavBar',
  components: {
    AccountMenu
  },
  data: () => ({
    drawer: false
  })
})
</script>

<style lang="scss" scoped>
@import '@/assets/colors';
</style>
