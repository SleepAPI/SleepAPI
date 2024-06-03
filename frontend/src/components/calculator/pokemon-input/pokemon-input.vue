<template>
  <v-card color="background" class="pa-4">
    <div class="flex-center">
      <v-row style="position: absolute; top: 0; width: 100%">
        <v-col class="flex-left">
          <h5 class="mr-1 text-primary">RP</h5>
          <h2>{{ rp }}</h2>
        </v-col>
        <v-col class="flex-right pr-1">
          <v-btn icon color="background" :class="{ nudge: !pokemon }" @click="toggleSave">
            <v-icon v-if="saved" size="30">mdi-bookmark</v-icon>
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
        <PokemonButton :pokemon="pokemon" @update-pokemon="updatePokemon" />
      </v-col>
    </v-row>

    <v-row no-gutters>
      <v-col class="flex-center">
        <PokemonName :pokemon="pokemon" @update-name="updateName" />
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
        <CarrySizeButton :pokemon="pokemon" @update-carry="updateLimit" />
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
          :pokemon="pokemon"
          :pokemon-level="level"
          @update-ingredient="updateIngredient"
        />
      </v-col>
      <v-col class="flex-center">
        <IngredientButton
          :ingredient-level="30"
          :pokemon="pokemon"
          :pokemon-level="level"
          @update-ingredient="updateIngredient"
        />
      </v-col>
      <v-col class="flex-center">
        <IngredientButton
          :ingredient-level="60"
          :pokemon="pokemon"
          :pokemon-level="level"
          @update-ingredient="updateIngredient"
        />
      </v-col>
    </v-row>

    <!-- Mainskill -->
    <v-row no-gutters class="mt-3">
      <v-col cols="12">
        <MainskillButton :pokemon="pokemon" @update-skill-level="updateSkillLevel" />
      </v-col>
    </v-row>

    <v-row id="subskills" dense class="mt-3">
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill-level="10"
          :pokemon-level="level"
          :selected-subskills="selectedSubskills"
          @update-subskill="updateSubskill"
        ></SubskillButton>
      </v-col>
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill-level="25"
          :pokemon-level="level"
          :selected-subskills="selectedSubskills"
          @update-subskill="updateSubskill"
        ></SubskillButton>
      </v-col>
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill-level="50"
          :pokemon-level="level"
          :selected-subskills="selectedSubskills"
          @update-subskill="updateSubskill"
        ></SubskillButton>
      </v-col>
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill-level="75"
          :pokemon-level="level"
          :selected-subskills="selectedSubskills"
          @update-subskill="updateSubskill"
        ></SubskillButton>
      </v-col>
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill-level="100"
          :pokemon-level="level"
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
import { nature, pokemon, type IngredientSet, type subskill } from 'sleepapi-common'
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
    saved: false,
    pokemon: pokemon.PIKACHU,
    name: undefined as string | undefined,
    level: 50,
    carrySize: 0,
    skillLevel: 0,
    nature: nature.BASHFUL,
    subskills: [
      {
        level: 10,
        subskill: undefined as subskill.SubSkill | undefined
      },
      {
        level: 25,
        subskill: undefined as subskill.SubSkill | undefined
      },
      {
        level: 50,
        subskill: undefined as subskill.SubSkill | undefined
      },
      {
        level: 75,
        subskill: undefined as subskill.SubSkill | undefined
      },
      {
        level: 100,
        subskill: undefined as subskill.SubSkill | undefined
      }
    ],
    ingredients: [
      {
        level: 0,
        ingredientSet: undefined as IngredientSet | undefined
      },
      {
        level: 30,
        ingredientSet: undefined as IngredientSet | undefined
      },
      {
        level: 60,
        ingredientSet: undefined as IngredientSet | undefined
      }
    ]
  }),
  computed: {
    selectedSubskills(): subskill.SubSkill[] {
      return this.subskills
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
    this.pokemon = this.selectedPokemon
    this.carrySize = this.selectedPokemon.maxCarrySize
  },
  methods: {
    toggleSave() {
      if (this.pokemon) {
        this.saved = !this.saved
      }
    },
    updateSubskill(params: { subskill: subskill.SubSkill; subskillLevel: number }) {
      const subskillToUpdate = this.subskills.find((sub) => sub.level === params.subskillLevel)
      if (subskillToUpdate) {
        subskillToUpdate.subskill = params.subskill
      }
    },
    updatePokemon(pokemon: pokemon.Pokemon) {
      this.pokemon = pokemon
    },
    updateName(newName: string) {
      this.name = newName
    },
    updateLevel(newLevel: number) {
      this.level = newLevel
    },
    updateLimit(newLimit: number) {
      this.carrySize = newLimit
    },
    updateIngredient(params: { ingredientSet: IngredientSet; ingredientLevel: number }) {
      const ingredientToUpdate = this.ingredients.find(
        (sub) => sub.level === params.ingredientLevel
      )
      if (ingredientToUpdate) {
        ingredientToUpdate.ingredientSet = params.ingredientSet
      }
    },
    updateSkillLevel(skillLevel: number) {
      this.skillLevel = skillLevel
    },
    updateNature(nature: nature.Nature) {
      this.nature = nature
    },
    cancel() {
      this.$emit('cancel')
    },
    save() {
      // TODO: need to start running simulations too asap, perhaps we can emit a promise so team section can show skeleton loader and await
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
