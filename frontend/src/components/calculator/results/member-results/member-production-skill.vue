<template>
  <v-card color="surface" rounded="xl" class="fill-height d-flex flex-column">
    <v-row no-gutters class="flex-center">
      <v-col cols="12" class="flex-center text-h6 text-skill font-weight-medium"> Skill </v-col>
    </v-row>

    <v-row no-gutters class="flex-center fill-height flex-nowrap px-1">
      <v-col cols="auto" class="flex-center">
        <v-badge
          id="skillLevelBadge"
          :content="`Lv.${parsedMember.pokemonInstance.skillLevel}`"
          location="bottom center"
          color="subskillWhite"
          rounded="pill"
        >
          <v-img
            :src="mainskillImage(parsedMember.pokemonInstance.pokemon)"
            height="40px"
            width="40px"
          ></v-img>
        </v-badge>
      </v-col>
      <v-col cols="auto" class="flex-left flex-column">
        <div class="flex-center">
          <span class="text-h6 font-weight-medium text-center">{{
            MathUtils.round(parsedMember.skillProcs * timeWindowFactor, 1)
          }}</span>
          <v-img src="/images/misc/skillproc.png" height="28" width="28"></v-img>
        </div>
        <div class="flex-left">
          <span class="font-weight-light text-body-2 font-italic text-center mr-1"
            >x{{ currentSkillValue }}</span
          >
          <v-img src="/images/misc/ingredients.png" height="20" width="20"></v-img>
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { StrengthService } from '@/services/strength/strength-service'
import { mainskillImage } from '@/services/utils/image-utils'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import type { MemberProductionExt } from '@/types/member/instanced'
import { MathUtils, compactNumber } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'MemberProductionSkill',
  props: {
    member: {
      type: Object as PropType<MemberProductionExt>,
      required: true
    }
  },
  setup() {
    const pokemonStore = usePokemonStore()
    const teamStore = useTeamStore()
    return { pokemonStore, teamStore, MathUtils, mainskillImage }
  },
  computed: {
    // TODO: this is reparsed 3 times, in member-results, header and skill components
    parsedMember() {
      const pokemonInstance = this.pokemonStore.getPokemon(this.member.memberExternalId)!
      return {
        ...this.member,
        pokemonInstance
      }
    },
    currentSkillValue() {
      return compactNumber(
        StrengthService.skillValue({
          skill: this.parsedMember.pokemonInstance.pokemon.skill,
          amount: this.parsedMember.skillAmount,
          timeWindow: this.teamStore.timeWindow
        })
      )
    },
    timeWindowFactor() {
      return StrengthService.timeWindowFactor(this.teamStore.timeWindow)
    }
  }
})
</script>
