import { MathUtils, type Berry, type BerrySet } from 'sleepapi-common';

interface ZoneBonus {
  berryName: string;
  percentage: number;
  fraction: number;
}

/** Site-wide state: survives meals, sleep, and roster changes. */
export class BerryZoneState {
  // Most teams have one zone. Its hot-path reads need no map lookup or division.
  private firstBonus?: ZoneBonus;
  private otherBonuses?: Map<string, ZoneBonus>;

  private bonus(berry: Berry): ZoneBonus | undefined {
    if (!this.firstBonus) return undefined;
    return this.firstBonus.berryName === berry.name ? this.firstBonus : this.otherBonuses?.get(berry.name);
  }

  public bonusPercentage(berry: Berry): number {
    return this.bonus(berry)?.percentage ?? 0;
  }

  public addBonus(berry: Berry, amount: number, maximumBonus: number) {
    let bonus = this.bonus(berry);
    const percentage = Math.min(maximumBonus, MathUtils.round((bonus?.percentage ?? 0) + amount, 2));
    if (!bonus) {
      if (percentage <= 0) return;
      bonus = { berryName: berry.name, percentage, fraction: percentage / 100 };
      if (!this.firstBonus) this.firstBonus = bonus;
      else (this.otherBonuses ??= new Map()).set(berry.name, bonus);
    } else {
      bonus.percentage = percentage;
      bonus.fraction = percentage / 100;
    }
  }

  public reset() {
    this.firstBonus = undefined;
    this.otherBonuses = undefined;
  }

  public bonusFraction(producedBerry: Berry): number {
    return this.bonus(producedBerry)?.fraction ?? 0;
  }

  /** Equivalent extra berries used only for strength accounting, never inventory. */
  public bonusBerries(berries: BerrySet[]): BerrySet[] {
    const result: BerrySet[] = [];
    if (!this.firstBonus) return result;
    for (const set of berries) {
      const fraction = this.bonusFraction(set.berry);
      if (fraction > 0) result.push({ ...set, amount: set.amount * fraction });
    }
    return result;
  }
}
