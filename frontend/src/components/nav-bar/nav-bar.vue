<template>
  <v-app-bar>
    <template #prepend>
      <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    </template>

    <template #append>
      <AccountMenu>
        <template #activator="{ props }">
          <v-btn>
            <v-icon v-bind="props">mdi-account-circle</v-icon>
          </v-btn>
        </template>
      </AccountMenu>
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
