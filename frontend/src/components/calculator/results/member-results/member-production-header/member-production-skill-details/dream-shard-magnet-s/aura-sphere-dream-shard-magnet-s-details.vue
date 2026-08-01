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
          :alt="`Dream Shard Magnet S level ${effectiveSkillLevel}`"
          title="Dream Shard Magnet S"
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
            >x{{ localizeNumber(shardsPerProc) }}</span
          >
          <v-img src="/images/unit/shard.png" height="20" width="20" alt="dream shards" title="dream shards"></v-img>
        </div>
        <div class="flex-left">
          <span class="font-weight-light text-body-2 text-no-wrap font-italic text-center mr-1"
            >x{{ localizeNumber(strengthPerProc) }}</span
          >
          <v-img src="/images/unit/strength.png" height="20" width="20" alt="strength" title="strength"></v-img>
        </div>
      </div>
    </v-col>

    <v-col cols="auto" class="flex-center flex-column">
      <div class="flex-center">
        <v-img src="/images/unit/shard.png" height="20" width="20" alt="dream shards" title="dream shards"></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-1"> {{ totalShards }} total</span>
      </div>
      <div class="flex-center">
        <v-img src="/images/misc/strength.png" height="20" width="20" alt="strength" title="strength"></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-1"> {{ totalStrength }} total</span>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { mainskillImage } from '@/services/utils/image-utils'
import { skillLevelBadgeText } from '@/services/utils/skill-display-utils'
import { useTeamStore } from '@/stores/team/team-store'
import type { MemberWithProduction } from '@/types/member/instanced'
import { DreamShardMagnetSAuraSphere, MathUtils, compactNumber, localizeNumber } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  props: {
    memberWithProduction: {
      type: Object as PropType<MemberWithProduction>,
      required: true
    }
  },
  setup() {
    const teamStore = useTeamStore()
    return { teamStore, skillLevelBadgeText, MathUtils, mainskillImage, localizeNumber }
  },
  computed: {
    effectiveSkillLevel() {
      return this.memberWithProduction.production.skillLevel
    },
    baseSkillLevel() {
      return this.memberWithProduction.member.skillLevel
    },
    shardsPerProc() {
      return DreamShardMagnetSAuraSphere.activations.dreamShards.amount({ skillLevel: this.effectiveSkillLevel })
    },
    strengthPerProc() {
      return DreamShardMagnetSAuraSphere.activations.strength.amount({ skillLevel: this.effectiveSkillLevel })
    },
    totalShards() {
      return compactNumber(
        this.memberWithProduction.production.skillValue['dream shards'].amountToSelf * this.timeWindowFactor
      )
    },
    totalStrength() {
      return compactNumber(
        this.memberWithProduction.production.skillValue.strength.amountToSelf * this.timeWindowFactor
      )
    },
    timeWindowFactor() {
      return this.teamStore.timeWindowFactor
    }
  }
})
</script>
