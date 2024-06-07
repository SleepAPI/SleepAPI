<template>
  <v-card color="background" class="pa-4">
    <div class="flex-center">
      <v-row style="position: absolute; top: 0; width: 100%">
        <v-col class="flex-left">
          <h5 class="mr-1 text-primary">RP</h5>
          <h2>{{ rp }}</h2>
        </v-col>
        <v-col class="flex-right pr-1">
          <v-btn
            id="saveIcon"
            icon
            color="background"
            :class="{ nudge: !pokemonInstance.pokemon }"
            @click="toggleSave"
          >
            <v-icon v-if="pokemonInstance.saved" size="30">mdi-bookmark</v-icon>
            <v-icon v-else size="30">mdi-bookmark-outline</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </div>

    <v-sheet
      color="surface"
      width="100%"
      :height="90"
      location="top left"
      position="absolute"
      style="margin-top: 70px"
    ></v-sheet>

    <v-row no-gutters>
      <v-col class="flex-center">
        <PokemonButton :pokemon="pokemonInstance.pokemon" @update-pokemon="updatePokemon" />
      </v-col>
    </v-row>

    <v-row no-gutters>
      <v-col class="flex-center">
        <PokemonName :name="pokemonInstance.name" @update-name="updateName" />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col>
        <v-divider />
      </v-col>
    </v-row>

    <v-row dense class="mt-3">
      <v-col cols="6" class="flex-center">
        <LevelButton :level="pokemonInstance.level" @update-level="updateLevel" />
      </v-col>
      <v-col cols="6" class="flex-center">
        <CarrySizeButton :pokemon-instance="pokemonInstance" @update-carry="updateCarry" />
      </v-col>
    </v-row>

    <!-- Ingredients -->
    <v-row no-gutters class="mt-5">
      <v-col cols="4" class="mr-2 flex-center">
        <v-card rounded="pill" class="w-100 h-50 text-center responsive-text flex-center"
          >Ingredients</v-card
        >
      </v-col>
      <v-col class="flex-center">
        <IngredientButton
          :ingredient-level="0"
          :pokemon-instance="pokemonInstance"
          @update-ingredient="updateIngredient"
        />
      </v-col>
      <v-col class="flex-center">
        <IngredientButton
          :ingredient-level="30"
          :pokemon-instance="pokemonInstance"
          @update-ingredient="updateIngredient"
        />
      </v-col>
      <v-col class="flex-center">
        <IngredientButton
          :ingredient-level="60"
          :pokemon-instance="pokemonInstance"
          @update-ingredient="updateIngredient"
        />
      </v-col>
    </v-row>

    <!-- Mainskill -->
    <v-row no-gutters class="mt-3">
      <v-col cols="12">
        <MainskillButton
          :pokemon-instance="pokemonInstance"
          @update-skill-level="updateSkillLevel"
        />
      </v-col>
    </v-row>

    <v-row id="subskills" dense class="mt-3">
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill-level="10"
          :pokemon-level="pokemonInstance.level"
          :selected-subskills="pokemonInstance.subskills"
          @update-subskill="updateSubskill"
        ></SubskillButton>
      </v-col>
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill-level="25"
          :pokemon-level="pokemonInstance.level"
          :selected-subskills="pokemonInstance.subskills"
          @update-subskill="updateSubskill"
        ></SubskillButton>
      </v-col>
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill-level="50"
          :pokemon-level="pokemonInstance.level"
          :selected-subskills="pokemonInstance.subskills"
          @update-subskill="updateSubskill"
        ></SubskillButton>
      </v-col>
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill-level="75"
          :pokemon-level="pokemonInstance.level"
          :selected-subskills="pokemonInstance.subskills"
          @update-subskill="updateSubskill"
        ></SubskillButton>
      </v-col>
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill-level="100"
          :pokemon-level="pokemonInstance.level"
          :selected-subskills="pokemonInstance.subskills"
          @update-subskill="updateSubskill"
        ></SubskillButton>
      </v-col>
      <v-col cols="6" class="flex-center">
        <v-btn variant="text" text="edit" append-icon="mdi-pencil"></v-btn>
      </v-col>
    </v-row>

    <v-row id="nature">
      <v-col cols="12">
        <NatureButton :nature="pokemonInstance.nature" @update-nature="updateNature" />
      </v-col>
    </v-row>

    <v-row dense class="mt-3">
      <v-col cols="6">
        <v-btn
          id="cancelButton"
          class="w-100 responsive-text"
          size="large"
          rounded="lg"
          color="surface"
          @click="cancel"
          >Cancel</v-btn
        >
      </v-col>
      <v-col cols="6">
        <v-btn
          id="saveButton"
          class="w-100 responsive-text"
          size="large"
          rounded="lg"
          color="primary"
          @click="save"
          >Save</v-btn
        >
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import CarrySizeButton from '@/components/calculator/pokemon-input/carry-size-button.vue'
import IngredientButton from '@/components/calculator/pokemon-input/ingredient-button.vue'
import LevelButton from '@/components/calculator/pokemon-input/level-button.vue'
import MainskillButton from '@/components/calculator/pokemon-input/mainskill-button.vue'
import NatureButton from '@/components/calculator/pokemon-input/nature-button.vue'
import PokemonButton from '@/components/calculator/pokemon-input/pokemon-button.vue'
import PokemonName from '@/components/calculator/pokemon-input/pokemon-name.vue'
import SubskillButton from '@/components/calculator/pokemon-input/subskill-button.vue'
import { useTeamStore } from '@/stores/team/team-store'
import type { InstancedPokemonExt } from '@/types/member/instanced'
import { ingredient, nature, pokemon, type subskill } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'PokemonInput',
  components: {
    SubskillButton,
    PokemonButton,
    PokemonName,
    LevelButton,
    CarrySizeButton,
    IngredientButton,
    MainskillButton,
    NatureButton
  },
  props: {
    selectedPokemon: {
      type: undefined as PropType<pokemon.Pokemon> | undefined,
      required: false,
      default: undefined
    },
    memberIndex: {
      type: Number,
      required: true
    }
  },
  emits: ['cancel'],
  setup() {
    const teamStore = useTeamStore()
    return { teamStore }
  },
  data: () => ({
    pokemonInstance: {
      index: 0,
      version: 0,
      externalId: undefined as string | undefined,
      saved: false,
      pokemon: pokemon.MOCK_POKEMON,
      name: '',
      level: 50,
      carrySize: 0,
      skillLevel: 0,
      nature: nature.BASHFUL,
      subskills: [],
      ingredients: [
        {
          level: 0,
          ingredient: undefined as ingredient.Ingredient | undefined
        },
        {
          level: 30,
          ingredient: undefined as ingredient.Ingredient | undefined
        },
        {
          level: 60,
          ingredient: undefined as ingredient.Ingredient | undefined
        }
      ]
    } as InstancedPokemonExt
  }),
  computed: {
    rp() {
      return 0
    }
  },
  mounted() {
    const existingPokemon = this.teamStore.getPokemon(this.memberIndex)
    if (existingPokemon) {
      this.pokemonInstance = JSON.parse(JSON.stringify(existingPokemon))
    } else if (this.selectedPokemon) {
      this.pokemonInstance.index = this.memberIndex
      this.pokemonInstance.pokemon = this.selectedPokemon
      this.pokemonInstance.carrySize = this.selectedPokemon.maxCarrySize
    } else console.error('Missing both cached and search input mon, contact developer')

    // in future we will also mount from saved mons here
  },
  methods: {
    toggleSave() {
      if (this.pokemonInstance.pokemon) {
        this.pokemonInstance.saved = !this.pokemonInstance.saved
      }
    },
    updateSubskill(params: { subskill: subskill.SubSkill; subskillLevel: number }) {
      const subskillToUpdate = this.pokemonInstance.subskills.find(
        (sub) => sub.level === params.subskillLevel
      )
      if (subskillToUpdate) {
        subskillToUpdate.subskill = params.subskill
      } else {
        this.pokemonInstance.subskills.push({
          level: params.subskillLevel,
          subskill: params.subskill
        })
        this.pokemonInstance
      }
      this.pokemonInstance.subskills.sort((a, b) => a.level - b.level)
    },
    updatePokemon(pokemon: pokemon.Pokemon) {
      this.pokemonInstance.pokemon = pokemon
    },
    updateName(newName: string) {
      this.pokemonInstance.name = newName
    },
    updateLevel(newLevel: number) {
      this.pokemonInstance.level = newLevel
    },
    updateCarry(newLimit: number) {
      this.pokemonInstance.carrySize = newLimit
    },
    updateIngredient(params: { ingredient: ingredient.Ingredient; ingredientLevel: number }) {
      const ingredientToUpdate = this.pokemonInstance.ingredients.find(
        (sub) => sub.level === params.ingredientLevel
      )
      if (ingredientToUpdate) {
        ingredientToUpdate.ingredient = params.ingredient
      }
    },
    updateSkillLevel(skillLevel: number) {
      this.pokemonInstance.skillLevel = skillLevel
    },
    updateNature(newNature: nature.Nature) {
      this.pokemonInstance.nature = newNature
    },
    cancel() {
      this.$emit('cancel')
    },
    save() {
      // TODO: need to start running simulations too asap, perhaps we can emit a promise so team section can show skeleton loader and await
      this.teamStore.updateTeamMember(this.pokemonInstance)
      this.$emit('cancel') // TODO: should probably be renamed to close
    }
  }
})
</script>

<style lang="scss">
@import '@/assets/main.scss';

.nowrap {
  display: flex;
  align-items: center;
}

.responsive-text {
  font-size: 0.875rem !important;
}

.responsive-icon {
  font-size: 0.875rem !important;
}

@media (max-width: 360px) {
  .responsive-text {
    font-size: 0.7rem !important;
  }

  .responsive-icon {
    font-size: 0.7rem !important;
  }
}
</style>
