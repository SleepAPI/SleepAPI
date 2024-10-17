<template>
  <template v-if="isMobile">
    <div
      v-if="pokemonInstance"
      id="mobile-layout"
      class="team-slot-container fill-height"
      style="position: relative"
    >
      <div class="card-wrapper fill-height">
        <v-card
          :loading="teamStore.getMemberLoading(memberIndex)"
          :class="[
            'fill-height',
            'rounded-b-0',
            teamStore.getCurrentMember === pokemonInstance.externalId && teamStore.tab === 'members'
              ? 'bg-surface'
              : 'frosted-glass'
          ]"
          @click="openDetailsDialog"
        >
          <div
            class="text-center vertical-text"
            style="position: absolute; top: 0%; width: 100%; height: 100%"
          >
            {{ pokemonInstance.name }}
          </div>
          <v-img :src="imageUrl" class="pokemon-image" style="left: 10%" />

          <div style="position: absolute; bottom: 0%; width: 100%">
            <v-card
              class="text-center responsive-text rounded-t-0"
              color="subskillGold"
              location="bottom center"
            >
              {{ subskillBadge }}
            </v-card>
          </div>
        </v-card>

        <v-card class="text-center responsive-text level-card" rounded="lg" color="primary">
          {{ level }}
        </v-card>
      </div>
    </div>
    <div v-else class="d-flex w-100 fill-height transparent">
      <v-card class="d-flex w-100 fill-height frosted-glass" @click="openDetailsDialog">
        <v-icon size="48" color="secondary" class="fill-height w-100 frosted-text">mdi-plus</v-icon>
      </v-card>
    </div>
  </template>

  <!-- desktop layout -->
  <template v-else>
    <v-card
      v-if="pokemonInstance"
      id="desktop-layout"
      :loading="teamStore.getMemberLoading(memberIndex)"
      :class="['fill-height', currentMemberSelected ? 'bg-surface' : 'frosted-glass']"
      :style="[`minHeight: '14dvh'`]"
      @click="openDetailsDialog"
    >
      <v-row
        class="flex-bottom fill-height"
        no-gutters
        :style="['position: absolute', 'bottom: 0', 'width: 50%']"
      >
        <v-col v-for="(subskill, i) in supportSubskills" :key="i">
          <v-card
            :color="rarityColor(subskill.subskill)"
            height="20px"
            :style="[`opacity: ${subskill.level > pokemonInstance.level ? '40%' : ''}`]"
            class="text-body-2 text-center"
          >
            {{ subskill.subskill.shortName }}
          </v-card>
        </v-col>
      </v-row>
      <v-row class="flex-top fill-height" no-gutters>
        <v-col v-if="isLeader && teamStore.tab !== 'members'" cols="6">
          <SpeechBubble :pokemon-instance="pokemonInstance">
            <template #body-text>
              <span class="text-black text-left text-body-2 font-weight-light">
                {{ speechBubbleText }}
              </span>
            </template>
          </SpeechBubble>
        </v-col>
        <v-row v-else no-gutters class="flex-start flex-column w-50 fill-height">
          <v-row no-gutters class="flex-nowrap">
            <v-col cols="auto">
              <v-card class="flex-center rounded-e-0 px-2" color="secondary" elevation="0">
                Lv.{{ pokemonInstance.level }}
              </v-card>
            </v-col>
            <v-col>
              <v-card
                class="flex-center rounded-s-0 font-weight-medium"
                :color="pokemonInstance.pokemon.specialty"
                elevation="0"
              >
                {{ pokemonInstance.name }}
              </v-card>
            </v-col>
          </v-row>
        </v-row>
        <v-col cols="6">
          <v-img :src="imageUrl" />
          <v-card
            v-if="isLeader && teamStore.tab !== 'members'"
            class="text-center leader-card"
            rounded="lg"
            color="primary"
          >
            Leader
          </v-card>
        </v-col>
      </v-row>
    </v-card>
    <v-card
      v-else
      class="d-flex w-100 fill-height frosted-glass"
      style="min-height: 14dvh"
      @click="openDetailsDialog"
    >
      <v-icon size="48" color="secondary" class="fill-height w-100 frosted-text">mdi-plus</v-icon>
    </v-card>
  </template>

  <PokemonSlotMenu
    v-model:show="showTeamSlotDialog"
    :pokemon-from-pre-exist="pokemonInstance"
    :full-team="fullTeam"
    @update-pokemon="updateTeamMember"
    @duplicate-pokemon="duplicateTeamMember"
    @toggle-saved-pokemon="toggleSavedState"
    @remove-pokemon="removeTeamMember"
  />
</template>

