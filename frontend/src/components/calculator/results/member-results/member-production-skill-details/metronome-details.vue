<template>
  <v-row no-gutters class="flex-center pb-1 mx-3">
    <v-col cols="auto" class="flex-center flex-nowrap pb-1">
      <v-badge
        id="skillLevelBadge"
        :content="`Lv.${member.pokemonInstance.skillLevel}`"
        location="bottom center"
        color="subskillWhite"
        rounded="pill"
      >
        <v-img
          :src="mainskillImage(member.pokemonInstance.pokemon)"
          height="40px"
          width="40px"
        ></v-img>
      </v-badge>
      <div class="ml-2">
        <div class="flex-center">
          <span class="font-weight-medium text-center">{{
            MathUtils.round(member.skillProcs * timeWindowFactor, 1)
          }}</span>
          <v-img src="/images/misc/skillproc.png" height="28" width="28"></v-img>
        </div>
      </div>
    </v-col>

    <v-col cols="auto" class="flex-center flex-column">
      <div class="flex-center">
        <span class="font-weight-light font-italic text-no-wrap text-center"> *more coming </span>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { StrengthService } from '@/services/strength/strength-service'
import { mainskillImage } from '@/services/utils/image-utils'
import { useTeamStore } from '@/stores/team/team-store'
import type { MemberInstanceProductionExt } from '@/types/member/instanced'
import { MathUtils } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  props: {
    member: {
      type: Object as PropType<MemberInstanceProductionExt>,
      required: true
    }
  },
  setup() {
    const teamStore = useTeamStore()
    return { teamStore, MathUtils, mainskillImage }
  },
  computed: {
    timeWindowFactor() {
      return StrengthService.timeWindowFactor(this.teamStore.timeWindow)
    }
  }
})
</script>
