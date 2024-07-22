<template>
  <v-row>
    <v-col cols="12">
      <v-card class="d-flex flex-column">
        <v-tabs-window v-model="tab" class="flex-grow-1">
          <v-tabs-window-item v-for="(member, index) in members" :key="index" :value="index">
            <v-card-text style="white-space: pre-wrap" class="text-center">
              <div>{{ prettifiedMemberBerries(member) }}</div>
              <div>{{ prettifiedMemberIngredients(member) }}</div>
              <div>{{ prettifiedSkillProcs(member) }}</div>
            </v-card-text>
          </v-tabs-window-item>
        </v-tabs-window>

        <v-tabs v-model="tab" fixed-tabs stacked density="compact" class="custom-tab">
          <v-tab v-for="(member, index) in members" :key="index" :value="index">
            <img
              :src="getMemberImage(member.member.pokemon.name)"
              alt="Pokemon Tab Image"
              class="tab-image"
            />
          </v-tab>
        </v-tabs>
      </v-card>
    </v-col>
  </v-row>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import type { MemberProductionExt } from '@/types/member/instanced'
import { MathUtils, prettifyIngredientDrop } from 'sleepapi-common'
export default defineComponent({
  name: 'TeamResults',
  setup() {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    return { teamStore, pokemonStore }
  },
  data: () => ({
    tab: null
  }),
  computed: {
    members() {
      return this.teamStore.getCurrentTeam.production?.members ?? []
    }
  },
  methods: {
    getMemberImage(name: string) {
      return `/images/pokemon/${name.toLowerCase()}.png`
    },
    prettifiedMemberBerries(member: MemberProductionExt) {
      return `Berries: ${MathUtils.round(member.berries?.amount ?? 0, 1)} ${member.berries?.berry.name}`
    },
    prettifiedMemberIngredients(member: MemberProductionExt) {
      return `Ingredients: ${prettifyIngredientDrop(member.ingredients)}`
    },
    prettifiedSkillProcs(member: MemberProductionExt) {
      const skillValue = MathUtils.round(
        member.skillProcs * member.member.pokemon.skill.amount[member.member.skillLevel - 1],
        1
      )
      return `Skill procs: ${member.skillProcs} x ${member.member.pokemon.skill.amount[member.member.skillLevel - 1]} = ${skillValue} ${member.member.pokemon.skill.unit}`
    }
  }
})
</script>

<style lang="scss">
.custom-tab .v-tab__slider {
  top: 0;
}

.tab-image {
  height: 64px;
  width: 64px;
}
</style>