<script lang="ts">
import PokemonSlotMenu from '@/components/pokemon-input/menus/pokemon-slot-menu.vue'
import SpeechBubble from '@/components/speech-bubble/speech-bubble.vue'
import { useViewport } from '@/composables/viewport-composable'
import { rarityColor } from '@/services/utils/color-utils'
import { avatarImage, pokemonImage } from '@/services/utils/image-utils'
import { useTeamStore } from '@/stores/team/team-store'
import { MAX_TEAM_MEMBERS } from '@/types/member/instanced'
import { subskill, type PokemonInstanceExt } from 'sleepapi-common'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TeamSlot',
  components: {
    PokemonSlotMenu,
    SpeechBubble
  },
  props: {
    memberIndex: {
      type: Number,
      required: true
    }
  },
  setup() {
    const teamStore = useTeamStore()

    const { isMobile } = useViewport()

    return { teamStore, isMobile, rarityColor }
  },
  data: () => ({
    showTeamSlotDialog: false
  }),
  computed: {
    pokemonInstance() {
      return this.teamStore.getPokemon(this.memberIndex)
    },
    currentMemberSelected() {
      return (
        this.teamStore.getCurrentMember === this.pokemonInstance?.externalId &&
        this.teamStore.tab === 'members'
      )
    },
    isLeader() {
      return this.teamStore.getCurrentTeam.members.at(0) === this.pokemonInstance?.externalId
    },
    speechBubbleText() {
      return 'You can find our production in the members tab'
    },
    imageUrl(): string {
      if (!this.pokemonInstance) return ''

      return this.isMobile
        ? pokemonImage({
            pokemonName: this.pokemonInstance.pokemon.name,
            shiny: this.pokemonInstance.shiny
          })
        : avatarImage({
            pokemonName: this.pokemonInstance.pokemon.name,
            shiny: this.pokemonInstance.shiny,
            happy: this.currentMemberSelected
          })
    },
    level() {
      if (this.pokemonInstance) {
        return `Level ${this.pokemonInstance.level}`
      } else return ''
    },
    supportSubskills() {
      return (
        this.pokemonInstance?.subskills.filter((s) =>
          [
            subskill.HELPING_BONUS.name.toLowerCase(),
            subskill.ENERGY_RECOVERY_BONUS.name.toLowerCase()
          ].includes(s.subskill.name.toLowerCase())
        ) ?? []
      )
    },
    erb() {
      const pokemonInstance = this.pokemonInstance
      return (
        pokemonInstance &&
        pokemonInstance.subskills.some(
          (s) =>
            s.subskill.name.toLowerCase() === subskill.ENERGY_RECOVERY_BONUS.name.toLowerCase() &&
            s.level <= pokemonInstance.level
        )
      )
    },
    hb() {
      const pokemonInstance = this.pokemonInstance
      return (
        pokemonInstance &&
        pokemonInstance.subskills.some(
          (s) =>
            s.subskill.name.toLowerCase() === subskill.HELPING_BONUS.name.toLowerCase() &&
            s.level <= pokemonInstance.level
        )
      )
    },
    subskillBadge() {
      const subskills = []
      if (this.hb) {
        subskills.push('HB')
      }
      if (this.erb) {
        subskills.push('ERB')
      }
      return subskills.join(' + ')
    },
    fullTeam() {
      return this.teamStore.getTeamSize === MAX_TEAM_MEMBERS
    }
  },
  methods: {
    openDetailsDialog() {
      this.showTeamSlotDialog = true
    },
    updateTeamMember(pokemonInstance: PokemonInstanceExt) {
      this.teamStore.updateTeamMember(pokemonInstance, this.memberIndex)
    },
    duplicateTeamMember() {
      this.teamStore.duplicateMember(this.memberIndex)
    },
    removeTeamMember() {
      this.teamStore.removeMember(this.memberIndex)
    },
    async toggleSavedState(state: boolean) {
      const pokemonToUpdate = this.pokemonInstance
      if (!pokemonToUpdate) {
        console.error("Can't find Pokémon to save")
        return
      }
      this.teamStore.updateTeamMember({ ...pokemonToUpdate, saved: state }, this.memberIndex)
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/main';

.card-wrapper {
  position: relative;
  padding-top: 5px;
}

.pokemon-image {
  width: 100%;
  height: 100%;
  transform: scale(1.5);
  left: 10%;
}

.vertical-text {
  color: rgba(white, 0.8) !important;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  white-space: nowrap;
  text-align: center;
}

.level-card {
  position: absolute;
  top: 0px;
  left: 5%;
  width: 90%;
  white-space: nowrap;
}

.leader-card {
  position: absolute;
  top: 0px;
  left: 50%;
  width: 50%;
  white-space: nowrap;
}
</style>
