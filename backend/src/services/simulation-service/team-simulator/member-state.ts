import { TeamMember, TeamSettings } from '@src/domain/combination/team';
import { SleepInfo } from '@src/domain/sleep/sleep-info';
import { calculateSleepEnergyRecovery } from '@src/services/calculator/energy/energy-calculator';
import { calculateFrequencyWithEnergy } from '@src/services/calculator/help/help-calculator';
import { calculateAveragePokemonIngredientSet } from '@src/services/calculator/ingredient/ingredient-calculate';
import { calculateAverageProduce, clampHelp } from '@src/services/calculator/production/produce-calculator';
import { SkillValue } from '@src/services/simulation-service/team-simulator/skill-value';
import { TeamSimulatorUtils } from '@src/services/simulation-service/team-simulator/team-simulator-utils';
import { InventoryUtils } from '@src/utils/inventory-utils/inventory-utils';
import { getMealRecoveryAmount } from '@src/utils/meal-utils/meal-utils';
import { rollRandomChance } from '@src/utils/simulation-utils/simulation-utils';
import { TimeUtils } from '@src/utils/time-utils/time-utils';
import {
  IngredientSet,
  MathUtils,
  MemberProduction,
  Produce,
  Time,
  TimePeriod,
  ingredient,
  mainskill,
  subskill,
} from 'sleepapi-common';

export interface SkillActivation {
  energyTeam: number;
  helpsTeam: number;
  other: number; // TODO: fix strength, pot etc later, not functional now
}

export class MemberState {
  private member: TeamMember;
  private team: TeamMember[];

  // quick lookups, static data
  private skillsWithoutMetronome = mainskill.MAINSKILLS.filter((ms) => ms !== mainskill.METRONOME);

  // state
  private currentEnergy = 0;
  private nextHelp: Time;
  private dayPeriod: TimePeriod;
  private nightPeriod: TimePeriod;

  // stats
  private frequency: number;
  private skillPercentage: number;
  private currentInventory = InventoryUtils.getEmptyInventory();
  private currentSneakySnack = InventoryUtils.getEmptyInventory();
  private sneakySnackProduce: Produce;
  private averageProduce: Produce;
  private averageProduceAmount: number;
  private currentNightHelps = 0;
  private currentNightSkillProcs = 0;

  // summary
  private skillProcs = 0;
  private skillValue = new SkillValue();
  private morningProcs = 0;
  private nrOfHelps = 0;
  private dayHelps = 0;
  private totalNightHelps = 0;
  private helpsBeforeSS = 0;
  private helpsAfterSS = 0;
  private averageEnergy = 0;
  private totalRecovery = 0;
  private averageFrequency = 0;
  private totalProduce = InventoryUtils.getEmptyInventory();
  private totalSneakySnack = InventoryUtils.getEmptyInventory();
  private spilledIngredients = InventoryUtils.getEmptyInventory();
  private collectFrequency: Time | undefined = undefined;
  // private frequencyChanges: number[] = [];

  constructor(params: { member: TeamMember; team: TeamMember[]; settings: TeamSettings }) {
    const { member, team, settings } = params;

    const nrOfHelpingBonus = team.filter((member) => member.subskills.includes(subskill.HELPING_BONUS)).length;

    const dayPeriod = {
      start: settings.wakeup,
      end: settings.bedtime,
    };
    this.dayPeriod = dayPeriod;
    const nightPeriod = {
      start: settings.bedtime,
      end: settings.wakeup,
    };
    this.nightPeriod = nightPeriod;

    this.nextHelp = dayPeriod.start;

    this.skillPercentage = TeamSimulatorUtils.calculateSkillPercentage(member);
    const ingredientPercentage = TeamSimulatorUtils.calculateIngredientPercentage(member);

    const averagedPokemonCombination = calculateAveragePokemonIngredientSet(member.pokemonSet);
    const berriesPerDrop = TeamSimulatorUtils.calculateNrOfBerriesPerDrop(member);
    this.averageProduce = calculateAverageProduce(averagedPokemonCombination, ingredientPercentage, berriesPerDrop);
    this.averageProduceAmount = InventoryUtils.countInventory(this.averageProduce);

    this.sneakySnackProduce = {
      ingredients: [],
      berries: {
        amount: berriesPerDrop,
        berry: member.pokemonSet.pokemon.berry,
      },
    };

    this.frequency = TeamSimulatorUtils.calculateHelpSpeedBeforeEnergy({
      member,
      settings,
      helpingBonus: nrOfHelpingBonus,
    });

    this.member = member;
    this.team = team;
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
    const addedProduce: Produce = {
      berries: this.averageProduce.berries && {
        amount: this.averageProduce.berries.amount * helps,
        berry: this.averageProduce.berries.berry,
      },
      ingredients: this.averageProduce.ingredients.map(({ amount, ingredient }) => ({
        amount: helps * amount,
        ingredient,
      })),
    };

    this.currentInventory = InventoryUtils.addToInventory(this.currentInventory, addedProduce);
  }

