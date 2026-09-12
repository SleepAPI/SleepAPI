<template>
  <template v-if="isMobile">
    <div v-if="pokemonInstance" id="mobile-layout" class="fill-height" style="position: relative">
      <div class="card-wrapper fill-height">
        <v-card
          :loading="teamStore.getMemberLoading(memberIndex)"
          :class="[
            'fill-height',
            'rounded-b-0',
            teamStore.getCurrentMember === pokemonInstance.externalId &&
            teamStore.tab === 'members' &&
            memberIndex === teamStore.getCurrentTeam.memberIndex
              ? 'bg-surface'
              : 'frosted-glass'
          ]"
          @click="openFilledSlotActions(pokemonInstance)"
        >
          <div class="text-center vertical-text" style="position: absolute; top: 0%; width: 100%; height: 100%">
            {{ pokemonInstance.name }}
          </div>
          <v-img :src="imageUrl" class="pokemon-image" style="left: 10%" />

          <div style="position: absolute; bottom: 0%; width: 100%">
            <v-card class="text-center text-x-small rounded-t-0" color="subskillGold" location="bottom center">
              {{ subskillBadge }}
            </v-card>
          </div>
        </v-card>

        <v-card class="text-center text-x-small level-card" rounded="lg" color="primary">
          {{ level }}
        </v-card>
      </div>
    </div>
    <template v-else>
      <v-card class="fill-height frosted-glass" @click="openPokemonSearch">
        <v-icon size="48" color="secondary" class="fill-height w-100">mdi-plus</v-icon>
      </v-card>
    </template>
  </template>

  <!-- desktop layout -->
  <template v-else>
    <!-- only seem to be able to solve the same height for pokemon slot and empty is with max 14dvh here and 75 dvh in team-section -->
    <v-card
      v-if="pokemonInstance"
      id="desktop-layout"
      :loading="teamStore.getMemberLoading(memberIndex)"
      :class="['fill-height', currentMemberSelected ? 'bg-surface' : 'frosted-glass']"
      style="max-height: 14dvh"
      @click="openFilledSlotActions(pokemonInstance)"
    >
      <v-row class="flex-bottom fill-height" no-gutters :style="['position: absolute', 'bottom: 0', 'width: 50%']">
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
          <v-img :src="imageUrl" style="aspect-ratio: 1 / 1" />
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
    <v-card v-else class="fill-height frosted-glass" @click="openPokemonSearch">
      <v-icon size="48" color="secondary" class="fill-height w-100">mdi-plus</v-icon>
    </v-card>
  </template>
</template>

<script lang="ts">
import SpeechBubble from '@/components/speech-bubble/speech-bubble.vue'
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { rarityColor } from '@/services/utils/color-utils'
import { avatarImage, pokemonImage } from '@/services/utils/image-utils'
import { useDialogStore } from '@/stores/dialog-store/dialog-store'
import { useTeamStore } from '@/stores/team/team-store'
import { MAX_TEAM_SIZE, subskill, type PokemonInstance } from 'sleepapi-common'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TeamSlot',
  components: {
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
    const dialogStore = useDialogStore()

    const { isMobile } = useBreakpoint()

    return { teamStore, dialogStore, isMobile, rarityColor }
  },
  computed: {
    pokemonInstance() {
      return this.teamStore.getPokemon(this.memberIndex)
    },
    currentMemberSelected() {
      return this.teamStore.getCurrentMember === this.pokemonInstance?.externalId && this.teamStore.tab === 'members'
    },
    isLeader() {
      return this.memberIndex === 0 && this.teamStore.getCurrentTeam.members.at(0) === this.pokemonInstance?.externalId
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
          [subskill.HELPING_BONUS.name.toLowerCase(), subskill.ENERGY_RECOVERY_BONUS.name.toLowerCase()].includes(
            s.subskill.name.toLowerCase()
          )
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
      return this.teamStore.getTeamSize === MAX_TEAM_SIZE
    }
  },
  methods: {
    openFilledSlotActions(pokemonInstance: PokemonInstance) {
      this.dialogStore.openFilledSlot(pokemonInstance, this.fullTeam, {
        onUpdate: (pokemonInstance: PokemonInstance) => {
          this.updateTeamMember(pokemonInstance)
        },
        onDuplicate: () => {
          this.duplicateTeamMember()
        },
        onToggleSaved: (state) => {
          this.toggleSavedState(state)
        },
        onRemove: () => {
          this.removeTeamMember()
        }
      })
    },
    openPokemonSearch() {
      this.dialogStore.openPokemonSearch((pokemonInstance: PokemonInstance) => {
        this.updateTeamMember(pokemonInstance)
      })
    },
    updateTeamMember(pokemonInstance: PokemonInstance) {
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
