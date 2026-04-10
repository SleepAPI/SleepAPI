<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-card class="flex-center flex-column frosted-glass rounded-t-0 w-100">
    <v-container>
      <v-row class="d-flex align-center justify-space-between">
        <v-col class="d-flex align-center flex-wrap">
          <v-chip-group v-model="chips" column multiple>
            <v-chip text="Berry strength" color="berry" variant="outlined" filter></v-chip>
            <v-chip text="Skill strength" color="skill" variant="outlined" filter></v-chip>
          </v-chip-group>

          <v-menu v-model="ingredientMenu" location="bottom start">
            <template #activator="{ props }">
              <v-chip
                v-bind="props"
                variant="outlined"
                :color="selectedIngredientOption !== 'ignore' ? 'ingredient' : ''"
                :text="ingredientChipText()"
                :class="{ 'selected-chip': selectedIngredientOption !== 'ignore' }"
                append-icon="mdi-menu-down"
              >
                <template v-if="selectedIngredientOption !== 'ignore'" #prepend>
                  <v-icon>mdi-check</v-icon>
                </template>
              </v-chip>
            </template>

            <v-card color="surface">
              <v-radio-group v-model="selectedIngredientOption" column hide-details>
                <v-list-item
                  v-for="option in options"
                  :key="option.value"
                  class="px-2"
                  @click="setIngredientOptions(option.value)"
                >
                  <v-radio :label="option.label" :value="option.value" hide-details></v-radio>
                </v-list-item>
              </v-radio-group>
            </v-card>
          </v-menu>
        </v-col>

        <v-col cols="auto" class="flex-right">
          <v-btn-toggle v-model="tab" mandatory rounded="pill" variant="outlined" style="height: 32px">
            <v-btn value="visual" class="w-50" :prepend-icon="tab === 'visual' ? 'mdi-check' : ''"> Visual </v-btn>
            <v-btn value="data" class="w-50" :prepend-icon="tab === 'data' ? 'mdi-check' : ''"> Data </v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>
    </v-container>

    <v-tabs-window v-model="tab" class="w-100">
      <v-tabs-window-item value="visual" class="pb-4">
        <v-row v-for="(member, index) in members" :key="index" no-gutters class="w-100">
          <v-col cols="auto" class="flex-center">
            <div class="flex-center">
              <div class="text-center" style="overflow: hidden; width: 60px; height: 60px">
                <v-card
                  color="transparent"
                  height="20px"
                  elevation="0"
                  style="transform: translateY(40px); white-space: nowrap"
                  >{{ member.member }}</v-card
                >
                <v-img
                  height="60px"
                  width="60px"
                  style="transform: translate(0px, -25px)"
                  :src="pokemonImage({ pokemonName: member.pokemon.name, shiny: member.shiny })"
                  cover
                ></v-img>
              </div>
            </div>
          </v-col>
          <v-col class="flex-center">
            <StackedBar
              style="height: 25px"
              :sections="[
                {
                  color: 'berry',
                  percentage: member.berryPercentage,
                  sectionText: member.berryCompact,
                  tooltipText: `${member.berryCompact} (${round(member.berryPercentage)}%)`
                },
                {
                  color: 'skill',
                  percentage: member.skillPercentage,
                  sectionText: member.skillCompact,
                  tooltipText: `${member.skillCompact} (${round(member.skillPercentage)}%)`
                },
                {
                  color: 'ingredient',
                  percentage: member.ingredientPercentage,
                  sectionText: member.ingredientCompact,
                  tooltipText: `${member.ingredientCompact} (${round(member.ingredientPercentage)}%)`
                }
              ]"
            />
          </v-col>
          <v-col cols="auto" class="flex-center" style="min-width: 55px">
            {{ member.totalCompact }}
          </v-col>
        </v-row>
      </v-tabs-window-item>

      <v-tabs-window-item value="data">
        <v-data-table
          key="key"
          :items="members"
          :headers="headers"
          hide-default-footer
          class="bg-transparent"
          style="border-radius: 10px"
          items-per-page="-1"
        >
          <template #item.member="{ item }">
            <div class="flex-center">
              <div style="overflow: hidden; width: 60px; height: 60px">
                <v-card
                  width="60px"
                  height="20px"
                  elevation="0"
                  class="bg-transparent"
                  style="transform: translateY(40px); white-space: nowrap"
                  >{{ item.member }}</v-card
                >
                <v-img
                  style="transform: translateY(-20px)"
                  :src="pokemonImage({ pokemonName: item.pokemon.name, shiny: item.shiny })"
                  cover
                ></v-img>
              </div>
            </div>
          </template>

          <template #item.berries="{ item }">
            <div class="flex-center">
              <v-img src="/images/misc/strength.png" height="24" width="24"></v-img>
            </div>
            <div class="flex-center text-center">
              {{ item.berries }}
            </div>
          </template>

          <template #item.ingredients="{ item }">
            <div class="flex-center">
              <v-img src="/images/misc/strength.png" height="24" width="24"></v-img>
            </div>
            <div class="flex-center text-center">
              {{ item.ingredientPower }}
            </div>
          </template>

          <template #item.skillProcs="{ item }">
            <div class="flex-center">
              <div v-if="!item.skill.is(Metronome, SkillCopy)">
                <div class="flex-center">
                  <v-img :src="mainskillImage(item.pokemon)" height="24" width="24"></v-img>
                </div>
                <div v-if="item.energyPerMember">
                  <div>{{ item.energyPerMember }}</div>
                </div>
                <div v-else>
                  {{ item.skillValue }}
                </div>
              </div>
            </div>
          </template>

          <template #item.total="{ item }">
            <div class="flex-center">
              <v-img src="/images/misc/strength.png" height="24" width="24"></v-img>
            </div>
            <div class="flex-center text-center">
              {{ item.total }}
            </div>
          </template>
        </v-data-table>
      </v-tabs-window-item>
    </v-tabs-window>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import {
  ALL_BERRY_SPECIALISTS,
  AVERAGE_WEEKLY_CRIT_MULTIPLIER,
  BerrySet,
  CalculateTeamResponse,
  CarrySizeUtils,
  compactNumber,
  defaultZero,
  DOMAIN_VERSION,
  EnergyForEveryoneS,
  getMaxIngredientBonus,
  getPokemon,
  getRandomGender,
  GREENGRASS,
  IngredientSet,
  Mainskill,
  MathUtils,
  MAX_POKEMON_LEVEL,
  MAX_RECIPE_LEVEL,
  MemberProduction,
  Metronome,
  nature,
  Pokemon,
  PokemonInstanceExt,
  PokemonInstanceIdentity,
  recipeLevelBonus,
  SkillCopy,
  subskill,
  TeamSettings
} from 'sleepapi-common';
import { mainskillImage, pokemonImage } from './image-utils';
import { DEFAULT_SLEEP, TeamCombinedProduction, TeamProductionExt } from './instanced';
import { PokemonInstanceUtils } from './pokemon-instance-utils';
import serverAxios from './server-axios';
import StackedBar from './stacked-bar.vue';
import type { DataTableHeader } from './table-header';

