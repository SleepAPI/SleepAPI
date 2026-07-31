<template>
  <v-row no-gutters class="flex-center pb-1 mx-2">
    <v-col cols="auto" class="flex-center flex-nowrap">
      <v-badge
        id="skillLevelBadge"
        :content="skillLevelBadgeText(effectiveSkillLevel, baseSkillLevel)"
        location="bottom center"
        color="subskillWhite"
        rounded="pill"
      >
        <v-img
          :src="mainskillImage(memberWithProduction.member.pokemon)"
          height="40px"
          width="40px"
          :alt="`Helper Boost level ${effectiveSkillLevel}`"
          title="Helper Boost"
        ></v-img>
      </v-badge>
      <div class="ml-2">
        <div class="flex-center">
          <span class="font-weight-medium text-center">{{
            MathUtils.round(memberWithProduction.production.skillProcs * timeWindowFactor, 1)
          }}</span>
          <v-img
            src="/images/misc/skillproc.png"
            height="24"
            width="24"
            alt="skill activations"
            title="skill activations"
          ></v-img>
        </div>
        <div class="flex-left">
          <span class="font-weight-light text-body-2 text-no-wrap font-italic text-center"
            >x{{ skillValuePerProc }}
          </span>
          <v-img src="/images/unit/help.png" height="20" width="20" alt="Pokemon helps" title="Pokemon helps"></v-img>
          <span class="font-weight-light text-body-2 text-no-wrap font-italic text-center"
            >x{{ teamStore.getTeamSize }}
          </span>
          <v-img src="/images/misc/human.png" height="20" width="20" alt="teammates" title="teammates"></v-img>
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
import { mainskillImage } from '@/services/utils/image-utils'
import { skillLevelBadgeText } from '@/services/utils/skill-display-utils'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import type { MemberProductionExt } from '@/types/member/instanced'
import { compactNumber, HelperBoost, MathUtils, uniqueMembersWithBerry } from 'sleepapi-common'
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
    return { teamStore, skillLevelBadgeText, pokemonStore, MathUtils, mainskillImage }
  },
  computed: {
    effectiveSkillLevel() {
      return this.memberWithProduction.production.skillLevel
    },
    baseSkillLevel() {
      return this.memberWithProduction.member.skillLevel
    },
    skillValuePerProc() {
      const count = uniqueMembersWithBerry({
        berry: this.memberWithProduction.member.pokemon.berry,
        members: this.teamStore.getCurrentTeam.members
          .filter(Boolean)
          .map((member) => this.pokemonStore.getPokemon(member!)!.pokemon)
      })
      return HelperBoost.getHelps(this.effectiveSkillLevel, count)
    },
    totalSkillValue() {
      return compactNumber(this.memberWithProduction.production.skillAmount * this.timeWindowFactor)
    },
    timeWindowFactor() {
      return this.teamStore.timeWindowFactor
    }
  }
})
</script>
