<template>
  <v-row no-gutters class="flex-center pb-1 mx-2">
    <v-col cols="auto" class="flex-center flex-nowrap">
      <v-badge
        id="skillLevelBadge"
        :content="`Lv.${memberWithProduction.member.skillLevel}`"
        location="bottom center"
        color="subskillWhite"
        rounded="pill"
      >
        <v-img :src="mainskillImage(memberWithProduction.member.pokemon)" height="40px" width="40px"></v-img>
      </v-badge>
      <div class="ml-2">
        <div class="flex-center">
          <span class="font-weight-medium text-center">{{
            MathUtils.round(memberWithProduction.production.skillProcs * timeWindowFactor, 1)
          }}</span>
          <v-img src="/images/misc/skillproc.png" max-height="28" max-width="28px"></v-img>
        </div>
        <div class="flex-left">
          <span class="font-weight-light text-body-2 text-no-wrap font-italic text-center"
            >x{{ skillValuePerProc }}
          </span>
          <v-img src="/images/unit/help.png" height="20" width="20"></v-img>
          <span class="font-weight-light text-body-2 text-no-wrap font-italic text-center"
            >x{{ teamStore.getTeamSize }}
          </span>
          <v-img src="/images/misc/human.png" height="20" width="20"></v-img>
        </div>
      </div>
    </v-col>

    <v-col cols="auto" class="flex-center flex-column">
      <div class="flex-center">
        <span class="font-weight-medium text-no-wrap text-center ml-1"> {{ totalSkillValue }} total helps </span>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { StrengthService } from '@/services/strength/strength-service'
import { mainskillImage } from '@/services/utils/image-utils'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import type { MemberProductionExt } from '@/types/member/instanced'
import { MathUtils, compactNumber, mainskill } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  props: {
    memberWithProduction: {
      type: Object as PropType<MemberProductionExt>,
      required: true
    }
  },
  setup() {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    return { teamStore, pokemonStore, MathUtils, mainskillImage }
  },
  computed: {
    skillValuePerProc() {
      const { count } = this.teamStore.getCurrentTeam.members.reduce(
        (accumulator, cur) => {
          if (cur) {
            const memberPokemon = this.pokemonStore.getPokemon(cur)?.pokemon
            if (
              memberPokemon?.berry.name === this.memberWithProduction.member.pokemon.berry.name &&
              !accumulator.names.has(memberPokemon.name)
            ) {
              accumulator.names.add(memberPokemon.name)
              accumulator.count += 1
            }
          }
          return accumulator
        },
        { count: 0, names: new Set<string>() }
      )
      const uniqueHelps =
        mainskill.HELPER_BOOST_UNIQUE_BOOST_TABLE[count - 1][this.memberWithProduction.member.skillLevel - 1]
      return (
        this.memberWithProduction.member.pokemon.skill.amount(this.memberWithProduction.member.skillLevel) + uniqueHelps
      )
    },
    totalSkillValue() {
      return compactNumber(
        StrengthService.skillValue({
          skill: this.memberWithProduction.member.pokemon.skill,
          amount: this.memberWithProduction.production.skillAmount,
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