  public recoverMeal() {
    this.totalRecovery += getMealRecoveryAmount(this.currentEnergy);
    this.currentEnergy += getMealRecoveryAmount(this.currentEnergy);
  }

  public attemptDayHelp(currentTime: Time): SkillActivation | undefined {
    if (TimeUtils.isAfterOrEqualWithinPeriod({ currentTime, eventTime: this.nextHelp, period: this.dayPeriod })) {
      const frequency = calculateFrequencyWithEnergy(this.frequency, this.currentEnergy);

      // update stats
      this.helpsBeforeSS += 1;
      this.dayHelps += 1;
      // this.frequencyChanges.push(frequency);

      this.currentInventory = InventoryUtils.addToInventory(this.currentInventory, this.averageProduce);
      this.emptyIfFull();

      this.nextHelp = TimeUtils.addTime(this.nextHelp, TimeUtils.secondsToTime(frequency));

      return this.attemptSkill();
    }
  }

  public attemptNightHelp(currentTime: Time) {
    if (TimeUtils.isAfterOrEqualWithinPeriod({ currentTime, eventTime: this.nextHelp, period: this.nightPeriod })) {
      const frequency = calculateFrequencyWithEnergy(this.frequency, this.currentEnergy);

      // update stats
      this.totalNightHelps += 1;
      // this.frequencyChanges.push(frequency);

      const inventorySpace = this.inventoryLimit - InventoryUtils.countInventory(this.currentInventory);
      if (inventorySpace > 0) {
        this.currentNightHelps += 1; // these run skill procs at wakeup

        const clampedProduce = clampHelp({
          inventorySpace,
          averageProduce: this.averageProduce,
          amount: this.averageProduceAmount,
        });

        this.currentInventory = InventoryUtils.addToInventory(this.currentInventory, clampedProduce);
        this.helpsBeforeSS += 1;

        if (inventorySpace < this.averageProduceAmount) {
          const voidProduce = clampHelp({
            inventorySpace: this.averageProduceAmount - inventorySpace,
            averageProduce: this.averageProduce,
            amount: this.averageProduceAmount,
          });

          this.spilledIngredients = InventoryUtils.addToInventory(this.spilledIngredients, {
            ingredients: voidProduce.ingredients,
          });
        }
      } else {
        // sneaky snack

        this.helpsAfterSS += 1;
        this.spilledIngredients = InventoryUtils.addToInventory(this.spilledIngredients, {
          ingredients: this.averageProduce.ingredients,
        });
        this.currentSneakySnack = InventoryUtils.addToInventory(this.currentSneakySnack, this.sneakySnackProduce);
      }

      this.nextHelp = TimeUtils.addTime(this.nextHelp, TimeUtils.secondsToTime(frequency));
    }
  }

