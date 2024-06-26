/**
 * Copyright 2024 Sleep API Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { IngredientSet } from '../../domain';
import { Nature } from '../../domain/nature/nature';
import { Pokemon } from '../../domain/pokemon';
import {
  DREAM_SHARD_BONUS,
  ENERGY_RECOVERY_BONUS,
  HELPING_BONUS,
  HELPING_SPEED_M,
  HELPING_SPEED_S,
  INVENTORY_L,
  INVENTORY_M,
  INVENTORY_S,
  RESEARCH_EXP_BONUS,
  SLEEP_EXP_BONUS,
  SubSkill,
} from '../../domain/subskill/subskill';
import { PokemonInstanceExt } from '../../domain/types/pokemon-instance';
import { MathUtils } from '../../utils/math-utils';
import { invertNatureFrequency } from '../../utils/nature-utils';
import {
  calculateIngredientPercentage,
  calculateNrOfBerriesPerDrop,
  calculateSkillPercentage,
} from '../../utils/stat-utils';

export class RP {
  private pokemon: Pokemon;
  private ingredientSet: IngredientSet[];
  private level: number;
  private skillLevel: number;
  private nature: Nature;
  private subskills: SubSkill[];

  constructor(pokemonInstance: PokemonInstanceExt) {
    this.ingredientSet = [];
    this.pokemon = pokemonInstance.pokemon;
    this.level = pokemonInstance.level;
    this.skillLevel = pokemonInstance.skillLevel;
    this.nature = pokemonInstance.nature;
    this.ingredientSet = this.filteredIngredientSet(pokemonInstance);
    this.subskills = this.filteredSubskills(pokemonInstance);
  }

  calc() {
    const miscFactor = this.miscFactor;
    const ingredientFactor = this.ingredientFactor;
    const berryFactor = this.berryFactor;
    const skillFactor = this.skillFactor;

    return Math.round(miscFactor * (ingredientFactor + berryFactor + skillFactor));
  }

  get helpFactor() {
    const levelFactor = 1 - 0.002 * (this.level - 1);
    const natureFreq = invertNatureFrequency(this.nature);
    const helpSpeedSubskills = this.frequencySubskills;

    return (
      5 *
      MathUtils.floor(
        3600 / (this.pokemon.frequency * MathUtils.floor(levelFactor * natureFreq * helpSpeedSubskills, 4)),
        2,
      )
    );
  }

  get ingredientChance() {
    return MathUtils.floor(
      calculateIngredientPercentage({ pokemon: this.pokemon, nature: this.nature, subskills: this.subskills }),
      4,
    );
  }

  get skillChance() {
    return MathUtils.floor(calculateSkillPercentage(this.pokemon, this.subskills, this.nature), 4);
  }

  get ingredientFactor() {
    // TODO: We make assumption regarding ingredient growth past 55
    // TODO: We make assumption regarding ingredientsValue being same value for 60 ingredient and divide by 3 then
    const ingredientGrowth =
      this.ingGrowth[this.level] ??
      0.000000398 * Math.pow(this.level, 3) + 0.000159 * Math.pow(this.level, 2) + 0.00367 * this.level - 0.00609 + 1;

    const ingredientsValue = Math.floor(
      this.ingredientSet.reduce((sum, cur) => (sum += cur.amount * cur.ingredient.value), 0) /
        this.ingredientSet.length,
    );

    return MathUtils.floor(this.helpFactor * this.ingredientChance * ingredientsValue * ingredientGrowth, 2);
  }

  get berryFactor() {
    const berriesPerDrop = calculateNrOfBerriesPerDrop(this.pokemon, this.subskills);
    const berryValue =
      berriesPerDrop *
      Math.max(
        this.pokemon.berry.value + this.level - 1,
        Math.round(Math.pow(1.025, this.level - 1) * this.pokemon.berry.value),
      );

    return MathUtils.floor(this.helpFactor * (1 - this.ingredientChance) * berryValue, 2);
  }

  get skillFactor() {
    const skillValue = this.pokemon.skill.RP[this.skillLevel - 1];
    return MathUtils.floor(this.helpFactor * this.skillChance * skillValue, 2);
  }

  get miscFactor() {
    const convertedNatureEnergy = this.nature.energy < 1 ? 0.92 : this.nature.energy > 1 ? 1.08 : 1;

    let subskillFactor = 1;
    for (const sub of this.subskills) {
      subskillFactor += this.subskillValue[sub.name] ?? 0;
    }

    return MathUtils.floor(convertedNatureEnergy * subskillFactor, 2);
  }

  get frequencySubskills() {
    const helpM = this.subskills.some(({ name }) => name === HELPING_SPEED_M.name) ? HELPING_SPEED_M.amount : 0;
    const helpS = this.subskills.some(({ name }) => name === HELPING_SPEED_S.name) ? HELPING_SPEED_S.amount : 0;

    return Math.max(0.65, 1 - helpM - helpS);
  }

  private subskillValue: { [name: string]: number } = {
    [DREAM_SHARD_BONUS.name]: 0.221,
    [ENERGY_RECOVERY_BONUS.name]: 0.221,
    [HELPING_BONUS.name]: 0.221,
    [RESEARCH_EXP_BONUS.name]: 0.221,
    [SLEEP_EXP_BONUS.name]: 0.221,
    [INVENTORY_S.name]: 0.071,
    [INVENTORY_M.name]: 0.139,
    [INVENTORY_L.name]: 0.181,
  };

  private ingGrowth: { [level: number]: number } = {
    1: 1.0,
    2: 1.003,
    3: 1.007,
    4: 1.011,
    5: 1.016,
    6: 1.021,
    7: 1.027,
    8: 1.033,
    9: 1.039,
    10: 1.046,
    11: 1.053,
    12: 1.061,
    13: 1.069,
    14: 1.077,
    15: 1.085,
    16: 1.094,
    17: 1.104,
    18: 1.114,
    19: 1.124,
    20: 1.134,
    21: 1.145,
    22: 1.156,
    23: 1.168,
    24: 1.18,
    25: 1.192,
    26: 1.205,
    27: 1.218,
    28: 1.231,
    29: 1.245,
    30: 1.259,
    31: 1.274,
    32: 1.288,
    33: 1.303,
    34: 1.319,
    35: 1.335,
    36: 1.351,
    37: 1.368,
    38: 1.385,
    39: 1.402,
    40: 1.42,
    41: 1.439,
    42: 1.457,
    43: 1.477,
    44: 1.496,
    45: 1.517,
    46: 1.537,
    47: 1.558,
    48: 1.58,
    49: 1.602,
    50: 1.625,
    51: 1.648,
    52: 1.671,
    53: 1.696,
    54: 1.72,
    55: 1.745,
  };

  private filteredSubskills(pokemonInstance: PokemonInstanceExt) {
    return pokemonInstance.subskills.filter((sub) => sub.level <= pokemonInstance.level).map((sub) => sub.subskill);
  }

  private filteredIngredientSet(pokemonInstance: PokemonInstanceExt): IngredientSet[] {
    const { pokemon, ingredients, level } = pokemonInstance;

    const ingredientSet: IngredientSet[] = [pokemon.ingredient0];

    const ingredient30 = pokemon.ingredient30.find(
      (ingList) =>
        ingList.ingredient.name.toLowerCase() ===
        ingredients.find((ing) => ing.level === 30)?.ingredient.name.toLowerCase(),
    );
    if (ingredient30 && level >= 30) {
      ingredientSet.push(ingredient30);
    }

    const ingredient60 = pokemon.ingredient60.find(
      (ingList) =>
        ingList.ingredient.name.toLowerCase() ===
        ingredients.find((ing) => ing.level === 60)?.ingredient.name.toLowerCase(),
    );
    if (ingredient60 && level >= 60) {
      ingredientSet.push(ingredient60);
    }

    return ingredientSet;
  }
}
