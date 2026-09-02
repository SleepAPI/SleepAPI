import { NotImplementedError } from '@src/domain/error/programming/not-implemented-error.js';
import { calculateDistribution } from '@src/services/simulation-service/team-simulator/member-state/member-state-utils.js';
import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import { BerryBurstDisguiseEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/berry-burst/berry-burst-disguise-effect.js';
import { BerryBurstDracoMeteorEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/berry-burst/berry-burst-draco-meteor-effect.js';
import { BerryBurstEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/berry-burst/berry-burst-effect.js';
import { ChargeEnergySEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/charge-energy-s/charge-energy-s-effect.js';
import { ChargeEnergySMoonlightEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/charge-energy-s/charge-energy-s-moonlight-effect.js';
import { ChargeStrengthMBadDreamsEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/charge-strength-m/charge-strength-m-bad-dreams-effect.js';
import { ChargeStrengthMEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/charge-strength-m/charge-strength-m-effect.js';
import { ChargeStrengthSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/charge-strength-s/charge-strength-s-effect.js';
import { ChargeStrengthSRangeEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/charge-strength-s/charge-strength-s-range-effect.js';
import { ChargeStrengthSStockpileEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/charge-strength-s/charge-strength-s-stockpile-effect.js';
import { CookingAssistSBulkUpEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/cooking-assist-s/cooking-assist-s-bulk-up-effect.js';
import { CookingAssistSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/cooking-assist-s/cooking-assist-s-effect.js';
import { CookingPowerUpSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/cooking-power-up-s/cooking-power-up-s-effect.js';
import { CookingPowerUpSMinusEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/cooking-power-up-s/cooking-power-up-s-minus-effect.js';
import { DreamShardMagnetSAuraSphereEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/dream-shard-magnet-s/dream-shard-magnet-s-aura-sphere-effect.js';
import { DreamShardMagnetSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/dream-shard-magnet-s/dream-shard-magnet-s-effect.js';
import { DreamShardMagnetSRangeEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/dream-shard-magnet-s/dream-shard-magnet-s-range-effect.js';
import { EnergizingCheerSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/energizing-cheer-s/energizing-cheer-s-effect.js';
import { EnergizingCheerSHealPulseEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/energizing-cheer-s/energizing-cheer-s-heal-pulse-effect.js';
import { EnergizingCheerSNuzzleEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/energizing-cheer-s/energizing-cheer-s-nuzzle-effect.js';
import { EnergyForEveryoneSBerryJuiceEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/energy-for-everyone-s/energy-for-everyone-s-berry-juice-effect.js';
import { EnergyForEveryoneSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/energy-for-everyone-s/energy-for-everyone-s-effect.js';
import { EnergyForEveryoneSLunarBlessingEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/energy-for-everyone-s/energy-for-everyone-s-lunar-blessing-effect.js';
import { ExtraHelpfulSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/extra-helpful-s/extra-helpful-s-effect.js';
import { HelperBoostEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/helper-boost/helper-boost-effect.js';
import {
  IngredientDrawSCutieflyEffect,
  IngredientDrawSDwebbleEffect,
  IngredientDrawSHawluchaEffect,
  IngredientDrawSSandshrewEffect
} from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/ingredient-draw-s/ingredient-draw-s-effect.js';
import { IngredientDrawSHyperCutterEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/ingredient-draw-s/ingredient-draw-s-hyper-cutter-effect.js';
import { IngredientDrawSSuperLuckEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/ingredient-draw-s/ingredient-draw-s-super-luck-effect.js';
import { IngredientMagnetSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/ingredient-magnet-s/ingredient-magnet-s-effect.js';
import {
  IngredientMagnetSPlusPlusleEffect,
  IngredientMagnetSPlusToxtricityEffect
} from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/ingredient-magnet-s/ingredient-magnet-s-plus-effect.js';
import { IngredientMagnetSPresentEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/ingredient-magnet-s/ingredient-magnet-s-present-effect.js';
import { MetronomeEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/metronome/metronome-effect.js';
import { SkillCopyEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/skill-copy/skill-copy-effect.js';
import { SkillCopyMimicEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/skill-copy/skill-copy-mimic-effect.js';
import { SkillCopyTransformEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/skill-copy/skill-copy-transform-effect.js';
import { TastyChanceSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/tasty-chance-s/tasty-chance-s-effect.js';
import { VersatileSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/versatile/versatile-effect.js';
import type {
  SkillActivation,
  TeamActivationValue
} from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { PreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import type { AmountParams, Mainskill, MainskillActivation, MainskillUnit, MemberSkillValue } from 'sleepapi-common';
import {
  BerryBurst,
  BerryBurstDisguise,
  BerryBurstDracoMeteor,
  ChargeEnergyS,
  ChargeEnergySMoonlight,
  ChargeStrengthM,
  ChargeStrengthMBadDreams,
  ChargeStrengthS,
  ChargeStrengthSRange,
  ChargeStrengthSStockpile,
  CookingAssistS,
  CookingAssistSBulkUp,
  CookingPowerUpS,
  CookingPowerUpSMinus,
  defaultZero,
  DreamShardMagnetS,
  DreamShardMagnetSAuraSphere,
  DreamShardMagnetSRange,
  EnergizingCheerS,
  EnergizingCheerSHealPulse,
  EnergizingCheerSNuzzle,
  EnergyForEveryoneS,
  EnergyForEveryoneSBerryJuice,
  EnergyForEveryoneSLunarBlessing,
  ExtraHelpfulS,
  HelperBoost,
  IngredientDrawSCutiefly,
  IngredientDrawSDwebble,
  IngredientDrawSHawlucha,
  IngredientDrawSHyperCutter,
  IngredientDrawSSandshrew,
  IngredientDrawSSuperLuck,
  IngredientMagnetS,
  IngredientMagnetSPlusPlusle,
  IngredientMagnetSPlusToxtricity,
  IngredientMagnetSPresent,
  mainskillUnits,
  Metronome,
  SkillCopy,
  SkillCopyMimic,
  SkillCopyTransform,
  TastyChanceS,
  Versatile,
  ZeroAmount
} from 'sleepapi-common';

export class SkillState {
  memberState: MemberState;
  skillEffects: Map<Mainskill, SkillEffect>;
  rng: PreGeneratedRandom;

  // state
  private helpsSinceLastSkillProc = 0;
  private todaysSkillProcs = 0;

  // stats
  private skillValue: MemberSkillValue = Object.fromEntries(
    mainskillUnits.map((key) => [key, { amountToSelf: 0, amountToTeam: 0 }])
  ) as MemberSkillValue;
  private regularValue = 0;
  private critValue = 0;
  private skillProcs = 0;
  private skillCrits = 0;
  private skillProcsPerDay: number[] = [];

  constructor(memberState: MemberState, rng: PreGeneratedRandom) {
    this.memberState = memberState;
    this.rng = rng;

    this.skillEffects = new Map<Mainskill, SkillEffect>([
      [BerryBurst, new BerryBurstEffect()],
      [BerryBurstDisguise, new BerryBurstDisguiseEffect()],
      [BerryBurstDracoMeteor, new BerryBurstDracoMeteorEffect()],
      [ChargeEnergyS, new ChargeEnergySEffect()],
      [ChargeEnergySMoonlight, new ChargeEnergySMoonlightEffect()],
      [ChargeStrengthM, new ChargeStrengthMEffect()],
      [ChargeStrengthMBadDreams, new ChargeStrengthMBadDreamsEffect()],
      [ChargeStrengthS, new ChargeStrengthSEffect()],
      [ChargeStrengthSRange, new ChargeStrengthSRangeEffect()],
      [ChargeStrengthSStockpile, new ChargeStrengthSStockpileEffect()],
      [CookingAssistS, new CookingAssistSEffect()],
      [CookingAssistSBulkUp, new CookingAssistSBulkUpEffect()],
      [CookingPowerUpS, new CookingPowerUpSEffect()],
      [CookingPowerUpSMinus, new CookingPowerUpSMinusEffect()],
      [DreamShardMagnetS, new DreamShardMagnetSEffect()],
      [DreamShardMagnetSAuraSphere, new DreamShardMagnetSAuraSphereEffect()],
      [DreamShardMagnetSRange, new DreamShardMagnetSRangeEffect()],
      [EnergizingCheerS, new EnergizingCheerSEffect()],
      [EnergizingCheerSHealPulse, new EnergizingCheerSHealPulseEffect()],
      [EnergizingCheerSNuzzle, new EnergizingCheerSNuzzleEffect()],
      [EnergyForEveryoneS, new EnergyForEveryoneSEffect()],
      [EnergyForEveryoneSBerryJuice, new EnergyForEveryoneSBerryJuiceEffect()],
      [EnergyForEveryoneSLunarBlessing, new EnergyForEveryoneSLunarBlessingEffect()],
      [ExtraHelpfulS, new ExtraHelpfulSEffect()],
      [HelperBoost, new HelperBoostEffect()],
      [IngredientMagnetS, new IngredientMagnetSEffect()],
      [IngredientMagnetSPlusPlusle, new IngredientMagnetSPlusPlusleEffect()],
      [IngredientMagnetSPlusToxtricity, new IngredientMagnetSPlusToxtricityEffect()],
      [IngredientMagnetSPresent, new IngredientMagnetSPresentEffect()],
      [IngredientDrawSCutiefly, new IngredientDrawSCutieflyEffect()],
      [IngredientDrawSDwebble, new IngredientDrawSDwebbleEffect()],
      [IngredientDrawSHawlucha, new IngredientDrawSHawluchaEffect()],
      [IngredientDrawSSandshrew, new IngredientDrawSSandshrewEffect()],
      [IngredientDrawSHyperCutter, new IngredientDrawSHyperCutterEffect()],
      [IngredientDrawSSuperLuck, new IngredientDrawSSuperLuckEffect()],
      [Metronome, new MetronomeEffect()],
      [SkillCopy, new SkillCopyEffect()],
      [SkillCopyMimic, new SkillCopyMimicEffect()],
      [SkillCopyTransform, new SkillCopyTransformEffect()],
      [TastyChanceS, new TastyChanceSEffect()],
      [Versatile, new VersatileSEffect()]
    ]);
  }

  // TODO: apparently returning early here makes the team sim insanely fast, so skill handling is slower than expected
  public attemptSkill(): SkillActivation[] {
    const activations: SkillActivation[] = [];
    this.helpsSinceLastSkillProc += 1;

    if (
      this.helpsSinceLastSkillProc > this.memberState.member.pokemonWithIngredients.pokemon.pityProcThreshold ||
      this.rng() < this.skillPercentage
    ) {
      this.todaysSkillProcs += 1;
      activations.push(this.activateSkill(this.skill));
    }

    return activations;
  }

  public addBonusActivation(): SkillActivation {
    this.todaysSkillProcs += 1;
    return this.activateSkill(this.skill, false);
  }

  public wakeup() {
    this.skillProcsPerDay.push(this.todaysSkillProcs);
    this.todaysSkillProcs = 0;
  }

  public addValue(value: TeamActivationValue) {
    this.regularValue += value.regular;
    this.critValue += value.crit;
  }

  public addSkillValue(params: { unit: MainskillUnit; amountToSelf: number; amountToTeam: number }) {
    const { unit, amountToSelf, amountToTeam } = params;
    const entry = this.skillValue[unit];
    entry.amountToSelf += amountToSelf;
    entry.amountToTeam += amountToTeam;
  }

  public results(iterations: number) {
    const skillProcsPerDay = this.skillProcsPerDay.slice(1); // remove first wakeup when nothing has happened yet
    return {
      skillValue: Object.fromEntries(
        Object.entries(this.skillValue)
          .filter(([_d, value]) => value.amountToSelf !== 0 || value.amountToTeam !== 0)
          .map(([key, value]) => [
            key,
            {
              amountToSelf: value.amountToSelf / iterations,
              amountToTeam: value.amountToTeam / iterations
            }
          ])
      ) as MemberSkillValue,
      skillProcs: this.skillProcs / iterations,
      skillCrits: this.skillCrits / iterations,
      skillRegularValue: this.regularValue / iterations,
      skillCritValue: this.critValue / iterations,
      skillProcDistribution: calculateDistribution(skillProcsPerDay)
    };
  }

  get skill() {
    return this.memberState.skill;
  }

  get skillPercentage() {
    return this.memberState.skillPercentage;
  }

  get skillLevel() {
    return Math.min(
      this.memberState.member.settings.skillLevel,
      this.memberState.member.pokemonWithIngredients.pokemon.skill.maxLevel
    );
  }

  public skillAmount(activation: MainskillActivation, params?: Partial<AmountParams>) {
    return activation.amount({
      ...params,
      skillLevel: this.skillLevel
    });
  }

  public skillTeamAmount(activation: MainskillActivation, params?: Partial<AmountParams>) {
    return (activation.teamAmount ?? ZeroAmount)({
      ...params,
      skillLevel: this.skillLevel
    });
  }

  public skillCritAmount(activation: MainskillActivation, params?: Partial<AmountParams>) {
    return (activation.critAmount ?? ZeroAmount)({
      ...params,
      skillLevel: this.skillLevel
    });
  }

  private activateSkill(skill: Mainskill, resetPityProcCount: boolean = true): SkillActivation {
    const effect = this.skillEffects.get(skill);
    if (!effect) {
      throw new NotImplementedError(`No SkillEffect implemented for skill: ${skill.name}`);
    }

    const skillActivation: SkillActivation = effect.activate(this);

    // update state
    this.skillProcs += 1;
    if (resetPityProcCount) {
      this.helpsSinceLastSkillProc = 0;
    }

    let hadACrit = false;
    for (const activation of skillActivation.activations) {
      const selfRegular = defaultZero(activation.self?.regular);
      const selfCrit = defaultZero(activation.self?.crit);
      const teamRegular = defaultZero(activation.team?.regular);
      const teamCrit = defaultZero(activation.team?.crit);

      if (selfCrit > 0 || teamCrit > 0) {
        hadACrit = true;
      }

      // only add self value directly, team value is added after team feedback in addValue
      this.regularValue += selfRegular;
      this.critValue += selfCrit;

      const entry = this.skillValue[activation.unit];
      entry.amountToSelf += selfRegular + selfCrit;
      entry.amountToTeam += teamRegular + teamCrit;
    }

    if (hadACrit) {
      this.skillCrits += 1;
    }
    return skillActivation;
  }
}