  public collectInventory(): SkillActivation[] {
    this.totalProduce = InventoryUtils.addToInventory(this.totalProduce, this.currentInventory);
    this.totalProduce = InventoryUtils.addToInventory(this.totalProduce, this.currentSneakySnack);
    this.totalSneakySnack = InventoryUtils.addToInventory(this.totalSneakySnack, this.currentSneakySnack);

    // roll skill proc on each stored help, stop after if we get a successful roll
    const bankedSkillProcs: SkillActivation[] = [];
    for (let i = 0; i < this.currentNightHelps; i++) {
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
    this.currentNightSkillProcs = 0;
    this.currentInventory = InventoryUtils.getEmptyInventory();
    this.currentSneakySnack = InventoryUtils.getEmptyInventory();
    return bankedSkillProcs;
  }

  public degradeEnergy() {
    const energyToDegrade = Math.min(1, this.currentEnergy);
    this.currentEnergy = Math.max(0, MathUtils.round(this.currentEnergy - energyToDegrade, 2));
  }

  public averageResults(iterations: number): MemberProduction {
    const result: MemberProduction = {
      berries: this.totalProduce.berries && {
        amount: this.totalProduce.berries.amount / iterations,
        berry: this.totalProduce.berries.berry,
      },
      ingredients: this.totalProduce.ingredients.map(({ amount, ingredient }) => ({
        amount: amount / iterations,
        ingredient,
      })),
      skillProcs: this.skillProcs / iterations,
      externalId: this.member.externalId,
    };

    return result;
  }

  private emptyIfFull() {
    if (InventoryUtils.countInventory(this.currentInventory) + this.averageProduceAmount >= this.inventoryLimit) {
      if (!this.collectFrequency) {
        this.collectFrequency = TimeUtils.calculateDuration({ start: this.dayPeriod.start, end: this.nextHelp });
      }
      this.totalProduce = InventoryUtils.addToInventory(this.totalProduce, this.currentInventory);
      this.currentInventory = InventoryUtils.getEmptyInventory();
    }
  }

  private attemptSkill(): SkillActivation | undefined {
    if (rollRandomChance(this.skillPercentage)) {
      this.skillProcs += 1;

      if (this.member.pokemonSet.pokemon.skill === mainskill.METRONOME) {
        const result: SkillActivation = { energyTeam: 0, helpsTeam: 0, other: 0 };
        for (const skill of this.skillsWithoutMetronome) {
          const activationResult = this.activateSkill(skill);
          if (activationResult) {
            result.energyTeam += activationResult.energyTeam;
            result.helpsTeam += activationResult.helpsTeam;
          }
        }
        return result;
      } else {
        return this.activateSkill(this.member.pokemonSet.pokemon.skill);
      }
    }
  }

  private activateSkill(skill: mainskill.MainSkill): SkillActivation {
    return this.skillActivators[skill.unit](skill);
  }

  private skillActivators: Record<mainskill.MainSkillType, (skill: mainskill.MainSkill) => SkillActivation> = {
    energy: (skill) => this.#activateEnergySkill(skill),
    helps: (skill) => this.#activateHelpSkill(skill),
    ingredients: () => this.#activateIngredientMagnet(),
    'dream shards': (skill) => this.#activateValueSkills(skill),
    'pot size': (skill) => this.#activateValueSkills(skill),
    chance: (skill) => this.#activateValueSkills(skill),
    metronome: (skill) => this.#activateValueSkills(skill),
    strength: (skill) => this.#activateValueSkills(skill),
  };

  #activateEnergySkill(skill: mainskill.MainSkill): SkillActivation {
    if (skill === mainskill.CHARGE_ENERGY_S) {
      const clampedEnergyRecovered =
        this.currentEnergy + this.skillAmount(skill) > 150 ? 150 - this.currentEnergy : this.skillAmount(skill);

      this.skillValue.addValue(clampedEnergyRecovered);
      this.currentEnergy += clampedEnergyRecovered;
      this.totalRecovery += clampedEnergyRecovered;
      return { energyTeam: 0, helpsTeam: 0, other: 0 };
    } else if (skill === mainskill.ENERGIZING_CHEER_S) {
      this.skillValue.addValue(this.skillAmount(skill));
      const averageRecoveredEnergy = this.skillAmount(skill) / this.teamSize;

      return {
        energyTeam: averageRecoveredEnergy,
        helpsTeam: 0,
        other: 0,
      };
    } else {
      this.skillValue.addValue(this.skillAmount(skill));

      return {
        energyTeam: this.skillAmount(skill),
        helpsTeam: 0,
        other: 0,
      };
    }
  }

  #activateHelpSkill(skill: mainskill.MainSkill): SkillActivation {
    if (skill === mainskill.HELPER_BOOST) {
      const unique = TeamSimulatorUtils.uniqueMembersWithBerry({
        berry: this.berry,
        members: this.team,
      });

      const helps =
        this.skillAmount(skill) + mainskill.HELPER_BOOST_UNIQUE_BOOST_TABLE[unique - 1][this.skillLevel - 1];

      return {
        energyTeam: 0,
        helpsTeam: helps,
        other: 0,
      };
    } else {
      // extra helpful
      this.skillValue.addValue(this.skillAmount(skill));

      return {
        energyTeam: 0,
        helpsTeam: this.skillAmount(skill) / this.teamSize,
        other: 0,
      };
    }
  }

  #activateIngredientMagnet(): SkillActivation {
    const magnetIngredients: IngredientSet[] = ingredient.INGREDIENTS.map((ing) => ({
      ingredient: ing,
      amount: this.skillAmount(mainskill.INGREDIENT_MAGNET_S) / ingredient.INGREDIENTS.length,
    }));
    const magnetProduce = { ingredients: magnetIngredients };

    this.skillValue.addProduce(magnetProduce);
    this.currentInventory = InventoryUtils.addToInventory(this.currentInventory, magnetProduce);
    return {
      energyTeam: 0,
      helpsTeam: 0,
      other: 0, // TODO: fix
    };
  }

  #activateValueSkills(skill: mainskill.MainSkill): SkillActivation {
    this.skillValue.addValue(this.skillAmount(skill));
    return {
      energyTeam: 0,
      helpsTeam: 0,
      other: 0, // TODO: fix
    };
  }

  private skillAmount(skill: mainskill.MainSkill) {
    const metronomeFactor =
      this.member.pokemonSet.pokemon.skill === mainskill.METRONOME ? this.skillsWithoutMetronome.length : 1;
    return skill.amount[this.member.skillLevel - 1] / metronomeFactor;
  }
}
