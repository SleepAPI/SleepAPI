import { NotImplementedError } from '@src/domain/error/programming/not-implemented-error.js';
import { ProgrammingError } from '@src/domain/error/programming/programming-error.js';
import { MainskillError } from '@src/domain/error/stat/stat-error.js';
import type { SleepInfo } from '@src/domain/sleep/sleep-info.js';
import { calculateSleepEnergyRecovery } from '@src/services/calculator/energy/energy-calculator.js';
import type { CookingState } from '@src/services/simulation-service/team-simulator/cooking-state.js';
import { TeamSimulatorUtils } from '@src/services/simulation-service/team-simulator/team-simulator-utils.js';
import { InventoryUtils } from '@src/utils/inventory-utils/inventory-utils.js';
import { getMealRecoveryAmount } from '@src/utils/meal-utils/meal-utils.js';
import type {
  BerrySet,
  Mainskill,
  MainskillUnit,
  MemberProduction,
  MemberProductionBase,
  ModifierType,
  PokemonWithIngredientsIndexed,
  Produce,
  ProduceFlat,
  SimpleTeamResult,
  TeamMemberExt,
  TeamSettingsExt,
  TimePeriod
} from 'sleepapi-common';
import {
  AVERAGE_WEEKLY_CRIT_MULTIPLIER,
  MAX_POT_SIZE,
  MAX_TEAM_SIZE,
  METRONOME_SKILLS,
  MathUtils,
  RandomUtils,
  berrySetToFlat,
  calculateNrOfBerriesPerDrop,
  calculatePityProcThreshold,
  defaultZero,
  emptyBerryInventoryFlat,
  emptyIngredientInventoryFloat,
  flatToBerrySet,
  flatToIngredientSet,
  getEmptyInventoryFloat,
  ingredient,
  ingredientSetToFloatFlat,
  ingredientSetToIntFlat,
  mainskill,
  multiplyProduce,
  subskill,
  sumFlats
} from 'sleepapi-common';

export interface SkillValue {
  regular: number;
  crit: number;
}

export interface TeamSkillEnergy {
  amount: number;
  random: boolean;
  chanceTargetLowest: number;
}
export interface TeamSkillActivation {
  energy?: {
    regular: TeamSkillEnergy;
    crit: TeamSkillEnergy;
  };
  helps?: SkillValue;
}

export interface SkillActivation {
  crit: boolean;
  selfValue?: SkillValue;
  teamValue?: TeamSkillActivation;
}

export class MemberState {
  private member: TeamMemberExt;
  private team: TeamMemberExt[];
  private otherMembers: TeamMemberExt[];
  private cookingState?: CookingState;
  private camp: boolean;

  // quick lookups, static data
  private pokemonWithIngredients: PokemonWithIngredientsIndexed;

  // state
  private currentEnergy = 0;
  private wastedEnergy = 0;
  private nextHelp: number;
  private helpsSinceLastSkillProc = 0;
  private currentNightHelps = 0;
  private nightPeriod: TimePeriod; // TODO: slow data type, and the function to calc sleep recovery below is slow
  private fullDayDuration = 1440;
  private carriedAmount = 0;
  private helpsSinceLastCook = 0;
  private totalAverageHelps = 0;
  private totalSneakySnackHelps = 0;
  private voidHelps = 0;
  private currentStockpile = 0;
  private disguiseBusted = false;

  // stats
  private frequency0;
  private frequency1;
  private frequency40;
  private frequency60;
  private frequency80;
  private skillPercentage: number;
  private ingredientPercentage: number;
  private sneakySnackBerries: Float32Array = emptyBerryInventoryFlat();
  private pityProcThreshold;
  private averageProduceAmount: number;
  private averageProduce: ProduceFlat = getEmptyInventoryFloat();

  // summary
  private skillProcs = 0;
  private skillValue: SkillValue = { regular: 0, crit: 0 };
  private skillCrits = 0;
  private morningProcs = 0;
  private totalDayHelps = 0;
  private totalNightHelps = 0;
  private nightHelpsBeforeSS = 0;
  private nightHelpsAfterSS = 0;
  private totalRecovery = 0;
  private totalProduce: Produce = InventoryUtils.getEmptyInventory();

