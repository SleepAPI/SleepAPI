import { TeamMember, TeamSettingsExt } from '@src/domain/combination/team';
import { SleepInfo } from '@src/domain/sleep/sleep-info';
import { calculateSleepEnergyRecovery } from '@src/services/calculator/energy/energy-calculator';
import { calculateAveragePokemonIngredientSet } from '@src/services/calculator/ingredient/ingredient-calculate';
import { calculateAverageProduce } from '@src/services/calculator/production/produce-calculator';
import { CookingState } from '@src/services/simulation-service/team-simulator/cooking-state';
import { TeamSimulatorUtils } from '@src/services/simulation-service/team-simulator/team-simulator-utils';
import { InventoryUtils } from '@src/utils/inventory-utils/inventory-utils';
import { getMealRecoveryAmount } from '@src/utils/meal-utils/meal-utils';
import {
  BasicSkillType,
  BerrySet,
  IngredientSet,
  MathUtils,
  MemberProduction,
  Produce,
  StockpileStrength,
  TimePeriod,
  calculatePityProcThreshold,
  emptyProduce,
  ingredient,
  isModifier,
  isSkillOrModifierOf,
  mainskill,
  multiplyProduce,
  subskill,
} from 'sleepapi-common';

export interface SkillActivation {
  energyTeam: number;
  helpsTeam: number;
  produce?: Produce;
  other?: number; // TODO: fix strength, pot etc later, not functional now
}

export class MemberState {
  private member: TeamMember;
  private team: TeamMember[];
  private otherMembers: TeamMember[];
  private cookingState: CookingState;

  // quick lookups, static data
  private skillsWithoutMetronome = mainskill.MAINSKILLS.filter((ms) => ms !== mainskill.METRONOME);

  // state
  private currentEnergy = 0;
  private nextHelp: number;
  private helpsSinceLastSkillProc = 0;
  private currentNightHelps = 0;
  private nightPeriod: TimePeriod;
  private fullDayDuration = 1440;
  private carriedAmount = 0;
  private helpsSinceLastCook = 0;
  private totalAverageHelps = 0;
  private totalSneakySnackHelps = 0;
  private voidHelps = 0;
  private currentStockpile = 0;

  // stats
  private frequency0;
  private frequency1;
  private frequency40;
  private frequency60;
  private frequency80;
  private skillPercentage: number;
  private sneakySnackProduce: Produce;
  private averageProduce: Produce;
  private averageProduceAmount: number;
  private pityProcThreshold;

  // summary
  private skillProcs = 0;
  private skillValue = 0;
  private morningProcs = 0;
  private totalDayHelps = 0;
  private totalNightHelps = 0;
  private nightHelpsBeforeSS = 0;
  private nightHelpsAfterSS = 0;
  private totalRecovery = 0;
  private totalProduce = InventoryUtils.getEmptyInventory();

