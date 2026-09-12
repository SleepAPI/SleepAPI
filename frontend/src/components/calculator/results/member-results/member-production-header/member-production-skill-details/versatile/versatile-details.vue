<template>
  <v-row no-gutters class="flex-center pb-1 mx-3">
    <v-col cols="auto" class="flex-center flex-nowrap pb-1">
      <v-badge
        id="skillLevelBadge"
        :content="
          skillLevelBadgeText(memberWithProduction.production.skillLevel, memberWithProduction.member.skillLevel)
        "
        location="bottom center"
        color="subskillWhite"
        rounded="pill"
      >
        <v-img
          :src="mainskillImage(memberWithProduction.member.pokemon)"
          height="40px"
          width="40px"
          :alt="`Versatile level ${memberWithProduction.production.skillLevel}`"
          title="Versatile"
        ></v-img>
      </v-badge>
      <div class="ml-2 flex-center">
        <v-img src="/images/misc/candy.png" height="20" width="20" alt="candy" title="candy"></v-img>
        <span class="font-weight-medium text-no-wrap text-center ml-1">unknown</span>
      </div>
    </v-col>

    <v-col cols="auto" class="flex-center">
      <span class="font-weight-medium text-center versatile-note">
        Proc rates are unknown, so this skill is not yet implemented
      </span>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { mainskillImage } from '@/services/utils/image-utils'
import { skillLevelBadgeText } from '@/services/utils/skill-display-utils'
import type { MemberWithProduction } from '@/types/member/instanced'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  props: {
    memberWithProduction: {
      type: Object as PropType<MemberWithProduction>,
      required: true
    }
  },
  setup() {
    return { skillLevelBadgeText, mainskillImage }
  }
})
</script>