  constructor(params: {
    member: TeamMemberExt;
    team: TeamMemberExt[];
    settings: TeamSettingsExt;
    cookingState: CookingState | undefined;
  }) {
    const { member, team, settings, cookingState } = params;

    this.camp = settings.camp;

    this.cookingState = cookingState;

    // list already filtered for level
    const nrOfHelpingBonus = team.filter((member) => member.settings.subskills.has(subskill.HELPING_BONUS.name)).length;
    member.settings.subskills.delete(subskill.HELPING_BONUS.name); // now that helping bonus is accounted for we delete it from the array

    const nightPeriod = {
      start: settings.bedtime,
      end: settings.wakeup
    };
    this.nightPeriod = nightPeriod;

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
    const memberBerryInList = berrySetToFlat([
      {
        amount: 1,
        berry: member.pokemonWithIngredients.pokemon.berry,
        level: member.settings.level
      }
    ]);
    const berriesPerDrop = calculateNrOfBerriesPerDrop(
      member.pokemonWithIngredients.pokemon.specialty,
      member.settings.subskills
    );
    this.averageProduce = TeamSimulatorUtils.calculateAverageProduce(member);
    this.averageProduceAmount = sumFlats(this.averageProduce.ingredients, this.averageProduce.berries);

    this.sneakySnackBerries = memberBerryInList.map((amount) => (amount *= berriesPerDrop));

    const frequency = TeamSimulatorUtils.calculateHelpSpeedBeforeEnergy({
      member,
      settings,
      helpingBonus: nrOfHelpingBonus
    });
    // TODO: not nice to duplicate this between here and energy utils in case brackets change
    this.frequency0 = frequency * 1; // 0 energy
    this.frequency1 = frequency * 0.66; // 1-39 energy
    this.frequency40 = frequency * 0.58; // 40-59 energy
    this.frequency60 = frequency * 0.52; // 60-79 energy
    this.frequency80 = frequency * 0.45; // 80+ energy

    this.pityProcThreshold = calculatePityProcThreshold(member.pokemonWithIngredients.pokemon);

    this.member = member;
    this.team = team; // this needs updating when we add team rotation
    this.otherMembers = team.filter((m) => m.settings.externalId !== member.settings.externalId); // this needs updating when we add team rotation
  }

  get level() {
    return this.member.settings.level;
  }

  get skill() {
    return this.member.pokemonWithIngredients.pokemon.skill;
  }

