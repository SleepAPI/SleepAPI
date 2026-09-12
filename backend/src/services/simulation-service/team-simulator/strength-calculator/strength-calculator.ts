import type { BerrySet, MemberProduction, MemberStrength, TeamSettings } from 'sleepapi-common';
import { BASE_FAVORED_BERRY_MULTIPLIER, berryPowerForLevel, EXPERT_MODE_BERRY_BONUS_MULTIPLIER } from 'sleepapi-common';

type IslandBerries = Pick<TeamSettings['island'], 'berries' | 'expertMode'>;

export class StrengthCalculator {
  public calculateStrength(params: {
    settings: TeamSettings;
    produceWithoutSkill: MemberProduction['produceWithoutSkill'];
    produceFromSkill: MemberProduction['produceFromSkill'];
    skillValue: MemberProduction['skillValue'];
    areaBonus?: number;
  }): MemberStrength {
    const { settings, produceWithoutSkill, produceFromSkill, skillValue } = params;
    const appliedAreaBonus = params.areaBonus ?? settings.island.areaBonus ?? 0;

    const berryStrength = this.calculateBerryStrength({
      berries: produceWithoutSkill.berries,
      island: settings.island,
      areaBonus: appliedAreaBonus
    });

    const skillStrength = this.calculateSkillStrength({
      produceFromSkill,
      skillValue,
      island: settings.island,
      areaBonus: appliedAreaBonus
    });

    return {
      berries: berryStrength,
      skill: skillStrength
    };
  }

  private calculateBerryStrength(params: {
    berries: BerrySet[];
    island: IslandBerries;
    areaBonus: number;
  }): MemberStrength['berries'] {
    const { berries, island, areaBonus } = params;

    const berryBonusActive = island.expertMode?.randomBonus === 'berry';

    let totalBase = 0;
    let totalFavored = 0;
    let totalIslandBonus = 0;

    for (const producedBerry of berries) {
      const isFavored = island.berries.some((b) => b.name === producedBerry.berry.name);
      const favoredMultiplier = isFavored
        ? berryBonusActive
          ? EXPERT_MODE_BERRY_BONUS_MULTIPLIER
          : BASE_FAVORED_BERRY_MULTIPLIER
        : 1;
      const power = berryPowerForLevel(producedBerry.berry, producedBerry.level);

      const baseStrength = producedBerry.amount * power;
      const favoredStrength = baseStrength * (favoredMultiplier - 1);
      const islandBonusStrength = (baseStrength + favoredStrength) * (areaBonus / 100);

      totalBase += baseStrength;
      totalFavored += favoredStrength;
      totalIslandBonus += islandBonusStrength;
    }

    return {
      total: totalBase + totalFavored + totalIslandBonus,
      breakdown: {
        base: totalBase,
        favored: totalFavored,
        islandBonus: totalIslandBonus
      }
    };
  }

  private calculateSkillStrength(params: {
    produceFromSkill: MemberProduction['produceFromSkill'];
    skillValue: MemberProduction['skillValue'];
    island: IslandBerries;
    areaBonus: number;
  }): MemberStrength['skill'] {
    const { produceFromSkill, skillValue, island, areaBonus } = params;

    // 1. Strength from berries produced by skills
    const skillBerryStrength = this.calculateBerryStrength({
      berries: produceFromSkill.berries,
      island,
      areaBonus
    });

    // 2. Strength from 'strength' unit skills
    const strengthSkillValue = skillValue['strength'] ?? { amountToSelf: 0, amountToTeam: 0 };
    const skillAmount = strengthSkillValue.amountToSelf + strengthSkillValue.amountToTeam;

    const skillBase = skillAmount;
    const skillIslandBonus = skillAmount * (areaBonus / 100);

    // Combine
    const totalBase = skillBerryStrength.breakdown.base + skillBerryStrength.breakdown.favored + skillBase;
    const totalIslandBonus = skillBerryStrength.breakdown.islandBonus + skillIslandBonus;

    return {
      total: totalBase + totalIslandBonus,
      breakdown: {
        base: totalBase,
        islandBonus: totalIslandBonus
      }
    };
  }
}
