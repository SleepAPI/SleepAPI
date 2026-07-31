<template>
  <v-row no-gutters class="flex-center pb-1">
    <v-col cols="auto" class="flex-center flex-nowrap mx-4">
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
          :alt="`Lunar Blessing (Energy for Everyone) level ${effectiveSkillLevel}`"
          title="Lunar Blessing (Energy for Everyone)"
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
          <span class="font-weight-light text-body-2 text-no-wrap font-italic text-center mr-1"
            >x{{ energyPerProc }}</span
          >
          <v-img src="/images/unit/energy.png" height="20" width="20" alt="energy" title="energy"></v-img>
          <span class="font-weight-light text-body-2 text-no-wrap font-italic text-center pl-1"
            >x{{ teamStore.getTeamSize }}
          </span>
          <v-img src="/images/misc/human.png" height="20" width="20" alt="teammates" title="teammates"></v-img>
        </div>
        <div class="flex-left">
          <span class="per-proc-amount font-weight-light text-body-2 text-no-wrap font-italic text-center mr-1"
            >x{{ selfBerriesPerProc }}</span
          >
          <v-img
            :src="berryImage(memberWithProduction.member.pokemon.berry)"
            height="20"
            width="20"
            alt="berries"
            title="berries"
          ></v-img>
        </div>
        <div class="flex-left">
          <span class="per-proc-amount font-weight-light text-body-2 text-no-wrap font-italic text-center mr-1"
            >x{{ teamBerriesPerProc }}</span
          >
          <v-img src="/images/berries/berries.png" height="20" width="20" alt="berries" title="berries"></v-img>
          <span class="font-weight-light text-body-2 text-no-wrap font-italic text-center ml-1 mr-1"
            >x{{ teamStore.getTeamSize - 1 }}
          </span>
          <v-img src="/images/misc/human.png" height="20" width="20" alt="teammates" title="teammates"></v-img>
        </div>
      </div>
    </v-col>

    <v-col cols="auto" class="flex-center flex-column">
      <div class="flex-center">
        <v-img src="/images/unit/energy.png" height="20" width="20" alt="energy" title="energy"></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-1"> {{ totalEnergy }} total</span>
      </div>
      <div class="flex-center">
        <v-img
          :src="berryImage(memberWithProduction.member.pokemon.berry)"
          height="20"
          width="20"
          :alt="`${berryName} berries`"
          :title="`${berryName} berries`"
        ></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-2"> {{ skillValueSelf }} {{ berryName }}</span>
      </div>
      <div class="flex-center">
        <v-img
          src="/images/berries/berries.png"
          height="20"
          width="20"
          alt="miscellaneous berries"
          title="berries"
        ></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-2"> {{ skillValueTeam }} other </span>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { berryImage, mainskillImage } from '@/services/utils/image-utils'
import { skillLevelBadgeText } from '@/services/utils/skill-display-utils'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import type { MemberProductionExt } from '@/types/member/instanced'
import { EnergyForEveryoneSLunarBlessing, MathUtils, compactNumber, uniqueMembersWithBerry } from 'sleepapi-common'
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
    return { teamStore, pokemonStore, skillLevelBadgeText, MathUtils, mainskillImage, berryImage }
  },
  computed: {
    effectiveSkillLevel() {
      return this.memberWithProduction.production.skillLevel
    },
    baseSkillLevel() {
      return this.memberWithProduction.member.skillLevel
    },
    berryName() {
      return this.memberWithProduction.member.pokemon.berry.name.toLowerCase()
    },
    energyPerProc() {
      return EnergyForEveryoneSLunarBlessing.activations.energy.amount({ skillLevel: this.effectiveSkillLevel })
    },
    uniqueSameTypeMembers() {
      return uniqueMembersWithBerry({
        berry: this.memberWithProduction.member.pokemon.berry,
        members: this.teamStore.getCurrentTeam.members
          .filter(Boolean)
          .map((member) => this.pokemonStore.getPokemon(member!)!.pokemon)
      })
    },
    selfBerriesPerProc() {
      return EnergyForEveryoneSLunarBlessing.activations.selfBerries.amount({
        skillLevel: this.effectiveSkillLevel,
        extra: this.uniqueSameTypeMembers
      })
    },
    teamBerriesPerProc() {
      return EnergyForEveryoneSLunarBlessing.activations.teamBerries.amount({
        skillLevel: this.effectiveSkillLevel,
        extra: this.uniqueSameTypeMembers
      })
    },
    totalEnergy() {
      return compactNumber(this.memberWithProduction.production.skillAmount * this.timeWindowFactor)
    },
    skillValueSelf() {
      const amount =
        this.memberWithProduction.production.produceFromSkill.berries.find(
          (b) =>
            b.berry.name === this.memberWithProduction.member.pokemon.berry.name &&
            b.level === this.memberWithProduction.member.level
        )?.amount ?? 0
      return compactNumber(amount * this.timeWindowFactor)
    },
    skillValueTeam() {
      const amount = this.memberWithProduction.production.produceFromSkill.berries.reduce(
        (sum, cur) =>
          sum +
          (cur.berry.name !== this.memberWithProduction.member.pokemon.berry.name ||
          cur.level !== this.memberWithProduction.member.level
            ? cur.amount
            : 0),
        0
      )
      return compactNumber(amount * this.timeWindowFactor)
    },

    timeWindowFactor() {
      return this.teamStore.timeWindowFactor
    }
  }
})
</script>
