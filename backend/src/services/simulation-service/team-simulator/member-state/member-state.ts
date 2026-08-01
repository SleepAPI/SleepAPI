import type { SleepInfo } from '@src/domain/sleep/sleep-info.js';
import { calculateSleepEnergyRecovery } from '@src/services/calculator/energy/energy-calculator.js';
import type { CookingState } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-state.js';
import { calculateDistribution } from '@src/services/simulation-service/team-simulator/member-state/member-state-utils.js';
import type {
  SkillActivation,
  TeamActivationValue
} from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { TeamSimulatorUtils } from '@src/services/simulation-service/team-simulator/team-simulator-utils.js';
import { getMealRecoveryAmount } from '@src/utils/meal-utils/meal-utils.js';
import type { PreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import { createPreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import type {
  BerryIndexToFloatAmount,
  BerrySet,
  ExpertModeSettings,
  IngredientIndexToFloatAmount,
  IngredientIndexToIntAmount,
  IngredientSet,
  MemberProduction,
  MemberProductionBase,
  PokemonWithIngredientsIndexed,
  Produce,
  SimpleTeamResult,
  TeamMember,
  TeamSettings,
  TimePeriod
} from 'sleepapi-common';
import {
  AVERAGE_WEEKLY_CRIT_MULTIPLIER,
  CarrySizeUtils,
  ING_ID_LOOKUP,
  MAX_ENERGY_RECOVERY,
  MAX_ENERGY_RECOVERY_ERB,
  MAX_POT_SIZE,
  MathUtils,
  berrySetToFlat,
  calculateNrOfBerriesPerDrop,
  emptyBerryInventoryFloat,
  emptyIngredientInventoryFloat,
  emptyIngredientInventoryInt,
  flatToIngredientSet,
  hasSpecialty,
  ingredientSetToFloatFlat,
  ingredientSetToIntFlat,
  multiplyProduce,
  subskill
} from 'sleepapi-common';

import { StrengthCalculator } from '../strength-calculator/strength-calculator.js';

export type HelpPeriod = 'day' | 'night';

export class MemberState {
  member: TeamMember;
  team: TeamMember[];
  otherMembers: MemberState[] = [];
  cookingState?: CookingState;
  private skillState: SkillState;
  private settings: TeamSettings;
  private camp: boolean;
  private rng: PreGeneratedRandom;

  // quick lookups, static data
  private pokemonWithIngredients: PokemonWithIngredientsIndexed;

  // state
  private currentEnergy = 0;
  disguiseBusted = false;
  private nextHelp: number;
  private currentNightHelps = 0;
  private dayPeriod: TimePeriod;
  private nightPeriod: TimePeriod;
  private fullDayDuration = 1440;
  private carriedAmount = 0;
  private totalAverageHelps = 0;
  private totalSneakySnackHelps = 0;
  private totalBerryProduction = 0;
  private totalIngredientProduction: IngredientIndexToFloatAmount = emptyIngredientInventoryFloat();
  private voidIngredients: IngredientIndexToFloatAmount = emptyIngredientInventoryFloat();
  private voidIngredientsDay: IngredientIndexToFloatAmount = emptyIngredientInventoryFloat();

  private berryProductionPerDay: Int16Array;
  private ingredientProductionPerDay: IngredientIndexToIntAmount[];
  private currentDay = 0;
  private totalDays: number;

  // ingredient sets
  private level0IngredientSet: IngredientSet;
  private level30IngredientSet?: IngredientSet;
  private level60IngredientSet?: IngredientSet;

  // stats
  private frequency0;
  private frequency1;
  private frequency40;
  private frequency60;
  private frequency80;
  public skillPercentage: number;
  private ingredientPercentage: number;

  // precomputed berry drop amounts
  private berryDropAmounts: BerryIndexToFloatAmount = emptyBerryInventoryFloat();
  private berryDropAmount = 0;

  // summary

  // TODO: move to skill-state
  private skillProduce: Produce = CarrySizeUtils.getEmptyInventory();
  private totalRecovery = 0;
  private wastedEnergy = 0;

  private energyIntervalsDay = 0;
  private energyIntervalsNight = 0;
  private frequencyIntervalsDay = 0;
  private frequencyIntervalsNight = 0;
  private morningProcs = 0;
  private totalDayHelps = 0;
  private totalNightHelps = 0;
  private nightHelpsBeforeSS = 0;
  private nightHelpsAfterSS = 0;
  private helpsAtFrequency0 = 0;
  private helpsAtFrequency1 = 0;
  private helpsAtFrequency40 = 0;
  private helpsAtFrequency60 = 0;
  private helpsAtFrequency80 = 0;

  // team members support
  private totalHealedByMembers = 0;
  private totalHelpsByMembers = 0;

  // This tracks the actual amount of ingredients accumulated since last cook
  private ingredientsSinceLastCook = emptyIngredientInventoryFloat();

  // Integer thresholds for uint8 comparisons (0-255)
  private ingredient0ThresholdInt: number;
  private ingredient30ThresholdInt: number;
  private ingredient60ThresholdInt: number;

  // precomputed ingredient ids and amounts
  private level0IngredientId: number;
  private level30IngredientId?: number;
  private level60IngredientId?: number;
  private level0IngredientAmount: number;
  private level30IngredientAmount?: number;
  private level60IngredientAmount?: number;

  // expert mode ingredient bonus — specialists roll an additional +1 at runtime
  private expertIngredientSpecialistBonus = false;

  constructor(params: {
    member: TeamMember;
    team: TeamMember[];
    settings: TeamSettings;
    cookingState: CookingState | undefined;
    iterations?: number;
    rng?: PreGeneratedRandom;
  }) {
    const { member, team, settings, cookingState, iterations = 1, rng } = params;

    this.rng = rng || createPreGeneratedRandom();

    // Initialize the daily production arrays with the total number of days we'll simulate
    // Each iteration is one day
    this.totalDays = iterations;
    this.berryProductionPerDay = new Int16Array(iterations);
    this.ingredientProductionPerDay = Array.from({ length: iterations }, emptyIngredientInventoryInt);

    this.settings = settings;
    this.camp = settings.camp;
    this.cookingState = cookingState;

    // list already filtered for level
    const teamHelpingBonus = team.filter(
      (otherMember) =>
        otherMember.settings.externalId !== member.settings.externalId &&
        otherMember.settings.subskills.has(subskill.HELPING_BONUS.name)
    ).length;

    const nightPeriod = {
      start: settings.bedtime,
      end: settings.wakeup
    };
    const dayPeriod = {
      start: settings.wakeup,
      end: settings.bedtime
    };
    this.nightPeriod = nightPeriod;
    this.dayPeriod = dayPeriod;

    this.nextHelp = this.fullDayDuration; // set to 1440, first start of day subtracts 1440

    this.skillPercentage = TeamSimulatorUtils.calculateSkillPercentage(member);
    this.ingredientPercentage = TeamSimulatorUtils.calculateIngredientPercentage(member);

    const ingredientsUnlocked = Math.min(Math.floor(member.settings.level / 30) + 1, 3);
    member.pokemonWithIngredients.ingredientList = member.pokemonWithIngredients.ingredientList.slice(
      0,
      ingredientsUnlocked
    );

    const pokemonIngredientListFlat = ingredientSetToIntFlat(member.pokemonWithIngredients.ingredientList);
    this.pokemonWithIngredients = {
      pokemon: member.pokemonWithIngredients.pokemon.name,
      ingredients: pokemonIngredientListFlat
    };

    // Initialize ingredient sets from the Pokemon's actual ingredient list
    const ingredientList = member.pokemonWithIngredients.ingredientList;

    // Level 0 ingredient is always the first one
    this.level0IngredientSet = ingredientList[0];

    // Level 30 ingredient is second if available
    if (member.settings.level >= 30 && ingredientList.length > 1 && ingredientList[1].ingredient.value > 0) {
      this.level30IngredientSet = ingredientList[1];

      // Level 60 ingredient is third if available and if level 30 isn't locked.
      // The third ingredient can't be unlocked before the second is unlocked. If the
      // user enters an invalid list, like Sausage/Locked/Sausage, we treat it as if
      // everything after the first locked ingredient is also locked.
      if (member.settings.level >= 60 && ingredientList.length > 2 && ingredientList[2].ingredient.value > 0) {
        this.level60IngredientSet = ingredientList[2];
      }
    }

    // Calculate raw production amounts without probability adjustments
    const memberBerryInList = berrySetToFlat([
      {
        amount: 1,
        berry: member.pokemonWithIngredients.pokemon.berry,
        level: member.settings.level
      }
    ]);
    const berriesPerDrop = calculateNrOfBerriesPerDrop(
      member.pokemonWithIngredients.pokemon,
      member.settings.subskills
    );

    this.berryDropAmounts = memberBerryInList.map((amount: number) => amount * berriesPerDrop);
    this.berryDropAmount = Math.max(...this.berryDropAmounts);

    const frequency = TeamSimulatorUtils.calculateHelpSpeedBeforeEnergy({
      member,
      settings,
      teamHelpingBonus
    });
    // TODO: not nice to duplicate this between here and energy utils in case brackets change
    this.frequency0 = frequency * 1; // 0 energy
    this.frequency1 = frequency * 0.66; // 1-39 energy
    this.frequency40 = frequency * 0.58; // 40-59 energy
    this.frequency60 = frequency * 0.52; // 60-79 energy
    this.frequency80 = frequency * 0.45; // 80+ energy

    this.member = member;
    this.team = team; // this needs updating when we add team rotation
    this.skillState = new SkillState(this, this.rng);

    // Calculate thresholds locally
    const ingredient0Threshold = 1 - this.ingredientPercentage;
    let ingredient30Threshold: number;
    let ingredient60Threshold: number;

    if (this.level60IngredientSet) {
      const ingredientChunk = this.ingredientPercentage / 3;
      ingredient30Threshold = ingredient0Threshold + ingredientChunk;
      ingredient60Threshold = ingredient30Threshold + ingredientChunk;
    } else if (this.level30IngredientSet) {
      const ingredientChunk = this.ingredientPercentage / 2;
      ingredient30Threshold = ingredient0Threshold + ingredientChunk;
      // NB: Math.random() is [0, 1) so 1.0 is never rolled
      ingredient60Threshold = 1.0;
    } else {
      ingredient30Threshold = 1.0;
      ingredient60Threshold = 1.0;
    }

    // Pre-compute ingredient IDs and amounts
    this.level0IngredientId = ING_ID_LOOKUP[this.level0IngredientSet.ingredient.name];
    this.level0IngredientAmount = this.level0IngredientSet.amount;

    if (this.level30IngredientSet) {
      this.level30IngredientId = ING_ID_LOOKUP[this.level30IngredientSet.ingredient.name];
      this.level30IngredientAmount = this.level30IngredientSet.amount;
    }

    if (this.level60IngredientSet) {
      this.level60IngredientId = ING_ID_LOOKUP[this.level60IngredientSet.ingredient.name];
      this.level60IngredientAmount = this.level60IngredientSet.amount;
    }

    // Integer thresholds for uint8 comparisons (0-255)
    this.ingredient0ThresholdInt = Math.round(ingredient0Threshold * 255);
    this.ingredient30ThresholdInt = Math.round(ingredient30Threshold * 255);
    this.ingredient60ThresholdInt = Math.round(ingredient60Threshold * 255);

    this.increaseIngredientDropForExpertMode();
  }

  get level() {
    return this.member.settings.level;
  }

  get skill() {
    return this.member.pokemonWithIngredients.pokemon.skill;
  }

  get teamSize() {
    return this.team.length;
  }

  get berry() {
    return this.member.pokemonWithIngredients.pokemon.berry;
  }

  get inventoryLimit() {
    // camp, subskills, ribbon etc already calculated in controller
    return this.member.settings.carrySize;
  }

  get energy() {
    return this.currentEnergy;
  }

  get id() {
    return this.member.settings.externalId;
  }

  get isSneakySnacking() {
    return this.member.settings.sneakySnacking;
  }

  public wakeUp() {
    const nrOfErb = TeamSimulatorUtils.countMembersWithSubskill(this.team, subskill.ENERGY_RECOVERY_BONUS.name);
    const sleepInfo: SleepInfo = {
      period: this.nightPeriod,
      incense: false,
      erb: nrOfErb,
      nature: this.member.settings.nature
    };
    this.skillState.wakeup();

    // Increment day counter
    this.currentDay = (this.currentDay + 1) % this.totalDays;

    const maxEnergyRecovery = this.member.settings.subskills.has(subskill.ENERGY_RECOVERY_BONUS.name)
      ? MAX_ENERGY_RECOVERY_ERB
      : MAX_ENERGY_RECOVERY;

    const missingEnergy = Math.max(0, maxEnergyRecovery - this.currentEnergy);
    const recoveredEnergy = Math.min(missingEnergy, calculateSleepEnergyRecovery(sleepInfo, maxEnergyRecovery));
    this.currentEnergy += recoveredEnergy;

    this.disguiseBusted = false;

    this.nextHelp -= this.fullDayDuration;
  }

  /**
   * @returns any leftover (wasted) energy
   */
  public recoverEnergy(recovered: number, invoker: MemberState) {
    const recoveredWithNature = recovered * this.member.settings.nature.energy;
    const clampedEnergyRecovered =
      this.currentEnergy + recoveredWithNature > 150 ? 150 - this.currentEnergy : recoveredWithNature;
    const wastedEnergy = recoveredWithNature - clampedEnergyRecovered;

    this.currentEnergy += clampedEnergyRecovered;
    this.totalRecovery += clampedEnergyRecovered;
    invoker.wastedEnergy += wastedEnergy;

    if (invoker.id !== this.id) {
      this.totalHealedByMembers += clampedEnergyRecovered;
    }

    return {
      recovered: clampedEnergyRecovered,
      wasted: wastedEnergy
    };
  }

  public addSkillValue(skillValue: TeamActivationValue) {
    this.skillState.addValue(skillValue);
  }

  public addSkillProduce(produce: Produce) {
    this.skillProduce = CarrySizeUtils.addToInventory(this.skillProduce, produce);
  }

  /**
   * Add helps coming from main skills like Extra Helpful
   * @param helps The activation that provides the extra helps
   * @param invoker The member whose main skill provided the extra helps
   */
  public addHelpsFromSkill(helps: TeamActivationValue, invoker: MemberState) {
    const { regular, crit } = helps;
    const totalHelps = regular + crit;

    if (invoker.id !== this.id) {
      this.totalHelpsByMembers += totalHelps;
    }

    // Perform rolls for each help
    for (let i = 0; i < totalHelps; i++) {
      this.addBerriesAndIngredientsForHelp('day', false);
    }
  }

  /**
   * Add skill-only helps coming from main skills like Nuzzle (Energizing Cheer S)
   * @param helps The activation that provides the extra skill helps
   * @param invoker The member whose main skill provided the extra skill helps
   */
  public addSkillHelps(helps: TeamActivationValue): SkillActivation[] {
    const { regular, crit } = helps;
    const totalHelps = regular + crit;
    let successfulActivation = false;

    for (let i = 0; i < totalHelps; ++i) {
      if (this.rng() < this.skillState.skillPercentage) {
        successfulActivation = true;
        break;
      }
    }

    if (successfulActivation) {
      return [this.skillState.addBonusActivation()];
    }

    return [];
  }

  public updateIngredientBag() {
    // Since we're tracking actual ingredient amounts in Float32Array, we can directly use it
    this.cookingState?.addIngredients(this.ingredientsSinceLastCook);

    // Zero out the array instead of allocating a new one
    this.ingredientsSinceLastCook.fill(0);
  }

  public recoverMeal() {
    const recovered = getMealRecoveryAmount(this.currentEnergy);
    const clampedRecovered = this.currentEnergy + recovered > 150 ? 150 - this.currentEnergy : recovered;
    this.totalRecovery += clampedRecovered;
    this.currentEnergy += clampedRecovered;
  }

  public rollBerriesAndIngredients(): {
    berryAmount: number;
    ingredient0Amount: number;
    ingredient30Amount: number;
    ingredient60Amount: number;
    ingredientId: number | undefined;
  } {
    // Use uint8 for direct integer comparison
    const rollInt = this.rng.getUint8();

    if (rollInt < this.ingredient0ThresholdInt) {
      return {
        berryAmount: this.berryDropAmount,
        ingredient0Amount: 0,
        ingredient30Amount: 0,
        ingredient60Amount: 0,
        ingredientId: undefined
      };
    } else if (rollInt < this.ingredient30ThresholdInt) {
      return {
        berryAmount: 0,
        ingredient0Amount: this.level0IngredientAmount + this.rollExpertIngredientBonus(),
        ingredient30Amount: 0,
        ingredient60Amount: 0,
        ingredientId: this.level0IngredientId
      };
    } else if (rollInt < this.ingredient60ThresholdInt) {
      return {
        berryAmount: 0,
        ingredient0Amount: 0,
        ingredient30Amount: this.level30IngredientAmount! + this.rollExpertIngredientBonus(),
        ingredient60Amount: 0,
        ingredientId: this.level30IngredientId!
      };
    } else {
      return {
        berryAmount: 0,
        ingredient0Amount: 0,
        ingredient30Amount: 0,
        ingredient60Amount: this.level60IngredientAmount! + this.rollExpertIngredientBonus(),
        ingredientId: this.level60IngredientId!
      };
    }
  }

  public addBerriesAndIngredientsForHelp(period: HelpPeriod, useInventoryLimit: boolean = true) {
    this.totalAverageHelps += 1;
    if (period === 'day') {
      this.totalDayHelps += 1;
    } else {
      this.totalNightHelps += 1;
    }

    const { berryAmount, ingredient0Amount, ingredient30Amount, ingredient60Amount, ingredientId } =
      this.rollBerriesAndIngredients();
    const totalDropAmount = berryAmount + ingredient0Amount + ingredient30Amount + ingredient60Amount;

    if (ingredientId === undefined) {
      this.totalBerryProduction += totalDropAmount;
      this.berryProductionPerDay[this.currentDay] += totalDropAmount;
    } else {
      let dropAmount = totalDropAmount;
      if (useInventoryLimit) {
        dropAmount = Math.min(totalDropAmount, this.inventoryLimit);
        if (period === 'day') {
          this.voidIngredientsDay[ingredientId!] += totalDropAmount - dropAmount;
        } else {
          this.voidIngredients[ingredientId!] += totalDropAmount - dropAmount;
        }
      }

      this.totalIngredientProduction[ingredientId] += dropAmount;
      this.ingredientProductionPerDay[this.currentDay][ingredientId] += dropAmount;
      this.ingredientsSinceLastCook[ingredientId] += dropAmount;
    }
  }

  public attemptDayHelp(currentMinutesSincePeriodStart: number): SkillActivation[] {
    const frequency = this.calculateFrequencyWithEnergy();
    this.countFrequencyAndEnergyIntervals('day', frequency);

    if (currentMinutesSincePeriodStart < this.nextHelp) {
      return [];
    }

    if (this.isSneakySnacking) {
      this.attemptSneakySnackingHelp('day');
      return [];
    }

    this.addBerriesAndIngredientsForHelp('day');
    return this.skillState.attemptSkill();
  }

  public attemptSneakySnackingHelp(period: HelpPeriod) {
    this.totalAverageHelps += 1;
    this.totalSneakySnackHelps += 1;
    if (period === 'day') {
      this.totalDayHelps += 1;
    } else {
      this.totalNightHelps += 1;
    }

    // Berry drop
    this.totalBerryProduction += this.berryDropAmount;
    this.berryProductionPerDay[this.currentDay] += this.berryDropAmount;

    // Track spilled ingredients
    const { ingredient0Amount, ingredient30Amount, ingredient60Amount, ingredientId } =
      this.rollBerriesAndIngredients();
    if (ingredientId !== undefined) {
      this.voidIngredients[ingredientId] += ingredient0Amount + ingredient30Amount + ingredient60Amount;
    }
  }

  public attemptNightHelp(currentMinutesSincePeriodStart: number) {
    const frequency = this.calculateFrequencyWithEnergy();
    this.countFrequencyAndEnergyIntervals('night', frequency);

    if (currentMinutesSincePeriodStart < this.nextHelp) {
      return;
    }

    const inventorySpace = Math.max(0, this.inventoryLimit - this.carriedAmount);

    // Sneaky-snacking case
    if (inventorySpace <= 0 || this.isSneakySnacking) {
      this.nightHelpsAfterSS += 1;
      this.attemptSneakySnackingHelp('night');
      this.nextHelp += frequency / 60;
      return;
    }

    // Ignoring inventory space for now, calculate what the help would be
    const { berryAmount, ingredient0Amount, ingredient30Amount, ingredient60Amount, ingredientId } =
      this.rollBerriesAndIngredients();
    const totalDropAmount = berryAmount + ingredient0Amount + ingredient30Amount + ingredient60Amount;

    // update stats
    this.totalNightHelps += 1;
    this.currentNightHelps += 1; // these run skill procs at wakeup
    this.nightHelpsBeforeSS += 1;

    // Calculate how much of the help fits in the bag
    const dropAmount = Math.min(totalDropAmount, inventorySpace);
    const helpRatio = dropAmount / totalDropAmount;
    this.totalAverageHelps += helpRatio;

    this.carriedAmount += dropAmount;

    if (ingredientId === undefined) {
      // Berry drop
      this.totalBerryProduction += dropAmount;
      this.berryProductionPerDay[this.currentDay] += dropAmount;
    } else {
      // Ingredient drop
      this.totalIngredientProduction[ingredientId] += dropAmount;
      this.ingredientProductionPerDay[this.currentDay][ingredientId] += dropAmount;
      this.ingredientsSinceLastCook[ingredientId] += dropAmount;

      this.voidIngredients[ingredientId!] += totalDropAmount - dropAmount;
    }

    this.nextHelp += frequency / 60;
  }

  public scheduleHelp(currentMinutesSincePeriodStart: number) {
    if (currentMinutesSincePeriodStart >= this.nextHelp) {
      const frequency = this.calculateFrequencyWithEnergy();
      this.nextHelp += frequency / 60;
    }
  }

  /**
   * Rolls chance for skill proc on any unclaimed helps.
   * Resets carried amount.
   *
   * @returns team skill value for any skill procs that were stored in the inventory
   */
  public collectInventory(): SkillActivation[] {
    let currentMorningProcs = 0;
    const bankedSkillProcs: SkillActivation[] = [];
    for (let help = 0; help < this.currentNightHelps; help++) {
      if (currentMorningProcs > 1) {
        break;
      } else {
        const activations = this.skillState.attemptSkill();
        if (activations.length > 0) {
          bankedSkillProcs.push(...activations);
          currentMorningProcs += 1;
        }
      }
    }

    this.morningProcs += currentMorningProcs;
    this.currentNightHelps = 0;
    this.carriedAmount = 0;

    return bankedSkillProcs;
  }

  public degradeEnergy(amount?: number) {
    const energyToDegrade = Math.min(amount ?? 1, this.currentEnergy);
    this.currentEnergy = Math.max(0, MathUtils.round(this.currentEnergy - energyToDegrade, 2));
    return energyToDegrade;
  }

  public results(iterations: number): MemberProduction {
    const totalSkillProduce: Produce = multiplyProduce(this.skillProduce, 1 / iterations); // so far only skill value has been added to totalProduce

    // Calculate total help produce based on tracked help counts
    const totalHelpProduce: Produce = {
      berries: [
        {
          berry: this.berry,
          level: this.level,
          amount: this.totalBerryProduction / iterations
        }
      ],
      ingredients: flatToIngredientSet(this.totalIngredientProduction.map((value) => value / iterations))
    };
    const produceTotal = CarrySizeUtils.addToInventory(totalSkillProduce, totalHelpProduce);

    const sneakySnack: BerrySet = {
      berry: this.berry,
      level: this.level,
      amount: Math.max(
        ...Array.from(this.berryDropAmounts).map(
          (value) => ((value as number) * this.totalSneakySnackHelps) / iterations
        )
      )
    };

    const {
      skillAmount,
      skillValue,
      skillProcs,
      skillCritValue,
      skillCrits,
      skillRegularValue,
      skillProcDistribution
    } = this.skillState.results(iterations);

    const totalHelps = (this.totalDayHelps + this.totalNightHelps) / iterations;
    const fiveMinIntervalsTotalDay = iterations * (TimeUtils.durationInMinutes(this.dayPeriod) / 5);
    const fiveMinIntervalsTotalNight = iterations * (TimeUtils.durationInMinutes(this.nightPeriod) / 5);

    // Calculate daily production distributions
    const berryProductionDistribution = calculateDistribution(this.berryProductionPerDay);
    const ingredientDistributions: { [ingredientName: string]: Record<number, number> } = {};

    // Initialize distribution objects for each ingredient that was produced
    const usedIngredients = new Set<string>();
    if (this.level0IngredientSet) usedIngredients.add(this.level0IngredientSet.ingredient.name);
    if (this.level30IngredientSet) usedIngredients.add(this.level30IngredientSet.ingredient.name);
    if (this.level60IngredientSet) usedIngredients.add(this.level60IngredientSet.ingredient.name);

    for (const ingredientName of usedIngredients) {
      const ingredientId = ING_ID_LOOKUP[ingredientName];
      // Extract daily values for this ingredient from the Float32Arrays
      const dailyValues = this.ingredientProductionPerDay.map((dayProduction) => dayProduction[ingredientId]);
      ingredientDistributions[ingredientName] = calculateDistribution(dailyValues);
    }

    const strength = new StrengthCalculator().calculateStrength({
      settings: this.settings,
      produceWithoutSkill: totalHelpProduce,
      produceFromSkill: totalSkillProduce,
      skillValue,
      areaBonus: this.settings.island.areaBonus ?? 0
    });

    return {
      produceTotal,
      produceWithoutSkill: totalHelpProduce,
      produceFromSkill: totalSkillProduce,
      skillAmount,
      skillValue,
      skillLevel: this.skillState.skillLevel,
      skillProcs,
      strength,
      externalId: this.id,
      pokemonWithIngredients: this.pokemonWithIngredients,
      advanced: {
        ingredientPercentage: this.ingredientPercentage,
        skillPercentage: this.skillPercentage,
        carrySize: this.inventoryLimit,
        maxFrequency: this.frequency80,
        dayHelps: this.totalDayHelps / iterations,
        nightHelps: this.totalNightHelps / iterations,
        averageHelps: this.totalAverageHelps / iterations,
        totalHelps,
        nightHelpsAfterSS: this.nightHelpsAfterSS / iterations,
        nightHelpsBeforeSS: this.nightHelpsBeforeSS / iterations,
        sneakySnack,
        skillCrits,
        skillRegularValue,
        skillCritValue,
        wastedEnergy: this.wastedEnergy / iterations,
        totalRecovery: this.totalRecovery / iterations,
        morningProcs: this.morningProcs / iterations,
        skillProcDistribution,
        berryProductionDistribution,
        ingredientDistributions,
        dayPeriod: {
          averageEnergy: this.energyIntervalsDay / fiveMinIntervalsTotalDay,
          averageFrequency: this.frequencyIntervalsDay / fiveMinIntervalsTotalDay,
          spilledIngredients: []
        },
        nightPeriod: {
          averageEnergy: this.energyIntervalsNight / fiveMinIntervalsTotalNight,
          averageFrequency: this.frequencyIntervalsNight / fiveMinIntervalsTotalNight,
          spilledIngredients: flatToIngredientSet(this.voidIngredients._mapUnary((amount) => amount / iterations))
        },
        frequencySplit: {
          zero: this.helpsAtFrequency0 / totalHelps,
          one: this.helpsAtFrequency1 / totalHelps,
          forty: this.helpsAtFrequency40 / totalHelps,
          sixty: this.helpsAtFrequency60 / totalHelps,
          eighty: this.helpsAtFrequency80 / totalHelps
        },
        teamSupport: {
          energy: this.totalHealedByMembers / iterations,
          helps: this.totalHelpsByMembers / iterations
        }
      }
    };
  }

  public ivResults(iterations: number): MemberProductionBase {
    const totalSkillProduce: Produce = multiplyProduce(this.skillProduce, 1 / iterations);

    const totalHelpProduce: Produce = {
      berries: [
        {
          berry: this.berry,
          level: this.level,
          amount: this.totalBerryProduction / iterations
        }
      ],
      ingredients: flatToIngredientSet(this.totalIngredientProduction.map((value) => value / iterations))
    };

    const produceTotal = CarrySizeUtils.addToInventory(totalSkillProduce, totalHelpProduce);
    const { skillProcs } = this.skillState.results(iterations);

    return {
      produceTotal,
      skillProcs,
      externalId: this.id,
      pokemonWithIngredients: this.pokemonWithIngredients
    };
  }

  public simpleResults(iterations: number): SimpleTeamResult {
    const skillIngredients = ingredientSetToFloatFlat(multiplyProduce(this.skillProduce, 1 / iterations).ingredients);

    const { averageWeekdayPotSize, critMultiplier } = this.simpleCookingResults(iterations);
    const { skillProcs } = this.skillState.results(iterations);

    return {
      skillProcs,
      totalHelps: this.totalAverageHelps / iterations,
      skillIngredients,
      critMultiplier,
      averageWeekdayPotSize,
      member: this.member,
      ingredientPercentage: this.ingredientPercentage
    };
  }

  private isExpertFavoredBerry(expertMode: ExpertModeSettings, berryName: string): boolean {
    return (
      expertMode.mainFavoriteBerry.name === berryName || expertMode.subFavoriteBerries.some((b) => b.name === berryName)
    );
  }

  /**
   * The flat +1 expert mode ingredient bonus is baked into the level*IngredientAmount fields
   * in the constructor. This method only returns the additional 50% +1 roll for ingredient
   * specialists with a favored berry.
   */
  private rollExpertIngredientBonus(): number {
    if (this.expertIngredientSpecialistBonus && this.rng() < 0.5) {
      return 1;
    }
    return 0;
  }

  private increaseIngredientDropForExpertMode() {
    const expertMode = this.settings.island?.expertMode;
    if (!expertMode || expertMode.randomBonus !== 'ingredient') {
      return;
    }
    const pokemon = this.member.pokemonWithIngredients.pokemon;
    if (!this.isExpertFavoredBerry(expertMode, pokemon.berry.name)) {
      return;
    }

    // Expert mode ingredient modifier grants +1 ingredient per help for favored berries;
    // ingredient specialists additionally roll for a further +1 at runtime.
    this.expertIngredientSpecialistBonus = hasSpecialty(pokemon, 'ingredient');
    this.level0IngredientAmount += 1;
    if (this.level30IngredientAmount !== undefined) {
      this.level30IngredientAmount += 1;
    }
    if (this.level60IngredientAmount !== undefined) {
      this.level60IngredientAmount += 1;
    }
  }

  private countFrequencyAndEnergyIntervals(period: HelpPeriod, frequency: number) {
    if (period === 'day') {
      this.frequencyIntervalsDay += frequency;
      this.energyIntervalsDay += this.currentEnergy;
    } else {
      this.frequencyIntervalsNight += frequency;
      this.energyIntervalsNight += this.currentEnergy;
    }
  }

  private simpleCookingResults(iterations: number) {
    if (!this.cookingState) {
      return {
        critMultiplier: AVERAGE_WEEKLY_CRIT_MULTIPLIER,
        averageWeekdayPotSize: MAX_POT_SIZE * (this.camp ? 1.5 : 1)
      };
    } else {
      const cookingResults = this.cookingState.results(iterations);
      return {
        critMultiplier: cookingResults.critInfo.averageCritMultiplierPerCook,
        averageWeekdayPotSize: cookingResults.critInfo.averageWeekdayPotSize
      };
    }
  }

  private calculateFrequencyWithEnergy() {
    const energy = this.currentEnergy; // Cache the value to avoid multiple property accesses
    if (energy >= 80) {
      this.helpsAtFrequency80++;
      return this.frequency80;
    }
    if (energy >= 60) {
      this.helpsAtFrequency60++;
      return this.frequency60;
    }
    if (energy >= 40) {
      this.helpsAtFrequency40++;
      return this.frequency40;
    }
    if (energy >= 1) {
      this.helpsAtFrequency1++;
      return this.frequency1;
    }
    this.helpsAtFrequency0++;
    return this.frequency0;
  }
}
