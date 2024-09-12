<template>
  <v-card color="background" class="pa-4">
    <div class="flex-center">
      <v-row style="position: absolute; top: 0; width: 100%">
        <v-col class="flex-left">
          <h5 class="mr-1 text-primary">RP</h5>
          <h2>{{ pokemonInstance.rp }}</h2>
        </v-col>
        <v-col class="flex-right pr-0">
          <v-btn
            id="saveIcon"
            icon
            elevation="0"
            color="background"
            :class="{ nudge: !userStore.loggedIn }"
            @click="toggleSave"
          >
            <v-icon v-if="pokemonInstance.saved" color="accent" size="32">mdi-bookmark</v-icon>
            <v-icon v-else size="32">mdi-bookmark-outline</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </div>

    <v-sheet
      color="surface"
      width="100%"
      :height="85"
      location="top left"
      position="absolute"
      style="margin-top: 60px"
    >
      <v-btn
        icon
        color="surface"
        elevation="0"
        style="right: 4px; position: absolute"
        size="40"
        @click="toggleShiny"
      >
        <v-icon v-if="pokemonInstance.shiny" color="accent" size="24">mdi-creation</v-icon>
        <v-icon v-else size="24">mdi-creation-outline</v-icon>
      </v-btn>
      <GenderButton :pokemon-instance="pokemonInstance" @update-gender="updateGender" />
    </v-sheet>

    <v-row no-gutters class="pt-2 pb-2">
      <v-col class="flex-center">
        <PokemonButton :pokemon-instance="pokemonInstance" @update-pokemon="updatePokemon" />
      </v-col>
    </v-row>

    <v-row no-gutters>
      <v-col class="flex-center">
        <PokemonName :pokemon-instance="pokemonInstance" @update-name="updateName" />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col>
        <v-divider />
      </v-col>
    </v-row>

    <v-row dense class="mt-3">
      <v-col cols="4" class="flex-center">
        <LevelButton :level="pokemonInstance.level" @update-level="updateLevel" />
      </v-col>
      <v-col cols="6" class="flex-center">
        <CarrySizeButton :pokemon-instance="pokemonInstance" @update-carry="updateCarry" />
      </v-col>
      <v-col cols="2" class="flex-center">
        <RibbonButton :ribbon="pokemonInstance.ribbon" @update-ribbon="updateRibbon" />
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

    <SubskillButtons
      :pokemon-level="pokemonInstance.level"
      :selected-subskills="pokemonInstance.subskills"
      @update-subskills="updateSubskills"
    />

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
import CarrySizeButton from '@/components/pokemon-input/carry-size-button.vue'
import GenderButton from '@/components/pokemon-input/gender-button.vue'
import IngredientButton from '@/components/pokemon-input/ingredient-button.vue'
import LevelButton from '@/components/pokemon-input/level-button.vue'
import MainskillButton from '@/components/pokemon-input/mainskill-button.vue'
import SubskillButtons from '@/components/pokemon-input/menus/subskill-buttons.vue'
import NatureButton from '@/components/pokemon-input/nature-button.vue'
import PokemonButton from '@/components/pokemon-input/pokemon-button.vue'
import PokemonName from '@/components/pokemon-input/pokemon-name.vue'
import RibbonButton from '@/components/pokemon-input/ribbon-button.vue'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import {
  RP,
  ingredient,
  maxCarrySize,
  nature,
  pokemon,
  uuid,
  type PokemonGender,
  type PokemonInstanceExt,
  type SubskillInstanceExt
} from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'PokemonInput',
  components: {
    SubskillButtons,
    PokemonButton,
    PokemonName,
    LevelButton,
    CarrySizeButton,
    IngredientButton,
    MainskillButton,
    NatureButton,
    RibbonButton,
    GenderButton
  },
  props: {
    pokemonFromPreExist: {
      type: Object as PropType<PokemonInstanceExt>,
      required: false,
      default: undefined
    },
    pokemonFromSearch: {
      type: undefined as PropType<pokemon.Pokemon> | undefined,
      required: false,
      default: undefined
    }
  },
  emits: ['cancel', 'save'],
  setup() {
    const teamStore = useTeamStore()
    const userStore = useUserStore()
    return { teamStore, userStore }
  },
  data: () => ({
    pokemonInstance: {
      version: 0,
      externalId: '',
      saved: false,
      shiny: false,
      gender: undefined,
      pokemon: pokemon.MOCK_POKEMON,
      name: '',
      level: 60,
      ribbon: 0,
      carrySize: 0,
      skillLevel: 0,
      nature: nature.BASHFUL,
      subskills: [],
      ingredients: [],
      rp: 0
    } as PokemonInstanceExt
  }),
  watch: {
    pokemonInstance: {
      deep: true,
      handler(newPokemon: PokemonInstanceExt) {
        const rp = new RP(newPokemon)
        this.pokemonInstance.rp = rp.calc()
      }
    }
  },
  mounted() {
    if (this.pokemonFromPreExist) {
      this.pokemonInstance = JSON.parse(JSON.stringify(this.pokemonFromPreExist))
    } else if (this.pokemonFromSearch) {
      this.pokemonInstance.pokemon = this.pokemonFromSearch
      this.pokemonInstance.carrySize = maxCarrySize(this.pokemonFromSearch)
      this.pokemonInstance.externalId = uuid.v4()
    } else console.error('Missing both cached and search input mon, contact developer')
  },
  methods: {
    toggleSave() {
      if (this.userStore.loggedIn) {
        this.pokemonInstance.saved = !this.pokemonInstance.saved
      }
    },
    toggleShiny() {
      this.pokemonInstance.shiny = !this.pokemonInstance.shiny
    },
    updateGender(gender: PokemonGender) {
      this.pokemonInstance.gender = gender
    },
    updateSubskills(updatedSubskills: SubskillInstanceExt[]) {
      this.pokemonInstance.subskills = updatedSubskills
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
      } else {
        this.pokemonInstance.ingredients.push({
          level: params.ingredientLevel,
          ingredient: params.ingredient
        })
      }
    },
    updateSkillLevel(skillLevel: number) {
      this.pokemonInstance.skillLevel = skillLevel
    },
    updateNature(newNature: nature.Nature) {
      this.pokemonInstance.nature = newNature
    },
    updateRibbon(newRibbon: number) {
      this.pokemonInstance.ribbon = newRibbon
    },
    resetSubskills() {
      this.pokemonInstance.subskills = []
    },
    cancel() {
      this.$emit('cancel')
    },
    save() {
      this.$emit('save', this.pokemonInstance)
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