  get skillLevel() {
    return this.member.settings.skillLevel;
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

  get metronomeFactor() {
    return this.skill === mainskill.METRONOME ? METRONOME_SKILLS.length : 1;
  }

  get id() {
    return this.member.settings.externalId;
  }

  public wakeUp() {
    const nrOfErb = TeamSimulatorUtils.countMembersWithSubskill(this.team, subskill.ENERGY_RECOVERY_BONUS.name);
    const sleepInfo: SleepInfo = {
      period: this.nightPeriod,
      incense: false,
      erb: nrOfErb,
      nature: this.member.settings.nature
    };

    const missingEnergy = Math.max(0, 100 - this.currentEnergy);
    const recoveredEnergy = Math.min(missingEnergy, calculateSleepEnergyRecovery(sleepInfo));
    this.currentEnergy += recoveredEnergy;

    this.disguiseBusted = false;

    this.nextHelp -= this.fullDayDuration;
  }

  /**
   * @returns any leftover (wasted) energy
   */
  public recoverEnergy(recovered: number) {
    const recoveredWithNature = recovered * this.member.settings.nature.energy;
    const clampedEnergyRecovered =
      this.currentEnergy + recoveredWithNature > 150 ? 150 - this.currentEnergy : recoveredWithNature;

    this.currentEnergy += clampedEnergyRecovered;
    this.totalRecovery += clampedEnergyRecovered;

    return {
      recovered: clampedEnergyRecovered,
      wasted: recoveredWithNature - clampedEnergyRecovered
    };
  }

  public wasteEnergy(wasted: number) {
    this.wastedEnergy += wasted;
  }

  public addSkillValue(skillValue: SkillValue) {
    const { regular, crit } = skillValue;

    this.skillValue.regular += regular;
    this.skillValue.crit += crit;
  }

  public addHelps(helps: SkillValue) {
    const { regular, crit } = helps;
    const totalHelps = regular + crit;

    this.helpsSinceLastCook += totalHelps;
    this.totalAverageHelps += totalHelps;
  }

  public updateIngredientBag() {
    const ingsSinceLastCook = this.averageProduce.ingredients._mapUnary((a) => a * this.helpsSinceLastCook);
    this.cookingState?.addIngredients(ingsSinceLastCook);
    this.helpsSinceLastCook = 0;
  }

  public recoverMeal() {
    this.totalRecovery += getMealRecoveryAmount(this.currentEnergy);
    this.currentEnergy += getMealRecoveryAmount(this.currentEnergy);
  }

  public attemptDayHelp(currentMinutesSincePeriodStart: number): TeamSkillActivation[] {
    if (currentMinutesSincePeriodStart >= this.nextHelp) {
      // update stats
      this.totalDayHelps += 1;
      this.helpsSinceLastSkillProc += 1;

      this.totalAverageHelps += 1;
      this.helpsSinceLastCook += 1;

      const skillActivations = this.attemptSkill();
      if (skillActivations.length === 1) {
        return skillActivations[0].teamValue ? [skillActivations[0].teamValue] : [];
      } else {
        // metronome
        return this.extractTeamValue(skillActivations);
      }
    }
    return [];
  }

  public scheduleHelp(currentMinutesSincePeriodStart: number) {
    if (currentMinutesSincePeriodStart >= this.nextHelp) {
      const frequency = this.calculateFrequencyWithEnergy();
      this.nextHelp += frequency / 60;
    }
  }

  public attemptNightHelp(currentMinutesSincePeriodStart: number) {
    if (currentMinutesSincePeriodStart >= this.nextHelp) {
      const frequency = this.calculateFrequencyWithEnergy();

      // update stats
      this.totalNightHelps += 1;

      const inventorySpace = this.inventoryLimit - this.carriedAmount;
      if (inventorySpace > 0) {
        this.currentNightHelps += 1; // these run skill procs at wakeup
        this.nightHelpsBeforeSS += 1;

        this.carriedAmount += this.averageProduceAmount;

        // if this help hits the inventory limit we split into what fits in bag and what gets spilled
        if (inventorySpace < this.averageProduceAmount) {
          this.totalAverageHelps += inventorySpace / this.averageProduceAmount;
          this.helpsSinceLastCook += inventorySpace / this.averageProduceAmount;
          this.voidHelps += 1 - inventorySpace / this.averageProduceAmount;
        } else {
          this.helpsSinceLastCook += 1;
          this.totalAverageHelps += 1;
        }
      } else {
        this.nightHelpsAfterSS += 1;
        this.totalSneakySnackHelps += 1;
      }

      this.nextHelp += frequency / 60;
    }
  }

  /**
   * Rolls chance for skill proc on any unclaimed helps.
   * Resets carried amount.
   *
   * @returns team skill value for any skill procs that were stored in the inventory
   */
  public collectInventory(): TeamSkillActivation[] {
    let currentMorningProcs = 0;
    const bankedSkillProcs: SkillActivation[] = [];
    for (let help = 0; help < this.currentNightHelps; help++) {
      if (currentMorningProcs > 1) {
        break;
      } else {
        this.helpsSinceLastSkillProc += 1;
        const activations = this.attemptSkill();
        if (activations.length > 0) {
          bankedSkillProcs.push(...activations);
          currentMorningProcs += 1;
        }
      }
    }

    this.morningProcs += currentMorningProcs;
    this.currentNightHelps = 0;
    this.carriedAmount = 0;

    return this.extractTeamValue(bankedSkillProcs);
  }

  public degradeEnergy() {
    const energyToDegrade = Math.min(1, this.currentEnergy);
    this.currentEnergy = Math.max(0, MathUtils.round(this.currentEnergy - energyToDegrade, 2));
  }

  // TEST: none of the results functions caught that ingredient magnet inflates totalProduce massively, since totalProduce was not divided by iterations
  public results(iterations: number): MemberProduction {
    const totalSkillProduce: Produce = multiplyProduce(this.totalProduce, 1 / iterations); // so far only skill value has been added to totalProduce

    const totalHelpProduceFlat: ProduceFlat = {
      berries: this.averageProduce.berries._mapCombine(
        this.sneakySnackBerries,
        (avgAmount, sneakyAmount) =>
          (avgAmount * this.totalAverageHelps + sneakyAmount * this.totalSneakySnackHelps) / iterations
      ),
      ingredients: this.averageProduce.ingredients._mapUnary(
        (ingredient) => (ingredient * this.totalAverageHelps) / iterations
      )
    };
    const totalHelpProduce: Produce = {
      berries: flatToBerrySet(totalHelpProduceFlat.berries, this.level),
      ingredients: flatToIngredientSet(totalHelpProduceFlat.ingredients)
    };
    const produceTotal = InventoryUtils.addToInventory(totalSkillProduce, totalHelpProduce);

    const spilledHelps = this.voidHelps + this.totalSneakySnackHelps;
    const spilledIngredients = flatToIngredientSet(
      this.averageProduce.ingredients._mapUnary((ingredient) => (ingredient * spilledHelps) / iterations)
    );

    const sneakySnack = flatToBerrySet(
      this.sneakySnackBerries._mutateUnary((a) => (a * this.totalSneakySnackHelps) / iterations),
      this.level
    )[0]; // can grab first since sneaky snack can only return 1 berry type

    return {
      produceTotal,
      produceWithoutSkill: totalHelpProduce,
      produceFromSkill: totalSkillProduce,
      skillAmount: (this.skillValue.regular + this.skillValue.crit) / iterations,
      skillProcs: this.skillProcs / this.metronomeFactor / iterations,
      externalId: this.id,
      pokemonWithIngredients: this.pokemonWithIngredients,
      advanced: {
        ingredientPercentage: this.ingredientPercentage,
        skillPercentage: this.skillPercentage,
        carrySize: this.inventoryLimit,
        spilledIngredients,
        dayHelps: this.totalDayHelps / iterations,
        nightHelps: this.totalNightHelps / iterations,
        averageHelps: this.totalAverageHelps / iterations,
        totalHelps: (this.totalDayHelps + this.totalNightHelps) / iterations,
        nightHelpsAfterSS: this.nightHelpsAfterSS / iterations,
        nightHelpsBeforeSS: this.nightHelpsBeforeSS / iterations,
        sneakySnack,
        skillCrits: this.skillCrits / iterations,
        skillCritValue: this.skillValue.crit / iterations,
        wastedEnergy: this.wastedEnergy / iterations,
        totalRecovery: this.totalRecovery / iterations,
        morningProcs: this.morningProcs / iterations
      }
    };
  }

  // TODO: it looks like produceTotal is not divided by iterations???
  public ivResults(iterations: number): MemberProductionBase {
    const totalSkillProduce: Produce = multiplyProduce(this.totalProduce, 1 / iterations); // so far only skill value has been added to totalProduce

    const totalHelpProduceFlat: ProduceFlat = {
      berries: this.averageProduce.berries._mapCombine(
        this.sneakySnackBerries,
        (avgAmount, sneakyAmount) => avgAmount * this.totalAverageHelps + sneakyAmount * this.totalSneakySnackHelps
      ),
      ingredients: this.averageProduce.ingredients._mapUnary((ingredient) => ingredient * this.totalAverageHelps)
    };
    const totalHelpProduce: Produce = {
      berries: flatToBerrySet(totalHelpProduceFlat.berries, this.level),
      ingredients: flatToIngredientSet(totalHelpProduceFlat.ingredients)
    };

    const produceTotal = InventoryUtils.addToInventory(totalSkillProduce, totalHelpProduce);

    return {
      produceTotal,
      skillProcs: this.skillProcs / this.metronomeFactor / iterations,
      externalId: this.id,
      pokemonWithIngredients: this.pokemonWithIngredients
    };
  }

  public simpleResults(iterations: number): SimpleTeamResult {
    const skillIngredients = ingredientSetToFloatFlat(multiplyProduce(this.totalProduce, 1 / iterations).ingredients);

    const { averageWeekdayPotSize, critMultiplier } = this.simpleCookingResults(iterations);
    return {
      skillProcs: this.skillProcs / this.metronomeFactor / iterations,
      totalHelps: this.totalAverageHelps / iterations,
      skillIngredients,
      critMultiplier,
      averageWeekdayPotSize,
      member: this.member,
      ingredientPercentage: this.ingredientPercentage
    };
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
    if (this.currentEnergy >= 80) {
      return this.frequency80;
    } else if (this.currentEnergy >= 60) {
      return this.frequency60;
    } else if (this.currentEnergy >= 40) {
      return this.frequency40;
    } else if (this.currentEnergy >= 1) {
      return this.frequency1;
    } else {
      return this.frequency0;
    }
  }

  private attemptSkill(): SkillActivation[] {
    const result: SkillActivation[] = [];

    // TODO: apparently returning early here makes the team sim insanely fast, so skill handling is slower than expected
    // FIXME: implement once skill copy is known
    if (this.skill.isSameOrModifiedVersionOf(mainskill.SKILL_COPY)) {
      return [];
    }

    if (this.helpsSinceLastSkillProc > this.pityProcThreshold || RandomUtils.roll(this.skillPercentage)) {
      if (this.skill.isSkill(mainskill.METRONOME)) {
        for (const skill of METRONOME_SKILLS) {
          result.push(this.activateSkill(skill));
        }
      } else {
        result.push(this.activateSkill(this.skill));
      }
    }

    result.forEach((activation) => this.skillResult(activation));
    return result;
  }

  /**
   * Called when a successful skill activation happens
   * Resets state and increments counters
   */
  private skillResult(activation: SkillActivation) {
    this.skillProcs += 1;
    this.skillCrits += activation.crit ? 1 : 0;
    this.helpsSinceLastSkillProc = 0;

    this.skillValue.regular += defaultZero(activation.selfValue?.regular);
    this.skillValue.crit += defaultZero(activation.selfValue?.crit);
  }

  private extractTeamValue(activations: SkillActivation[]): TeamSkillActivation[] {
    const result: TeamSkillActivation[] = [];
    for (const activation of activations) {
      if (activation.teamValue) {
        result.push(activation.teamValue);
      }
    }
    return result;
  }

  private activateSkill(skill: Mainskill): SkillActivation {
    if (skill.isModified) {
      return this.activateModifier(skill);
    } else {
      return this.activateBasicSkill(skill);
    }
  }

  private activateBasicSkill(skill: Mainskill): SkillActivation {
    const skillActivators: Record<MainskillUnit, (skill: Mainskill) => SkillActivation> = {
      energy: (skill) => this.#activateEnergySkill(skill),
      helps: (skill) => this.#activateHelpSkill(skill),
      ingredients: () => this.#activateIngredientMagnet(),
      berries: () => this.#activateBerryBurst(),
      'dream shards': (skill) => this.#activateValueSkills(skill),
      'pot size': () => this.#activateCookingPowerUp(),
      chance: () => this.#activateTastyChance(),
      strength: (skill) => this.#activateValueSkills(skill),
      metronome: () => {
        throw new MainskillError('Metronome should not call activateBasicSkill directly');
      },
      copy: () => {
        throw new NotImplementedError('Skill copy not yet implemented');
      }
    };

    return skillActivators[skill.unit](skill);
  }
  private activateModifier(skill: Mainskill): SkillActivation {
    const modifierActivators: Record<ModifierType, (skill: Mainskill) => SkillActivation> = {
      Stockpile: (skill) => this.#activateStockpile(skill),
      Moonlight: (skill) => this.#activateMoonlight(skill),
      Disguise: (skill) => this.#activateDisguise(skill),
      Mimic: () => {
        throw new NotImplementedError('Skill copy not yet implemented');
      },
      Transform: () => {
        throw new NotImplementedError('Skill copy not yet implemented');
      },
      Base: () => {
        throw new ProgrammingError('Base skills should not enter the modifier function');
      }
    };

    return modifierActivators[skill.modifier.type](skill);
  }

  #activateEnergySkill(skill: Mainskill): SkillActivation {
    if (skill.isSkill(mainskill.CHARGE_ENERGY_S)) {
      const defaultEnergyAmount = this.skillAmount(skill);
      const clampedEnergyRecovered =
        this.currentEnergy + defaultEnergyAmount > 150 ? 150 - this.currentEnergy : this.skillAmount(skill);

      this.currentEnergy += clampedEnergyRecovered;
      this.totalRecovery += clampedEnergyRecovered;
      this.wasteEnergy(defaultEnergyAmount - clampedEnergyRecovered);

      return {
        crit: false,
        selfValue: { regular: clampedEnergyRecovered, crit: 0 }
      };
    } else if (skill.isSkill(mainskill.ENERGIZING_CHEER_S)) {
      return {
        crit: false,
        teamValue: {
          energy: {
            regular: {
              amount: this.skillAmount(skill),
              random: true,
              chanceTargetLowest: mainskill.ENERGIZING_CHEER_TARGET_LOWEST_CHANCE
            },
            crit: { amount: 0, random: false, chanceTargetLowest: 0 }
          }
        }
      };
    } else if (skill.isSkill(mainskill.ENERGY_FOR_EVERYONE)) {
      return {
        crit: false,
        teamValue: {
          energy: {
            regular: {
              amount: this.skillAmount(skill),
              random: false,
              chanceTargetLowest: 0
            },
            crit: { amount: 0, random: false, chanceTargetLowest: 0 }
          }
        }
      };
    }
    return { crit: false };
  }