  constructor(params: {
    member: TeamMember;
    team: TeamMember[];
    settings: TeamSettingsExt;
    cookingState: CookingState;
  }) {
    const { member, team, settings, cookingState } = params;

    this.cookingState = cookingState;

    const nrOfHelpingBonus = team.filter((member) => member.subskills.includes(subskill.HELPING_BONUS)).length;

    const nightPeriod = {
      start: settings.bedtime,
      end: settings.wakeup,
    };
    this.nightPeriod = nightPeriod;

    this.nextHelp = this.fullDayDuration; // set to 1440, first start of day subtracts 1440

    this.skillPercentage = TeamSimulatorUtils.calculateSkillPercentage(member);
    const ingredientPercentage = TeamSimulatorUtils.calculateIngredientPercentage(member);

    const averagedPokemonCombination = calculateAveragePokemonIngredientSet(member.pokemonSet);
    const berriesPerDrop = TeamSimulatorUtils.calculateNrOfBerriesPerDrop(member);
    this.averageProduce = calculateAverageProduce(
      averagedPokemonCombination,
      ingredientPercentage,
      berriesPerDrop,
      member.level
    );
    this.averageProduceAmount = InventoryUtils.countInventory(this.averageProduce);

    this.sneakySnackProduce = {
      ingredients: [],
      berries: [
        {
          amount: berriesPerDrop,
          berry: member.pokemonSet.pokemon.berry,
          level: member.level,
        },
      ],
    };

    const frequency = TeamSimulatorUtils.calculateHelpSpeedBeforeEnergy({
      member,
      settings,
      helpingBonus: nrOfHelpingBonus,
    });
    // TODO: not nice to duplicate this between here and energy utils in case brackets change
    this.frequency0 = frequency * 1; // 0 energy
    this.frequency1 = frequency * 0.66; // 1-39 energy
    this.frequency40 = frequency * 0.58; // 40-59 energy
    this.frequency60 = frequency * 0.52; // 60-79 energy
    this.frequency80 = frequency * 0.45; // 80+ energy

    this.pityProcThreshold = calculatePityProcThreshold(member.pokemonSet.pokemon);

    this.member = member;
    this.team = team; // this needs updating when we add team rotation
    this.otherMembers = team.filter((m) => m.externalId !== member.externalId); // this needs updating when we add team rotation
  }

  get level() {
    return this.member.level;
  }

  get skillLevel() {
    return this.member.skillLevel;
  }

  get teamSize() {
    return this.team.length;
  }

  get berry() {
    return this.member.pokemonSet.pokemon.berry;
  }

  get inventoryLimit() {
    return this.member.carrySize;
  }

  get energy() {
    return this.currentEnergy;
  }

  public startDay() {
    const nrOfErb = this.team.filter((member) => member.subskills.includes(subskill.ENERGY_RECOVERY_BONUS)).length;
    const sleepInfo: SleepInfo = {
      period: this.nightPeriod,
      incense: false,
      erb: nrOfErb,
      nature: this.member.nature,
    };

    const missingEnergy = Math.max(0, 100 - this.currentEnergy);
    const recoveredEnergy = Math.min(missingEnergy, calculateSleepEnergyRecovery(sleepInfo));
    this.currentEnergy += recoveredEnergy;

    this.nextHelp -= this.fullDayDuration;

    return this.collectInventory();
  }

  public recoverEnergy(recovered: number) {
    const recoveredWithNature = recovered * this.member.nature.energy;
    const clampedEnergyRecovered =
      this.currentEnergy + recoveredWithNature > 150 ? 150 - this.currentEnergy : recoveredWithNature;

    this.currentEnergy += clampedEnergyRecovered;
    this.totalRecovery += clampedEnergyRecovered;
  }

  public addHelps(helps: number) {
    this.helpsSinceLastCook += helps;
    this.totalAverageHelps += helps;
  }

  public updateIngredientBag() {
    const ingsSinceLastCook = this.averageProduce.ingredients.map(({ amount, ingredient }) => ({
      amount: this.helpsSinceLastCook * amount,
      ingredient,
    }));
    this.cookingState.addIngredients(ingsSinceLastCook);
    this.helpsSinceLastCook = 0;
  }

  public recoverMeal() {
    this.totalRecovery += getMealRecoveryAmount(this.currentEnergy);
    this.currentEnergy += getMealRecoveryAmount(this.currentEnergy);
  }