export interface ProductionResult {
  member: string;
  pokemon: Pokemon;
  shiny: boolean;
  berries: number;
  berryCompact: string;
  ingredients: number;
  ingredientPower: number;
  ingredientCompact: string;
  skill: Mainskill;
  skillStrength: number;
  skillValue: number;
  skillCompact: string;
  energyPerMember: string | number | undefined;
  total: number;
  totalCompact: string;
}
export interface DataTableEntry extends ProductionResult {
  berryPercentage: number;
  skillPercentage: number;
  ingredientPercentage: number;
  comparedToBest: number;
}

export default defineComponent({
  name: 'BerryStrengthComponent',
  components: { StackedBar },
  setup() {
    return {
      mainskillImage,
      pokemonImage,
      Metronome,
      SkillCopy
    };
  },
  data: () => ({
    headers: [
      { title: 'Name', key: 'member', sortable: true, align: 'center' },
      { title: 'Berry', key: 'berries', sortable: true, align: 'center' },
      { title: 'Ingredient', key: 'ingredients', sortable: true, align: 'center' },
      { title: 'Skill', key: 'skillProcs', sortable: true, align: 'center' },
      { title: 'Total', key: 'total', sortable: true, align: 'center' }
    ] as DataTableHeader[],
    chips: [0, 1],
    tab: 'visual',
    tabs: [
      { value: 'visual', label: 'Visual' },
      { value: 'data', label: 'Data' }
    ],
    selectedIngredientOption: 'min',
    ingredientMenu: false,
    options: [
      { label: 'Ignore ingredients', value: 'ignore' },
      { label: 'Min ingredient strength', value: 'min' },
      { label: 'Max ingredient strength', value: 'max' }
    ],
    listOfMons: [] as MemberProduction[]
  }),
  async mounted() {
    await this.berryMons();
  },
  computed: {
    timeWindowFactor() {
      return 1;
    },
    showBerries() {
      return this.chips.includes(0);
    },
    showSkills() {
      return this.chips.includes(1);
    },
    showIngredientMin() {
      return this.selectedIngredientOption === 'min';
    },
    showIngredientMax() {
      return this.selectedIngredientOption === 'max';
    },
    members(): DataTableEntry[] {
      const memberProductions = this.listOfMons;
      const productions = [] as ProductionResult[];
      for (const production of memberProductions) {
        const mon = getPokemon(production.pokemonWithIngredients.pokemon);
        const berryPower = this.showBerries ? Math.floor(production.strength.berries.total * this.timeWindowFactor) : 0;
        const ingredientPower = this.showIngredientMax
          ? this.highestIngredientPower(production)
          : this.showIngredientMin
            ? this.lowestIngredientPower(production)
            : 0;
        const skillStrength = this.showSkills ? Math.floor(production.strength.skill.total * this.timeWindowFactor) : 0;

        let skillValue = 0;
        for (const activation of mon.skill.getUnits()) {
          skillValue += this.showSkills
            ? MathUtils.round(
                defaultZero(production.skillValue[activation]?.amountToSelf) +
                  defaultZero(production.skillValue[activation]?.amountToTeam),
                1
              ) * this.timeWindowFactor
            : 0;
        }

        const total = Math.floor(berryPower + ingredientPower + skillStrength);

        productions.push({
          member: production.pokemonWithIngredients.pokemon,
          pokemon: mon,
          shiny: false,
          berries: berryPower,
          berryCompact: compactNumber(berryPower),
          ingredients:
            production.produceTotal.ingredients.reduce((sum, cur) => sum + cur.amount, 0) * this.timeWindowFactor,
          ingredientPower,
          ingredientCompact: compactNumber(ingredientPower),
          skill: mon.skill,
          skillStrength,
          skillValue,
          skillCompact: skillStrength > 0 ? compactNumber(skillStrength) : '',
          energyPerMember: mon.skill.hasUnit('energy') ? this.energyPerMember(production) : 0,
          total,
          totalCompact: compactNumber(total)
        });
      }

      const sortedProductions = productions.sort((a, b) => b.total - a.total);
      const highestTotal = sortedProductions.at(0)?.total ?? 0;

      const result = [] as DataTableEntry[];
      for (const member of sortedProductions) {
        const berryPercentage = defaultZero((member.berries / highestTotal) * 100);
        const skillPercentage = defaultZero((member.skillStrength / highestTotal) * 100);
        const ingredientPercentage = defaultZero((member.ingredientPower / highestTotal) * 100);
        const comparedToBest = defaultZero((1 - member.total / highestTotal) * 100);

        result.push({
          ...member,
          berryPercentage,
          skillPercentage,
          ingredientPercentage,
          comparedToBest
        });
      }
      return result;
    }
  },
  methods: {
    energyPerMember(member: MemberProduction): string | undefined {
      const pokemon = getPokemon(member.pokemonWithIngredients.pokemon);
      const skill = pokemon.skill;
      const critAmount = member.advanced.skillCritValue;
      const amountWithoutCrit = member.skillAmount - critAmount;

      const e4eSuffix = skill.isOrModifies(EnergyForEveryoneS) ? 'x5' : '';
      return `${MathUtils.round(amountWithoutCrit, 1)} ${e4eSuffix}${critAmount > 0 ? `+${MathUtils.round(critAmount, 1)}` : ''}`;
    },
    lowestIngredientPower(memberProduction: MemberProduction) {
      const amount = memberProduction.produceTotal.ingredients.reduce(
        (sum, cur) => sum + cur.amount * cur.ingredient.value * AVERAGE_WEEKLY_CRIT_MULTIPLIER,
        0
      );
      return Math.floor(amount * this.timeWindowFactor);
    },
    highestIngredientPower(memberProduction: MemberProduction) {
      const maxLevelRecipeMultiplier = recipeLevelBonus[MAX_RECIPE_LEVEL];
      const amount =
        maxLevelRecipeMultiplier *
        memberProduction.produceTotal.ingredients.reduce((sum, cur) => {
          const ingredientBonus = 1 + getMaxIngredientBonus(cur.ingredient.name) / 100;
          return sum + cur.amount * ingredientBonus * cur.ingredient.value * AVERAGE_WEEKLY_CRIT_MULTIPLIER;
        }, 0);
      return Math.floor(amount * this.timeWindowFactor);
    },
    setIngredientOptions(option: string) {
      this.selectedIngredientOption = option;
    },
    ingredientChipText() {
      switch (this.selectedIngredientOption) {
        case 'min':
          return 'Min ingredient strength';
        case 'max':
          return 'Max ingredient strength';
        default:
          return 'Ingredient strength';
      }
    },
    round(num: number) {
      return MathUtils.round(num, 1);
    },
    async calculateProduction(params: {
      member: PokemonInstanceExt;
      settings: TeamSettings;
    }): Promise<TeamProductionExt | undefined> {
      const { member, settings } = params;

      const parsedMember: PokemonInstanceIdentity = PokemonInstanceUtils.toPokemonInstanceIdentity(member);

      const response = await serverAxios.post<CalculateTeamResponse>('/calculator/team', {
        members: [parsedMember],
        settings
      });

      if (response.data.members.length != 1) {
        throw new Error('Something went wrong!');
      }

      const teamBerries: BerrySet[] = response.data.members[0].produceTotal.berries;
      const teamIngredients: IngredientSet[] = response.data.members[0].produceTotal.ingredients;
      // TODO: is team production used? cooking is used of course, but rest?
      const teamProduction: TeamCombinedProduction = {
        berries: teamBerries,
        ingredients: teamIngredients,
        cooking: response.data.cooking
      };

      return {
        members: response.data.members,
        team: teamProduction
      };
    },
    async berryMons() {
      const mons: Pokemon[] = ALL_BERRY_SPECIALISTS.filter((mon) => mon.remainingEvolutions === 0);
      const instances: PokemonInstanceExt[] = mons.map((mon) => {
        return {
          pokemon: mon,
          level: MAX_POKEMON_LEVEL,
          ribbon: 0,
          carrySize: CarrySizeUtils.baseCarrySize(mon),
          skillLevel: 1 + mon.previousEvolutions,
          nature: nature.SERIOUS,
          subskills: [
            {
              level: 10,
              subskill: subskill.BERRY_FINDING_S
            }
          ],
          ingredients: [
            {
              ...mon.ingredient0[0],
              level: 0
            },
            {
              ...mon.ingredient30[0],
              level: 30
            },
            {
              ...mon.ingredient60[0],
              level: 60
            }
          ],
          sneakySnacking: true,
          version: DOMAIN_VERSION,
          externalId: '',
          saved: false,
          shiny: false,
          gender: getRandomGender(mon),
          name: mon.displayName,
          rp: 0
        };
      });
      const teamSettings: TeamSettings = {
        camp: false,
        bedtime: DEFAULT_SLEEP.bedtime,
        wakeup: DEFAULT_SLEEP.wakeup,
        island: {
          ...GREENGRASS,
          areaBonus: 0
        }
      };
      const results: MemberProduction[] = await Promise.all(
        instances.map(async (member) => {
          const result = await this.calculateProduction({ member: member, settings: teamSettings });
          const production = result?.members[0];
          if (production === undefined) {
            throw new Error('Something went wrong!');
          }
          return production;
        })
      );
      this.listOfMons = results;
    }
  }
});
</script>

<style lang="scss" scoped>
:deep(.v-table > .v-table__wrapper > table > tbody > tr > td),
:deep(.v-table > .v-table__wrapper > table > tbody > tr > th),
:deep(.v-table > .v-table__wrapper > table > thead > tr > td),
:deep(.v-table > .v-table__wrapper > table > thead > tr > th) {
  padding: 0 0px !important;
  padding-left: 0px !important;
}

:deep(.v-table > .v-table__wrapper > table > tbody > tr > td:not(:last-child)),
:deep(.v-table > .v-table__wrapper > table > tbody > tr > th:not(:last-child)) {
  border-right: 1px solid #dddddd87;
}

.selected-chip {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: 'ingredient';
}
</style>
