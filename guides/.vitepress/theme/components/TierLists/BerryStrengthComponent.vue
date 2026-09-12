<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-card class="flex-center flex-column frosted-glass rounded-t-0 w-100">
    <v-container>
      <v-row class="d-flex align-center justify-space-between">
        <v-col class="d-flex align-center flex-wrap">
          <v-chip-group v-model="chips" column multiple>
            <v-chip
              text="Sneaky snacking"
              color="berry"
              variant="outlined"
              filter
              @vue:updated="runSimulations"
            ></v-chip>
            <v-chip text="Favored berry" color="skill" variant="outlined" filter @vue:updated="runSimulations"></v-chip>
            <v-chip
              text="Max skill level"
              color="skill"
              variant="outlined"
              filter
              @vue:updated="runSimulations"
            ></v-chip>
          </v-chip-group>

          <v-menu v-model="energyMenu" location="bottom start">
            <template #activator="{ props }">
              <v-chip
                v-bind="props"
                variant="outlined"
                :color="selectedEnergyOption !== 'none' ? 'energy' : ''"
                :text="energyChipText()"
                :class="{ 'selected-chip': selectedEnergyOption !== 'none' }"
                append-icon="mdi-menu-down"
                @vue:updated="runSimulations"
              >
                <template v-if="selectedEnergyOption !== 'none'" #prepend>
                  <v-icon>mdi-check</v-icon>
                </template>
              </v-chip>
            </template>

            <v-card color="surface">
              <v-radio-group v-model="selectedEnergyOption" column hide-details>
                <v-list-item
                  v-for="option in energyOptions"
                  :key="option.value"
                  class="px-2"
                  @click="setEnergyOptions(option.value)"
                >
                  <v-radio :label="option.label" :value="option.value" hide-details></v-radio>
                </v-list-item>
              </v-radio-group>
            </v-card>
          </v-menu>

          <v-menu v-model="skillMenu" location="bottom start">
            <template #activator="{ props }">
              <v-chip
                v-bind="props"
                variant="outlined"
                :color="selectedSkillOption !== 'ignore' ? 'skill' : ''"
                :text="skillChipText()"
                :class="{ 'selected-chip': selectedSkillOption !== 'ignore' }"
                append-icon="mdi-menu-down"
              >
                <template v-if="selectedSkillOption !== 'ignore'" #prepend>
                  <v-icon>mdi-check</v-icon>
                </template>
              </v-chip>
            </template>

            <v-card color="surface">
              <v-radio-group v-model="selectedSkillOption" column hide-details>
                <v-list-item
                  v-for="option in skillOptions"
                  :key="option.value"
                  class="px-2"
                  @click="setSkillOptions(option.value)"
                >
                  <v-radio :label="option.label" :value="option.value" hide-details></v-radio>
                </v-list-item>
              </v-radio-group>
            </v-card>
          </v-menu>

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
                  v-for="option in ingredientOptions"
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
                  color: 'color-semantic-berry-500',
                  percentage: member.berryPercentage,
                  sectionText: member.berryCompact,
                  tooltipText: `${member.berryCompact} (${round(member.berryPercentage)}%)`
                },
                {
                  color: 'color-semantic-skill-500',
                  percentage: member.skillPercentage,
                  sectionText: member.skillCompact,
                  tooltipText: `${member.skillCompact} (${round(member.skillPercentage)}%)`
                },
                {
                  color: 'color-semantic-dessert-500',
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
              <v-img :src="miscImage('strength')" height="24" width="24"></v-img>
            </div>
            <div class="flex-center text-center">
              {{ item.berries }}
            </div>
          </template>

          <template #item.ingredients="{ item }">
            <div class="flex-center">
              <v-img :src="miscImage('strength')" height="24" width="24"></v-img>
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
              <v-img :src="miscImage('strength')" height="24" width="24"></v-img>
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
  berry,
  berryPowerForLevel,
  CalculateTeamResponse,
  CarrySizeUtils,
  commonMocks,
  compactNumber,
  defaultZero,
  DOMAIN_VERSION,
  EnergyForEveryoneS,
  GARDEVOIR,
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
import { mainskillImage, miscImage, pokemonImage } from './image-utils';
import { DEFAULT_SLEEP } from './instanced';
import { PokemonInstanceUtils } from './pokemon-instance-utils';
import serverAxios from './server-axios';
import StackedBar from './stacked-bar.vue';
import type { DataTableHeader } from './table-header';

export interface PartialDataTableEntry {
  member: string;
  pokemon: Pokemon;
  shiny: boolean;
  berries: number;
  berryCompact: string;
  ingredients: number;
  ingredientPower: number;
  ingredientCompact: string;
  skill: Mainskill;
  skillPower: number;
  skillValue: string | number;
  skillCompact: string;
  energyPerMember: string | number | undefined;
  total: number;
  totalCompact: string;
}
export interface DataTableEntry extends PartialDataTableEntry {
  berryPercentage: number;
  skillPercentage: number;
  ingredientPercentage: number;
  comparedToBest: number;
}
export interface SimulationSettings {
  sneakySnacking: boolean;
  energy: string;
  favoredBerry: boolean;
  maxSkillLevel: boolean;
}

export default defineComponent({
  name: 'BerryStrengthComponent',
  components: { StackedBar },
  setup() {
    return {
      mainskillImage,
      pokemonImage,
      miscImage,
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
    chips: [0, 1, 2],
    tab: 'visual',
    tabs: [
      { value: 'visual', label: 'Visual' },
      { value: 'data', label: 'Data' }
    ],
    selectedEnergyOption: 'gardevoir',
    energyMenu: false,
    energyOptions: [
      { label: 'No extra energy', value: 'none' },
      { label: 'HSM STM Gardevoir', value: 'gardevoir' },
      { label: 'Infinite energy', value: 'infinite' }
    ],
    selectedIngredientOption: 'min',
    ingredientMenu: false,
    ingredientOptions: [
      { label: 'Ignore ingredients', value: 'ignore' },
      { label: 'Min ingredient strength', value: 'min' },
      { label: 'Max ingredient strength', value: 'max' }
    ],
    selectedSkillOption: 'all',
    skillMenu: false,
    skillOptions: [
      { label: 'Strength skills', value: 'strength' },
      { label: 'All skills', value: 'all' }
    ],
    listOfMons: new Map<number, MemberProduction[]>()
  }),
  async mounted() {
    await this.runSimulations();
  },
  computed: {
    sneakySnack() {
      return this.chips.includes(0);
    },
    favoredBerry() {
      return this.chips.includes(1);
    },
    maxSkillLevel() {
      return this.chips.includes(2);
    },
    useInfiniteEnergy() {
      return this.selectedEnergyOption === 'infinite';
    },
    currentSettings(): SimulationSettings {
      return {
        sneakySnacking: this.sneakySnack,
        energy: this.selectedEnergyOption,
        favoredBerry: this.favoredBerry,
        maxSkillLevel: this.maxSkillLevel
      };
    },
    serializedSettings(): number {
      const sneakySnacking = this.sneakySnack ? 1 : 0;
      const energy = this.selectedEnergyOption.length;
      const favoredBerry = this.favoredBerry ? 1 : 0;
      const maxSkillLevel = this.maxSkillLevel ? 1 : 0;
      return maxSkillLevel + 2 * favoredBerry + 4 * energy + 8 * sneakySnacking;
    },
    showIngredientMin() {
      return this.selectedIngredientOption === 'min';
    },
    showIngredientMax() {
      return this.selectedIngredientOption === 'max';
    },
    showStrengthSkills() {
      return this.selectedSkillOption === 'strength';
    },
    showAllSkills() {
      return this.selectedSkillOption === 'all';
    },
    allBerryMons(): PokemonInstanceExt[] {
      return ALL_BERRY_SPECIALISTS.filter((mon) => mon.remainingEvolutions === 0).map((mon) => {
        return {
          pokemon: mon,
          level: MAX_POKEMON_LEVEL,
          ribbon: 0,
          carrySize: CarrySizeUtils.baseCarrySize(mon),
          skillLevel: this.maxSkillLevel ? mon.skill.maxLevel : 1 + mon.previousEvolutions,
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
          sneakySnacking: this.sneakySnack,
          version: DOMAIN_VERSION,
          externalId: '',
          saved: false,
          shiny: false,
          gender: getRandomGender(mon),
          name: mon.displayName,
          rp: 0
        };
      });
    },
    gardevoir(): PokemonInstanceExt[] {
      const gardevoir = {
        pokemon: GARDEVOIR,
        level: MAX_POKEMON_LEVEL,
        ribbon: 0,
        carrySize: CarrySizeUtils.baseCarrySize(GARDEVOIR),
        skillLevel: GARDEVOIR.skill.maxLevel,
        nature: nature.SERIOUS,
        subskills: [
          {
            level: 10,
            subskill: subskill.SKILL_TRIGGER_M
          },
          {
            level: 25,
            subskill: subskill.HELPING_SPEED_M
          }
        ],
        ingredients: [
          {
            ...GARDEVOIR.ingredient0[0],
            level: 0
          },
          {
            ...GARDEVOIR.ingredient30[0],
            level: 30
          },
          {
            ...GARDEVOIR.ingredient60[0],
            level: 60
          }
        ],
        sneakySnacking: false,
        version: DOMAIN_VERSION,
        externalId: '',
        saved: false,
        shiny: false,
        gender: getRandomGender(GARDEVOIR),
        name: GARDEVOIR.displayName,
        rp: 0
      };
      return [gardevoir];
    },
    infiniteEnergyMon(): PokemonInstanceExt[] {
      const fakeMon = {
        pokemon: commonMocks.mockPokemon({
          ...GARDEVOIR,
          frequency: 3600,
          skillPercentage: 100,
          ingredientPercentage: 0,
          skill: EnergyForEveryoneS
        }),
        level: MAX_POKEMON_LEVEL,
        ribbon: 0,
        carrySize: CarrySizeUtils.baseCarrySize(GARDEVOIR),
        skillLevel: EnergyForEveryoneS.maxLevel,
        nature: nature.SERIOUS,
        subskills: [],
        ingredients: [
          {
            ...GARDEVOIR.ingredient0[0],
            level: 0
          },
          {
            ...GARDEVOIR.ingredient30[0],
            level: 30
          },
          {
            ...GARDEVOIR.ingredient60[0],
            level: 60
          }
        ],
        sneakySnacking: false,
        version: DOMAIN_VERSION,
        externalId: '',
        saved: false,
        shiny: false,
        gender: getRandomGender(GARDEVOIR),
        name: GARDEVOIR.displayName,
        rp: 0
      };
      return [fakeMon];
    },
    energyTeamMembers(): PokemonInstanceExt[] {
      switch (this.selectedEnergyOption) {
        case 'gardevoir':
          return this.gardevoir;
        case 'infinite':
          return this.infiniteEnergyMon;
        default:
          return [];
      }
    },
    members(): DataTableEntry[] {
      const memberProductions = this.listOfMons.get(this.serializedSettings);
      if (!memberProductions) return [];
      const productions = [] as PartialDataTableEntry[];
      for (const production of memberProductions) {
        const mon = getPokemon(production.pokemonWithIngredients.pokemon);
        const berryPower = this.helpBerryPower(production);
        const ingredientPower = this.helpIngredientPower(production);
        const skillPower = this.strengthSkillPower(production);
        const skillValue = this.showAllSkills
          ? this.allSkillValue(production, mon.skill)
          : this.showStrengthSkills
            ? this.strengthSkillPower(production)
            : 'Undefined';

        const total = Math.floor(berryPower + ingredientPower + skillPower);

        productions.push({
          member: production.pokemonWithIngredients.pokemon,
          pokemon: mon,
          shiny: false,
          berries: berryPower,
          berryCompact: compactNumber(berryPower),
          ingredients: production.produceTotal.ingredients.reduce((sum, cur) => sum + cur.amount, 0),
          ingredientPower,
          ingredientCompact: compactNumber(ingredientPower),
          skill: mon.skill,
          skillPower,
          skillValue,
          skillCompact: skillPower > 0 ? compactNumber(skillPower) : '',
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
        const skillPercentage = defaultZero((member.skillPower / highestTotal) * 100);
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
    helpBerryPower(memberProduction: MemberProduction) {
      const berries = memberProduction.produceWithoutSkill.berries;
      let strength = berries.reduce((sum, cur) => sum + cur.amount * berryPowerForLevel(cur.berry, cur.level), 0);
      if (this.favoredBerry) strength *= 2;
      return Math.floor(strength);
    },
    helpIngredientPower(memberProduction: MemberProduction) {
      return this.showIngredientMax
        ? this.highestIngredientPower(memberProduction.produceWithoutSkill.ingredients)
        : this.showIngredientMin
          ? this.lowestIngredientPower(memberProduction.produceWithoutSkill.ingredients)
          : 0;
    },
    lowestIngredientPower(ingredients: IngredientSet[]) {
      const amount = ingredients.reduce(
        (sum, cur) => sum + cur.amount * cur.ingredient.value * AVERAGE_WEEKLY_CRIT_MULTIPLIER,
        0
      );
      return Math.floor(amount);
    },
    highestIngredientPower(ingredients: IngredientSet[]) {
      const maxLevelRecipeMultiplier = recipeLevelBonus[MAX_RECIPE_LEVEL];
      const amount =
        maxLevelRecipeMultiplier *
        ingredients.reduce((sum, cur) => {
          const ingredientBonus = 1 + getMaxIngredientBonus(cur.ingredient.name) / 100;
          return sum + cur.amount * ingredientBonus * cur.ingredient.value * AVERAGE_WEEKLY_CRIT_MULTIPLIER;
        }, 0);
      return Math.floor(amount);
    },
    setIngredientOptions(option: string) {
      this.selectedIngredientOption = option;
    },
    ingredientChipText() {
      const selectedOption = this.ingredientOptions.find((option) => option.value == this.selectedIngredientOption);
      if (!selectedOption || selectedOption.value === 'ignore') return 'Ingredient strength';
      return selectedOption.label;
    },
    strengthSkillPower(memberProduction: MemberProduction) {
      const berries = memberProduction.produceFromSkill.berries;
      const berryStrength = berries.reduce(
        (sum, cur) => sum + cur.amount * berryPowerForLevel(cur.berry, cur.level),
        0
      );
      const ingredients = memberProduction.produceFromSkill.ingredients;
      const ingredientStrength = this.showIngredientMax
        ? this.highestIngredientPower(ingredients)
        : this.showIngredientMin
          ? this.lowestIngredientPower(ingredients)
          : 0;
      const skillStrength =
        defaultZero(memberProduction.skillValue['strength']?.amountToSelf) +
        defaultZero(memberProduction.skillValue['strength']?.amountToTeam);
      return Math.floor(berryStrength + ingredientStrength + skillStrength);
    },
    allSkillValue(memberProduction: MemberProduction, skill: Mainskill) {
      let skillValue = 0;
      for (const skillUnit of skill.getUnits()) {
        skillValue += MathUtils.round(
          defaultZero(memberProduction.skillValue[skillUnit]?.amountToSelf) +
            defaultZero(memberProduction.skillValue[skillUnit]?.amountToTeam),
          1
        );
      }
      return Math.floor(skillValue);
    },
    setSkillOptions(option: string) {
      this.selectedSkillOption = option;
    },
    skillChipText() {
      const selectedOption = this.skillOptions.find((option) => option.value == this.selectedSkillOption);
      if (!selectedOption) return 'Skill setting';
      return selectedOption.label;
    },
    setEnergyOptions(option: string) {
      this.selectedEnergyOption = option;
    },
    energyChipText() {
      const selectedOption = this.energyOptions.find((option) => option.value == this.selectedEnergyOption);
      if (!selectedOption) return 'Energy setting';
      return selectedOption.label;
    },
    round(num: number) {
      return MathUtils.round(num, 1);
    },
    async calculateProduction(params: {
      members: PokemonInstanceExt[];
      settings: TeamSettings;
    }): Promise<MemberProduction | undefined> {
      const { members, settings } = params;

      const parsedMembers: PokemonInstanceIdentity[] = members.map((member) =>
        PokemonInstanceUtils.toPokemonInstanceIdentity(member)
      );

      const response = await serverAxios.post<CalculateTeamResponse>('/calculator/team', {
        members: parsedMembers,
        settings
      });

      if (response.data.members.length == 0) {
        throw new Error('Something went wrong!');
      }

      return response.data.members[0];
    },
    async runSimulations() {
      const settings = this.serializedSettings;
      if (this.listOfMons.has(settings)) return;
      this.listOfMons.set(settings, []);

      const teamSettings: TeamSettings = {
        camp: false,
        bedtime: this.useInfiniteEnergy ? '0:00' : DEFAULT_SLEEP.bedtime,
        wakeup: this.useInfiniteEnergy ? '1:00' : DEFAULT_SLEEP.wakeup,
        island: {
          ...GREENGRASS,
          areaBonus: 0,
          berries: this.favoredBerry ? berry.BERRIES : []
        }
      };
      const results: MemberProduction[] = await Promise.all(
        this.allBerryMons.map(async (member) => {
          const result = await this.calculateProduction({
            members: [member].concat(this.energyTeamMembers),
            settings: teamSettings
          });
          if (!result) {
            throw new Error('Something went wrong!');
          }
          this.listOfMons.get(settings)!.push(result);
          return result;
        })
      );
      this.listOfMons.set(settings, results);
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
