<template>
  <v-container style="max-width: 600px">
    <v-row>
      <v-col cols="12">
        <v-card rounded="lg" class="pb-4 frosted-glass">
          <v-row class="pt-4">
            <v-col cols="12" class="flex-center text-h4"> About Us </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" class="px-6">
              <p class="text-center mb-3">
                Neroli's Lab is a free, open source toolkit for Pokémon Sleep. We build simulations and calculators to
                help you get the most out of your team.
              </p>
              <p class="text-center mb-2">
                The project is open source and we welcome contributions. Discord is our main channel for communication,
                so that's the best place to reach us.
              </p>
              <div class="flex-center button-row mb-4">
                <v-btn
                  class="btn-github"
                  href="https://github.com/nerolis-lab/nerolis-lab"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GithubIcon class="mr-2" />
                  GitHub
                </v-btn>
                <v-btn
                  class="btn-discord"
                  href="https://discord.gg/ndzTXRHWzK"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <DiscordIcon class="mr-2" />
                  Discord
                </v-btn>
              </div>

              <p class="text-center mb-2">
                Running the servers behind Neroli's Lab isn't free. If you'd like to help keep the lights on, consider
                supporting us on Patreon; every bit helps!
              </p>
              <div class="flex-center mb-4">
                <v-btn
                  class="btn-patreon"
                  href="https://www.patreon.com/nerolislab"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <PatreonIcon class="mr-2" />
                  Patreon
                </v-btn>
              </div>

              <p class="text-center mb-2">
                None of this would be possible without the people who help build and support Neroli's Lab; see everyone
                who's contributed on our Credits page.
              </p>
              <div class="flex-center">
                <v-btn color="primary" to="/credits">
                  <v-icon icon="mdi-account-heart" class="mr-2" />
                  View Credits
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import DiscordIcon from '@/components/icons/icon-discord.vue'
import GithubIcon from '@/components/icons/icon-github.vue'
import PatreonIcon from '@/components/icons/icon-patreon.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AboutPage',
  components: { GithubIcon, DiscordIcon, PatreonIcon }
})
</script>

<style lang="scss" scoped>
.button-row {
  flex-wrap: wrap;
  gap: 12px;
}

.btn-github {
  background-color: $github;
}

.btn-discord {
  background-color: $discord;
}

.btn-patreon {
  background-color: $patreon;
}
</style>
