import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { IngredientDrawSSuperLuck, ingredientSetToFloatFlat } from 'sleepapi-common';

export class IngredientDrawSSuperLuckEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = IngredientDrawSSuperLuck;

    const roll = skillState.rng();
    const { amountFunc, critAmountFunc, ingredient, unit } = skill.rollToResult(roll);
    const amount = amountFunc({ skillLevel: skillState.skillLevel });
    const critAmount = critAmountFunc({ skillLevel: skillState.skillLevel });

    if (ingredient !== undefined) {
      const nrOfIngredients = amount + critAmount;

      const ingredients = [{ amount: nrOfIngredients, ingredient }];
      const flatIngredients = ingredientSetToFloatFlat(ingredients);

      skillState.memberState.cookingState?.addIngredients(flatIngredients);
      skillState.memberState.addSkillProduce({ berries: [], ingredients });
    }

    return {
      skill,
      activations: [
        {
          unit: unit,
          self: { regular: amount, crit: critAmount }
        }
      ]
    };
  }
}
