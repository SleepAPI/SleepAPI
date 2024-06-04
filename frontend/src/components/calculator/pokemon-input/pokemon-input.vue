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
        <PokemonName :pokemon="pokemonInstance.pokemon" @update-name="updateName" />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col>
        <v-divider />
      </v-col>
    </v-row>

    <v-row dense class="mt-3">
      <v-col cols="6" class="flex-center">
        <LevelButton @update-level="updateLevel" />
      </v-col>
      <v-col cols="6" class="flex-center">
        <CarrySizeButton :pokemon="pokemonInstance.pokemon" @update-carry="updateLimit" />
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
          :pokemon="pokemonInstance.pokemon"
          :pokemon-level="pokemonInstance.level"
          @update-ingredient="updateIngredient"
        />
      </v-col>
      <v-col class="flex-center">
        <IngredientButton
          :ingredient-level="30"
          :pokemon="pokemonInstance.pokemon"
          :pokemon-level="pokemonInstance.level"
          @update-ingredient="updateIngredient"
        />
      </v-col>
      <v-col class="flex-center">
        <IngredientButton
          :ingredient-level="60"
          :pokemon="pokemonInstance.pokemon"
          :pokemon-level="pokemonInstance.level"
          @update-ingredient="updateIngredient"
        />
      </v-col>
    </v-row>

    <!-- Mainskill -->
    <v-row no-gutters class="mt-3">
      <v-col cols="12">
        <MainskillButton
          :pokemon="pokemonInstance.pokemon"
          @update-skill-level="updateSkillLevel"
        />
      </v-col>
    </v-row>

    <v-row id="subskills" dense class="mt-3">
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill-level="10"
          :pokemon-level="pokemonInstance.level"
          :selected-subskills="selectedSubskills"
          @update-subskill="updateSubskill"
        ></SubskillButton>
      </v-col>
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill-level="25"
          :pokemon-level="pokemonInstance.level"
          :selected-subskills="selectedSubskills"
          @update-subskill="updateSubskill"
        ></SubskillButton>
      </v-col>
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill-level="50"
          :pokemon-level="pokemonInstance.level"
          :selected-subskills="selectedSubskills"
          @update-subskill="updateSubskill"
        ></SubskillButton>
      </v-col>
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill-level="75"
          :pokemon-level="pokemonInstance.level"
          :selected-subskills="selectedSubskills"
          @update-subskill="updateSubskill"
        ></SubskillButton>
      </v-col>
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill-level="100"
          :pokemon-level="pokemonInstance.level"
          :selected-subskills="selectedSubskills"
          @update-subskill="updateSubskill"
        ></SubskillButton>
      </v-col>
      <v-col cols="6" class="flex-center">
        <v-btn variant="text" text="edit" append-icon="mdi-pencil"></v-btn>
      </v-col>
    </v-row>

    <v-row id="nature">
      <v-col cols="12">
        <NatureButton @update-nature="updateNature" />
      </v-col>
    </v-row>

    <v-row dense class="mt-3">
      <v-col cols="6">
        <v-btn
          class="w-100 responsive-text"
          size="large"
          rounded="lg"
          color="surface"
          @click="cancel"
          >Cancel</v-btn
        >
      </v-col>
      <v-col cols="6">
        <v-btn class="w-100 responsive-text" size="large" rounded="lg" color="primary" @click="save"
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
      type: Object as PropType<pokemon.Pokemon>,
      required: true
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
    // TODO: on mount check if teamStore.getPokemon(member_index) exists, then overwrite entire object
    pokemonInstance: {
      index: 0, // TODO: overwrite this with member_index on mount
      version: 0,
      externalId: undefined as string | undefined,
      saved: false,
      pokemon: pokemon.PIKACHU, // TODO: always overwrite this with selectedPokemon
      name: 'Pikachu 1',
      level: 50,
      carrySize: 0, // TODO: always overwrite this with selectedPokemon
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
    selectedSubskills(): subskill.SubSkill[] {
      return this.pokemonInstance.subskills
        .filter(
          (s): s is { level: number; subskill: subskill.SubSkill } => s.subskill !== undefined
        )
        .map((s) => s.subskill)
    },
    rp() {
      return 0
    }
  },
  mounted() {
    // const existingPokemon = this.teamStore.getPokemon(this.memberIndex)
    // if (existingPokemon) {
    //   // TODO: find pokemon matching  name and if cant then emit cancel
    //   this.pokemon = existingPokemon.pokemon
    //   // TODO: populate rest
    // } else {
    //   this.pokemon = this.selectedPokemon
    //   this.carrySize = this.selectedPokemon.maxCarrySize
    // }

    // TODO: replace with above
    this.pokemonInstance.index = this.memberIndex
    this.pokemonInstance.pokemon = this.selectedPokemon
    this.pokemonInstance.carrySize = this.selectedPokemon.maxCarrySize
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
      }
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
    updateLimit(newLimit: number) {
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
    updateNature(nature: nature.Nature) {
      this.pokemonInstance.nature = nature
    },
    cancel() {
      this.$emit('cancel')
    },
    save() {
      // TODO: need to start running simulations too asap, perhaps we can emit a promise so team section can show skeleton loader and await
      this.teamStore.updateTeamMember(this.pokemonInstance)
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