  public attemptDayHelp(currentMinutesSincePeriodStart: number): SkillActivation | undefined {
    if (currentMinutesSincePeriodStart >= this.nextHelp) {
      const frequency = this.calculateFrequencyWithEnergy();

      // update stats
      this.totalDayHelps += 1;
      this.helpsSinceLastSkillProc += 1;

      this.totalAverageHelps += 1;
      this.helpsSinceLastCook += 1;

      this.nextHelp += frequency / 60;

      return this.attemptSkill();
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

  public collectInventory(): SkillActivation[] {
    // roll skill proc on each stored help, stop after if we get a successful roll
    const bankedSkillProcs: SkillActivation[] = [];
    for (let i = 0; i < this.currentNightHelps; i++) {
      this.helpsSinceLastSkillProc += 1;
      const activatedSkill = this.attemptSkill();
      if (activatedSkill) {
        bankedSkillProcs.push(activatedSkill);
        this.morningProcs += 1;
        if (bankedSkillProcs.length === 2 || this.member.pokemonSet.pokemon.specialty !== 'skill') {
          break;
        }
      }
    }

    this.currentNightHelps = 0;
    this.carriedAmount = 0;

    return bankedSkillProcs;
  }

  public degradeEnergy() {
    const energyToDegrade = Math.min(1, this.currentEnergy);
    this.currentEnergy = Math.max(0, MathUtils.round(this.currentEnergy - energyToDegrade, 2));
  }

  public results(iterations: number): MemberProduction {
    this.collectInventory();

    const totalHelpProduce: Produce = InventoryUtils.addToInventory(emptyProduce(), {
      berries: this.averageProduce.berries
        .map(({ amount, berry, level }) => ({
          amount: this.totalAverageHelps * amount,
          berry,
          level,
        }))
        .concat(
          this.sneakySnackProduce.berries.map(({ amount, berry, level }) => ({
            amount: this.totalSneakySnackHelps * amount,
            berry,
            level,
          }))
        ),
      ingredients: this.averageProduce.ingredients.map(({ amount, ingredient }) => ({
        amount: this.totalAverageHelps * amount,
        ingredient,
      })),
    });
    const totalSkillProduce: Produce = this.totalProduce; // so far only skill value has been added to totalProduce
    this.totalProduce = InventoryUtils.addToInventory(this.totalProduce, totalHelpProduce);
    const spilledHelps = this.voidHelps + this.totalSneakySnackHelps;
    const spilledIngredients =
      spilledHelps < 0
        ? this.averageProduce.ingredients.map(({ amount, ingredient }) => ({
            amount: spilledHelps * amount,
            ingredient,
          }))
        : [];

    const result: MemberProduction = {
      produceTotal: multiplyProduce(this.totalProduce, 1 / iterations),
      produceWithoutSkill: multiplyProduce(totalHelpProduce, 1 / iterations),
      produceFromSkill: multiplyProduce(totalSkillProduce, 1 / iterations),
      skillAmount: this.skillValue / iterations,
      skillProcs: this.skillProcs / iterations,
      externalId: this.member.externalId,
      advanced: {
        spilledIngredients: spilledIngredients,
        dayHelps: this.totalDayHelps / iterations,
        nightHelps: this.totalNightHelps / iterations,
        totalHelps: (this.totalDayHelps + this.totalNightHelps) / iterations,
        nightHelpsAfterSS: this.nightHelpsAfterSS / iterations,
        nightHelpsBeforeSS: this.nightHelpsBeforeSS / iterations,
      },
    };

    return result;
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

  private attemptSkill(): SkillActivation | undefined {
    if (this.helpsSinceLastSkillProc > this.pityProcThreshold || MathUtils.rollRandomChance(this.skillPercentage)) {
      this.skillProcs += 1;
      this.helpsSinceLastSkillProc = 0;
      let result: SkillActivation | undefined = undefined;

      if (this.member.pokemonSet.pokemon.skill === mainskill.METRONOME) {
        result = { energyTeam: 0, helpsTeam: 0 };
        for (const skill of this.skillsWithoutMetronome) {
          const activationResult = this.activateSkill(skill);
          if (activationResult) {
            result.energyTeam += activationResult.energyTeam;
            result.helpsTeam += activationResult.helpsTeam;
          }
        }
      } else {
        result = this.activateSkill(this.member.pokemonSet.pokemon.skill);
      }

      return result;
    }
  }

  private activateSkill(skill: mainskill.MainSkill): SkillActivation {
    if (isModifier(skill.unit)) {
      return this.activateModifier(skill);
    } else {
      return this.activateBasicSkill(skill);
    }
  }

  private activateBasicSkill(skill: mainskill.MainSkill): SkillActivation {
    const skillActivators: Record<BasicSkillType, (skill: mainskill.MainSkill) => SkillActivation> = {
      energy: (skill) => this.#activateEnergySkill(skill),
      helps: (skill) => this.#activateHelpSkill(skill),
      ingredients: () => this.#activateIngredientMagnet(),
      berries: () => this.#activateBerryBurst(),
      'dream shards': (skill) => this.#activateValueSkills(skill),
      'pot size': () => this.#activateCookingPowerUp(),
      chance: () => this.#activateTastyChance(),
      metronome: (skill) => this.#activateValueSkills(skill),
      strength: (skill) => this.#activateValueSkills(skill),
    };

    return skillActivators[skill.unit as BasicSkillType](skill);
  }
  private activateModifier(skill: mainskill.MainSkill): SkillActivation {
    const modifierActivators: Record<string, (skill: mainskill.MainSkill) => SkillActivation> = {
      stockpile: (skill) => this.#activateStockpile(skill),
      moonlight: (skill) => this.#activateMoonlight(skill),
      disguise: (skill) => this.#activateDisguise(skill),
    };

    if (isModifier(skill.unit) && modifierActivators[skill.unit.type]) {
      return modifierActivators[skill.unit.type](skill);
    }

    return {
      energyTeam: 0,
      helpsTeam: 0,
    };
  }

  #activateEnergySkill(skill: mainskill.MainSkill): SkillActivation {
    if (skill === mainskill.CHARGE_ENERGY_S) {
      const clampedEnergyRecovered =
        this.currentEnergy + this.skillAmount(skill) > 150 ? 150 - this.currentEnergy : this.skillAmount(skill);

      this.skillValue += clampedEnergyRecovered;
      this.currentEnergy += clampedEnergyRecovered;
      this.totalRecovery += clampedEnergyRecovered;
      return { energyTeam: 0, helpsTeam: 0 };
    } else if (skill === mainskill.ENERGIZING_CHEER_S) {
      this.skillValue += this.skillAmount(skill);
      // TODO: not a fair implementation, it has high chance of hitting lowest pokemon

      const averageRecoveredEnergy = this.skillAmount(skill) / this.teamSize;

      return {
        energyTeam: averageRecoveredEnergy,
        helpsTeam: 0,
      };
    } else {
      this.skillValue += this.skillAmount(skill);

      return {
        energyTeam: this.skillAmount(skill),
        helpsTeam: 0,
      };
    }
  }

  #activateHelpSkill(skill: mainskill.MainSkill): SkillActivation {
    if (skill === mainskill.HELPER_BOOST) {
      // helper boost
      const unique = TeamSimulatorUtils.uniqueMembersWithBerry({
        berry: this.berry,
        members: this.team,
      });

      const helps =
        this.skillAmount(skill) + mainskill.HELPER_BOOST_UNIQUE_BOOST_TABLE[unique - 1][this.skillLevel - 1];
      this.skillValue += helps;

      return {
        energyTeam: 0,
        helpsTeam: helps,
      };
    } else {
      // extra helpful
      this.skillValue += this.skillAmount(skill);

      const helpsPerMember = this.skillAmount(skill) / this.teamSize;
      return {
        energyTeam: 0,
        helpsTeam: helpsPerMember,
      };
    }
  }

  #activateIngredientMagnet(): SkillActivation {
    const ingMagnetAmount = this.skillAmount(mainskill.INGREDIENT_MAGNET_S);
    const magnetIngredients: IngredientSet[] = ingredient.INGREDIENTS.map((ing) => ({
      ingredient: ing,
      amount: ingMagnetAmount / ingredient.INGREDIENTS.length,
    }));
    const magnetProduce: Produce = { ingredients: magnetIngredients, berries: [] };

    this.skillValue += ingMagnetAmount;
    this.cookingState.addIngredients(magnetProduce.ingredients);
    this.totalProduce = InventoryUtils.addToInventory(this.totalProduce, magnetProduce);
    return {
      energyTeam: 0,
      helpsTeam: 0,
      produce: magnetProduce,
    };
  }

