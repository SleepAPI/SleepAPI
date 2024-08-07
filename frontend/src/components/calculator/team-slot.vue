<template>
  <div v-if="pokemonInstance" class="w-100 fill-height transparent">
    <v-card
      :loading="teamStore.getMemberLoading(memberIndex)"
      class="w-100 fill-height frosted-glass rounded-b-0"
      @click="openDetailsDialog"
    >
      <div
        class="text-center vertical-text"
        style="position: absolute; top: 0%; width: 100%; height: 100%"
      >
        {{ pokemonInstance.name }}
      </div>
      <v-img :src="imageUrl" class="pokemon-image" />

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

    <v-card
      class="text-center responsive-text"
      rounded="lg"
      style="position: absolute; top: 0%; width: 80%"
      color="primary"
      location="top center"
    >
      {{ level }}
    </v-card>
  </div>
  <div v-else class="d-flex w-100 fill-height transparent">
    <v-card class="d-flex w-100 fill-height frosted-glass" @click="openDetailsDialog">
      <v-icon size="48" color="secondary" class="fill-height w-100 frosted-text">mdi-plus</v-icon>
    </v-card>
  </div>

  <TeamSlotMenu
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
import TeamSlotMenu from '@/components/pokemon-input/menus/pokemon-slot-menu.vue'
import { useTeamStore } from '@/stores/team/team-store'
import { MAX_TEAM_MEMBERS } from '@/types/member/instanced'
import { subskill, type PokemonInstanceExt } from 'sleepapi-common'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TeamSlot',
  components: {
    TeamSlotMenu
  },
  props: {
    memberIndex: {
      type: Number,
      required: true
    }
  },
  setup() {
    const teamStore = useTeamStore()
    return { teamStore }
  },
  data: () => ({
    showTeamSlotDialog: false
  }),
  computed: {
    pokemonInstance() {
      return this.teamStore.getPokemon(this.memberIndex)
    },
    imageUrl(): string | undefined {
      return this.pokemonInstance
        ? `/images/pokemon/${this.pokemonInstance.pokemon.name.toLowerCase()}.png`
        : ''
    },
    level() {
      if (this.pokemonInstance) {
        return `Level ${this.pokemonInstance.level}`
      } else return ''
    },
    erb() {
      return (
        this.pokemonInstance?.subskills &&
        this.pokemonInstance.subskills.some(
          (s) => s.subskill.name.toLowerCase() === subskill.ENERGY_RECOVERY_BONUS.name.toLowerCase()
        )
      )
    },
    hb() {
      return (
        this.pokemonInstance?.subskills &&
        this.pokemonInstance.subskills.some(
          (s) => s.subskill.name.toLowerCase() === subskill.HELPING_BONUS.name.toLowerCase()
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

.transparent {
  background: rgba($surface, 0) !important;
}

.pokemon-image {
  width: 100%;
  height: 100%;
  transform: scale(1.5);
  left: 10%;
}

.vertical-text {
  color: rgba(white, 0.6) !important;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  white-space: nowrap;
  text-align: center;
}
</style>
