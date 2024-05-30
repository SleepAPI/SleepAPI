<template>
  <!-- TODO: cleanup css styles, classes, common classes etc -->

  <!-- TODO: many badges with top left w-100, create class -->

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
        <PokemonButton @select-pokemon="updatePokemon" />
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
        <v-btn class="w-100">
          <span class="responsive-text"> Level 31 </span>
        </v-btn>
      </v-col>
      <v-col cols="6" class="flex-center">
        <v-btn class="w-100">
          <span class="responsive-text"> Carry limit 20 </span>
        </v-btn>
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
        <v-btn icon>
          <v-avatar>
            <v-img src="/images/ingredient/egg.png"></v-img>
          </v-avatar>
        </v-btn>
      </v-col>
      <v-col class="flex-center">
        <v-btn icon :class="{ 'disabled-image-btn': level < 30 }">
          <v-avatar>
            <v-img src="/images/ingredient/egg.png"></v-img>
          </v-avatar>
        </v-btn>
      </v-col>
      <v-col class="flex-center">
        <v-badge color="secondary" class="flex-center" location="top left" offset-x="auto">
          <template #badge>
            <v-icon left class="mr-1">mdi-lock</v-icon>
            Lv.60
          </template>
          <!-- TODO: disabled if -->
          <v-btn icon :class="{ 'disabled-image-btn': level < 60 }">
            <v-avatar>
              <v-img src="/images/ingredient/egg.png" class="disabled-image"></v-img>
            </v-avatar>
          </v-btn>
        </v-badge>
      </v-col>
    </v-row>

    <!-- Mainskill -->
    <v-row no-gutters class="mt-3">
      <v-col cols="3">
        <v-card
          class="rounded-te-0 rounded-be-0 fill-height"
          color="secondary"
          style="justify-content: center; align-content: center"
          @click="console.log('hello')"
        >
          <v-img
            class="ma-2"
            src="/images/mainskill/ingredient.png"
            style="max-height: 50px"
          ></v-img>
        </v-card>
      </v-col>
      <v-col cols="9">
        <v-card
          class="fill-height rounded-ts-0 rounded-bs-0 flex-column px-2"
          style="align-content: center"
          @click="console.log('hello')"
        >
          <div class="nowrap responsive-text">
            <span class="my-1">Ingredient Magnet S</span>
            <v-spacer></v-spacer>
            <span class="my-1">Lv.1</span>
          </div>
          <v-divider />
          <div class="nowrap responsive-text">
            <span class="my-1"> Gets you 6 ingredients chosen at random </span>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row id="subskills" dense class="mt-3">
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill-level="10"
          :pokemon-level="level"
          :selected-subskills="selectedSubskills"
          @select-subskill="updateSubskill"
        ></SubskillButton>
      </v-col>
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill-level="25"
          :pokemon-level="level"
          :selected-subskills="selectedSubskills"
          @select-subskill="updateSubskill"
        ></SubskillButton>
      </v-col>
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill-level="50"
          :pokemon-level="level"
          :selected-subskills="selectedSubskills"
          @select-subskill="updateSubskill"
        ></SubskillButton>
      </v-col>
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill-level="75"
          :pokemon-level="level"
          :selected-subskills="selectedSubskills"
          @select-subskill="updateSubskill"
        ></SubskillButton>
      </v-col>
      <v-col cols="6" class="flex-center">
        <SubskillButton
          :subskill-level="100"
          :pokemon-level="level"
          :selected-subskills="selectedSubskills"
          @select-subskill="updateSubskill"
        ></SubskillButton>
      </v-col>
      <v-col cols="6" class="flex-center">
        <v-btn variant="text" text="edit" append-icon="mdi-pencil"></v-btn>
      </v-col>
    </v-row>

    <v-row id="nature">
      <v-col cols="6">
        <v-badge color="primary" content="Nature" location="top left" :offset-x="35" class="w-100">
          <v-btn class="responsive-text w-100" size="large" rounded="pill" color="secondary"
            >Adamant</v-btn
          >
        </v-badge>
      </v-col>
      <v-col cols="6" class="flex-colum px-0" style="align-content: center">
        <div class="nowrap responsive-text">
          <span class="nowrap mr-1">Main Skill Chance</span>
          <v-icon color="primary" class="responsive-icon">mdi-triangle</v-icon>
          <v-icon color="primary" class="responsive-icon">mdi-triangle</v-icon>
        </div>
        <div class="nowrap responsive-text">
          <span class="nowrap mr-1">Ingredient Finding</span>
          <v-icon color="surface" class="responsive-icon">mdi-triangle-down</v-icon>
          <v-icon color="surface" class="responsive-icon">mdi-triangle-down</v-icon>
        </div>
      </v-col>
    </v-row>

    <v-row id="closeAndSave" dense class="mt-3">
      <v-col cols="6">
        <v-btn class="w-100 responsive-text" size="large" rounded="lg" color="surface"
          >Cancel</v-btn
        >
      </v-col>
      <v-col cols="6">
        <v-btn class="w-100 responsive-text" size="large" rounded="lg" color="primary">Save</v-btn>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import PokemonButton from '@/components/calculator/pokemon-input/pokemon-button.vue'
import PokemonName from '@/components/calculator/pokemon-input/pokemon-name.vue'
import SubskillButton from '@/components/calculator/pokemon-input/subskill-button.vue'
import type { pokemon, subskill } from 'sleepapi-common'

export default {
  name: 'PokemonInput',
  components: {
    SubskillButton,
    PokemonButton,
    PokemonName
  },
  data: () => ({
    saved: false,
    pokemon: undefined as pokemon.Pokemon | undefined,
    name: undefined as string | undefined,
    level: 31, // TODO: which default? 50?
    rp: 1293,
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
    ]
  }),
  computed: {
    selectedSubskills(): subskill.SubSkill[] {
      return this.subskills
        .filter(
          (s): s is { level: number; subskill: subskill.SubSkill } => s.subskill !== undefined
        )
        .map((s) => s.subskill)
    }
  },
  methods: {
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
    toggleSave() {
      if (this.pokemon) {
        this.saved = !this.saved
      }
    }
  }
}
</script>

<style lang="scss">
@import '@/assets/main.scss';

.nowrap {
  display: flex;
  align-items: center;
}

.disabled-image {
  opacity: 0.5;
  filter: grayscale(100%);
}

.disabled-image-btn {
  cursor: not-allowed;
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