  #activateTastyChance() {
    const critAmount = this.skillAmount(mainskill.TASTY_CHANCE_S);
    this.skillValue += critAmount;
    this.cookingState.addCritBonus(critAmount / 100);
    return {
      energyTeam: 0,
      helpsTeam: 0,
    };
  }

  #activateBerryBurst() {
    // doesn't exist yet
    return {
      energyTeam: 0,
      helpsTeam: 0,
    };
  }

  #activateCookingPowerUp() {
    const potAmount = this.skillAmount(mainskill.COOKING_POWER_UP_S);
    this.skillValue += potAmount;
    this.cookingState.addPotSize(potAmount);
    return {
      energyTeam: 0,
      helpsTeam: 0,
    };
  }

  #activateStockpile(skill: mainskill.MainSkill): SkillActivation {
    if (skill.unit === StockpileStrength) {
      const triggerSpitUp = MathUtils.rollRandomChance(mainskill.STOCKPILE_SPIT_CHANCE);
      if (triggerSpitUp || this.currentStockpile === mainskill.STOCKPILE_STOCKS[this.skillLevel].length - 1) {
        const stockpiledValue = mainskill.STOCKPILE_STOCKS[this.skillLevel][this.currentStockpile];
        this.skillValue += stockpiledValue;
        this.currentStockpile = 0;
      } else {
        this.currentStockpile = this.currentStockpile + 1;
      }
      return {
        energyTeam: 0,
        helpsTeam: 0,
      };
    }

    // default
    return {
      energyTeam: 0,
      helpsTeam: 0,
    };
  }

  #activateMoonlight(skill: mainskill.MainSkill) {
    if (isSkillOrModifierOf(skill, 'energy')) {
      // TODO: I want to do isMoonlightOf(mainskill.CHARGE_ENERGY_S)
      // TODO: currently doesnt support other energy skills for moonlight
      const clampedEnergyRecovered =
        this.currentEnergy + this.skillAmount(skill) > 150 ? 150 - this.currentEnergy : this.skillAmount(skill);

      this.skillValue += clampedEnergyRecovered;
      this.currentEnergy += clampedEnergyRecovered;
      this.totalRecovery += clampedEnergyRecovered;

      // TODO: missing moonlight crit, should give to team
      return { energyTeam: 0, helpsTeam: 0 };
    }

    return {
      energyTeam: 0,
      helpsTeam: 0,
    };
  }

  #activateDisguise(skill: mainskill.MainSkill) {
    // TODO: missing crit functionality, which is max 1 until sleep reset
    if (isSkillOrModifierOf(skill, 'berries')) {
      const selfBerryAmount = this.skillAmount(skill);
      const otherBerryAmount = mainskill.DISGUISE_BERRY_BURST_TEAM_AMOUNT[this.skillLevel - 1];

      const berries: BerrySet[] = this.otherMembers.map((member) => ({
        berry: member.pokemonSet.pokemon.berry,
        amount: otherBerryAmount,
        level: member.level,
      }));
      berries.push({ berry: this.berry, amount: selfBerryAmount, level: this.level });

      this.totalProduce = InventoryUtils.addToInventory(this.totalProduce, { ingredients: [], berries });
      this.skillValue += selfBerryAmount + otherBerryAmount * this.otherMembers.length;
    }

    return {
      energyTeam: 0,
      helpsTeam: 0,
    };
  }

  #activateValueSkills(skill: mainskill.MainSkill): SkillActivation {
    this.skillValue += this.skillAmount(skill);
    return {
      energyTeam: 0,
      helpsTeam: 0,
    };
  }

  private skillAmount(skill: mainskill.MainSkill) {
    const metronomeFactor =
      this.member.pokemonSet.pokemon.skill === mainskill.METRONOME ? this.skillsWithoutMetronome.length : 1;
    return skill.amount[this.member.skillLevel - 1] / metronomeFactor;
  }
}