  #activateHelpSkill(skill: Mainskill): SkillActivation {
    if (skill.isSkill(mainskill.HELPER_BOOST)) {
      const unique =
        this.team.length > MAX_TEAM_SIZE
          ? 1
          : TeamSimulatorUtils.uniqueMembersWithBerry({ berry: this.berry, members: this.team });
      const uniqueHelps = mainskill.HELPER_BOOST_UNIQUE_BOOST_TABLE[unique - 1][this.skillLevel - 1];

      return {
        crit: false,
        teamValue: {
          helps: { regular: this.skillAmount(skill) + uniqueHelps, crit: 0 }
        }
      };
    } else if (skill.isSkill(mainskill.EXTRA_HELPFUL_S)) {
      return {
        crit: false,
        teamValue: {
          helps: { regular: this.skillAmount(skill) / this.teamSize, crit: 0 }
        }
      };
    }
    return { crit: false }; // shouldn't trigger, but in case new help skill is added this would return empty value
  }

  #activateIngredientMagnet(): SkillActivation {
    const ingMagnetAmount = this.skillAmount(mainskill.INGREDIENT_MAGNET_S);
    const magnetIngredients: Float32Array = emptyIngredientInventoryFloat().fill(
      ingMagnetAmount / ingredient.INGREDIENTS.length
    );

    this.cookingState?.addIngredients(magnetIngredients);
    // TODO: test an ing magnet sim
    // we have to calc magnetIngredients as flat for cooking anyway
    // converting totalProduce.ingredients to flat, doing mutateCombine, convert back
    // is likely faster than converting magnetIngredients to IngredientSet[] and doing slow InventoryUtils.addToInventory
    this.totalProduce.ingredients = flatToIngredientSet(
      ingredientSetToFloatFlat(this.totalProduce.ingredients)._mutateCombine(magnetIngredients, (a, b) => a + b)
    );
    return { crit: false, selfValue: { regular: ingMagnetAmount, crit: 0 } };
  }

  #activateTastyChance(): SkillActivation {
    const critAmount = this.skillAmount(mainskill.TASTY_CHANCE_S);
    this.cookingState?.addCritBonus(critAmount / 100);
    return { crit: false, selfValue: { regular: critAmount, crit: 0 } };
  }

  #activateBerryBurst(): SkillActivation {
    // doesn't exist yet
    return { crit: false };
  }

  #activateCookingPowerUp(): SkillActivation {
    const potAmount = this.skillAmount(mainskill.COOKING_POWER_UP_S);
    this.cookingState?.addPotSize(potAmount);
    return { crit: false, selfValue: { regular: potAmount, crit: 0 } };
  }

  #activateStockpile(skill: Mainskill): SkillActivation {
    if (skill.isModifiedVersionOf(mainskill.CHARGE_STRENGTH_S, 'Stockpile')) {
      const triggerSpitUp = RandomUtils.roll(skill.critChance);
      if (triggerSpitUp || this.currentStockpile === mainskill.STOCKPILE_STRENGTH_STOCKS[this.skillLevel].length - 1) {
        const stockpiledValue = mainskill.STOCKPILE_STRENGTH_STOCKS[this.skillLevel][this.currentStockpile];
        this.currentStockpile = 0;
        return {
          crit: false,
          selfValue: { regular: stockpiledValue, crit: 0 }
        };
      } else {
        this.currentStockpile = this.currentStockpile + 1;
      }
    }
    return { crit: false };
  }

  #activateMoonlight(skill: Mainskill): SkillActivation {
    if (skill.isModifiedVersionOf(mainskill.CHARGE_ENERGY_S, 'Moonlight')) {
      const baseEnergyAmount = this.skillAmount(skill);
      const clampedEnergyRecovered =
        this.currentEnergy + baseEnergyAmount > 150 ? 150 - this.currentEnergy : this.skillAmount(skill);

      this.wasteEnergy(baseEnergyAmount - clampedEnergyRecovered);

      this.currentEnergy += clampedEnergyRecovered;
      this.totalRecovery += clampedEnergyRecovered;

      if (RandomUtils.roll(skill.critChance)) {
        const teamAmount = mainskill.moonlightCritAmount(this.skillLevel);
        // currently uses equal chance to hit every member
        return {
          crit: true,
          selfValue: { regular: clampedEnergyRecovered, crit: 0 },
          teamValue: {
            energy: {
              regular: { amount: 0, random: false, chanceTargetLowest: 0 },
              crit: { amount: teamAmount, random: true, chanceTargetLowest: 0 }
            }
          }
        };
      } else {
        return {
          crit: false,
          selfValue: { regular: clampedEnergyRecovered, crit: 0 }
        };
      }
    }
    return { crit: false };
  }

  #activateDisguise(skill: Mainskill): SkillActivation {
    if (skill.isModifiedVersionOf(mainskill.BERRY_BURST, 'Disguise')) {
      const regularSelfAmount = this.skillAmount(skill);
      const regularOtherAmount = mainskill.DISGUISE_BERRY_BURST_TEAM_AMOUNT[this.skillLevel - 1];
      let critSelfAmount = 0;
      let critOtherAmount = 0;

      if (!this.disguiseBusted && RandomUtils.roll(skill.critChance)) {
        this.disguiseBusted = true;

        // -1 because the crit value is the difference between 1x and 3x, so only 2x
        critSelfAmount = regularSelfAmount * (mainskill.DISGUISE_CRIT_MULTIPLIER - 1);
        critOtherAmount = regularOtherAmount * (mainskill.DISGUISE_CRIT_MULTIPLIER - 1);
      }

      const berries: BerrySet[] = this.otherMembers.map((member) => ({
        berry: member.pokemonWithIngredients.pokemon.berry,
        amount: regularOtherAmount + critOtherAmount,
        level: member.settings.level
      }));
      berries.push({
        berry: this.berry,
        amount: regularSelfAmount + critSelfAmount,
        level: this.level
      });

      this.totalProduce = InventoryUtils.addToInventory(this.totalProduce, {
        ingredients: [],
        berries
      });
      return {
        crit: critSelfAmount > 0,
        selfValue: {
          regular: regularSelfAmount + regularOtherAmount * this.otherMembers.length,
          crit: critSelfAmount + critOtherAmount * this.otherMembers.length
        }
      };
    }
    return { crit: false };
  }

  #activateValueSkills(skill: Mainskill): SkillActivation {
    return {
      crit: false,
      selfValue: { regular: this.skillAmount(skill), crit: 0 }
    };
  }

  private skillAmount(skill: Mainskill) {
    return skill.amount(this.skillLevel) / this.metronomeFactor;
  }
}
