import type { Ingredient } from '../ingredient/ingredient';
import type { MainskillUnit } from './mainskill-unit';

export type AmountParams = { skillLevel: number; extra?: number; ingredient?: Ingredient };
export type AmountFunction = (params: AmountParams) => number;

export const ZeroAmount: AmountFunction = () => 0;

export type DescriptionFunction = (params: AmountParams) => string;

export type MainskillActivation = {
  unit: MainskillUnit;
  amount: AmountFunction;
  teamAmount?: AmountFunction;
  critAmount?: AmountFunction;
};

export interface MainskillBaseAttributes {
  name: string;
  RP: number[];
  description: DescriptionFunction;
  activations: Record<string, MainskillActivation>;
}

export type ActivationsType = { [K: string]: MainskillActivation };

export interface ModifiedSkillConfig {
  baseSkill: Mainskill;
  modifierName: string;
  activations: ActivationsType;
  description?: string;
}

export abstract class Mainskill {
  public abstract readonly name: string;
  public abstract readonly description: DescriptionFunction;
  public abstract readonly image: string;
  public abstract readonly RP: number[];
  public abstract readonly activations: ActivationsType;

  constructor(benefitsTeamIngredients: boolean = false, skipAddingToMainskills: boolean = false) {
    if (benefitsTeamIngredients) {
      // This flag is used to determine which pokemon are simmed separately in the tier list, as to not affect the production of other pokemon
      INGREDIENT_SUPPORT_MAINSKILLS.push(this);
    }

    if (!skipAddingToMainskills) {
      // This is a small hack that allows us to create mock/test mainskills without having to add them to the mainskill list
      MAINSKILLS.push(this);
    }
  }

  get maxLevel(): number {
    return this.RP.length;
  }

  /**
   * Helper method to create an AmountFunction from an array of values
   * Automatically clamps skillLevel to the valid range (1 to maxLevel)
   */
  public leveledAmount(amounts: number[]): AmountFunction {
    return (params: AmountParams) => {
      const clampedLevel = Math.min(this.maxLevel, Math.max(1, params.skillLevel));
      return amounts[clampedLevel - 1];
    };
  }

  getRPValue(level: number): number {
    return this.RP[level - 1];
  }

  hasUnit(unit: string): boolean {
    return Object.values(this.activations).some((activation) => activation.unit === unit);
  }

  getUnits(): MainskillUnit[] {
    const unitSet = new Set(Object.values(this.activations).map((activation) => activation.unit));
    return Array.from(unitSet);
  }

  getActivationNames(): string[] {
    return Object.keys(this.activations);
  }

  get isModified(): boolean {
    return this instanceof ModifiedMainskill;
  }

  is(...other: Mainskill[]): boolean {
    return other.some((o) => this.name === o.name);
  }

  // TEST: missing tests
  isOrModifies(...skills: Mainskill[]): boolean {
    return skills.some(
      (skill) => this.name === skill.name || (this instanceof ModifiedMainskill && this.baseSkill.name === skill.name)
    );
  }
}

export abstract class ModifiedMainskill extends Mainskill {
  public abstract readonly baseSkill: Mainskill;
  public abstract readonly modifierName: string;

  get name(): string {
    return `${this.modifierName} (${this.baseSkill.name})`;
  }
}

export const MAINSKILLS: Mainskill[] = [];

export const INGREDIENT_SUPPORT_MAINSKILLS: Mainskill[] = [];
