<template>
  <v-row class="align-stretch flex-top flex-nowrap" dense>
    <v-col>
      <v-card color="surface" rounded="xl" class="fill-height d-flex flex-column">
        <v-row no-gutters class="flex-center">
          <v-col cols="12" class="flex-center text-h6 text-berry font-weight-medium"> Berry </v-col>
        </v-row>

        <v-row no-gutters class="flex-center fill-height px-2">
          <v-col cols="auto" class="flex-center">
            <v-img
              :src="berryImage(parsedMember.pokemonInstance.pokemon.berry)"
              height="40"
              width="40"
            ></v-img>
          </v-col>
          <v-col cols="auto" class="flex-center flex-column">
            <span class="font-weight-medium text-center"
              >x{{
                MathUtils.round(
                  (parsedMember.produceWithoutSkill.berries.at(0)?.amount ?? 0) * timeWindowFactor,
                  1
                )
              }}</span
            >
            <div class="flex-center">
              <v-img src="/images/misc/strength.png" height="16px" width="16px"></v-img>
              <span class="font-weight-medium text-center">{{ currentBerryStrength }}</span>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </v-col>

    <v-col>
      <v-card color="surface" rounded="xl" class="fill-height d-flex flex-column">
        <v-row dense class="flex-center">
          <v-col cols="12" class="flex-center text-h6 text-ingredient font-weight-medium">
            Ings
          </v-col>
        </v-row>

        <v-row no-gutters class="flex-center fill-height">
          <v-row
            v-for="({ amount, name }, i) in parsedMember.ingredients"
            :key="i"
            no-gutters
            class="flex-center"
          >
            <v-col cols="6" class="flex-right">
              <div>
                <v-img :src="name" height="40" width="40"></v-img>
              </div>
            </v-col>
            <v-col cols="6" class="flex-left">
              <span class="text-center font-weight-medium">
                x{{ MathUtils.round(amount * timeWindowFactor, 1) }}
              </span>
            </v-col>
          </v-row>
        </v-row>
      </v-card>
    </v-col>

    <v-col>
      <MemberProductionSkill :member="member" />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import MemberProductionSkill from '@/components/calculator/results/member-results/member-production-skill.vue'
import { StrengthService } from '@/services/strength/strength-service'
import { berryImage, mainskillImage } from '@/services/utils/image-utils'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import type { MemberProductionExt } from '@/types/member/instanced'
import { MathUtils, compactNumber, ingredient, type IngredientSet } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'MemberProductionHeader',
  components: {
    MemberProductionSkill
  },
  props: {
    member: {
      type: Object as PropType<MemberProductionExt>,
      required: true
    }
  },
  setup() {
    const pokemonStore = usePokemonStore()
    const teamStore = useTeamStore()
    return { pokemonStore, teamStore, MathUtils, mainskillImage, berryImage }
  },
  computed: {
    parsedMember() {
      const pokemonInstance = this.pokemonStore.getPokemon(this.member.memberExternalId)!
      return {
        ...this.member,
        pokemonInstance,
        ingredients: this.prepareMemberIngredients(this.member.produceTotal.ingredients)
      }
    },
    currentBerryStrength() {
      return compactNumber(
        StrengthService.berryStrength({
          favored: this.teamStore.getCurrentTeam.favoredBerries,
          berries: this.parsedMember.produceWithoutSkill.berries,
          timeWindow: this.teamStore.timeWindow
        })
      )
    },
    timeWindowFactor() {
      return StrengthService.timeWindowFactor(this.teamStore.timeWindow)
    }
  },
  methods: {
    prepareMemberIngredients(ingredients: IngredientSet[]) {
      if (ingredients.length >= ingredient.INGREDIENTS.length) {
        const ingMagnetAmount = ingredients.reduce(
          (min, cur) => (cur.amount < min ? cur.amount : min),
          ingredients[0].amount
        )

        const nonIngMagnetIngs = ingredients.filter((ing) => ing.amount !== ingMagnetAmount)

        const result = nonIngMagnetIngs.map(({ amount, ingredient }) => ({
          amount: MathUtils.round(amount - ingMagnetAmount, 1),
          name: `/images/ingredient/${ingredient.name.toLowerCase()}.png`
        }))

        return result
      } else {
        return ingredients.map(({ amount, ingredient }) => ({
          amount: MathUtils.round(amount, 1),
          name: `/images/ingredient/${ingredient.name.toLowerCase()}.png`
        }))
      }
    }
  }
})
</script>
