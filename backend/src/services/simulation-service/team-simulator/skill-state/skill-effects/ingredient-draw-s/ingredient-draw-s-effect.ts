import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import type { Mainskill } from 'sleepapi-common';
import {
  CUTIEFLY,
  DWEBBLE,
  HAWLUCHA,
  IngredientDrawSCutiefly,
  IngredientDrawSDwebble,
  IngredientDrawSHawlucha,
  IngredientDrawSSandshrew,
  ingredientSetToFloatFlat,
  SANDSHREW,
  type Ingredient
} from 'sleepapi-common';

abstract class IngredientDrawSEffect implements SkillEffect {
  abstract skill: Mainskill;
  abstract ingredientOptions: Ingredient[];

  activate(skillState: SkillState): SkillActivation {
    const nrOfIngredients = skillState.skillAmount(this.skill.activations.ingredients);

    const ingredient: Ingredient = skillState.rng.randomElement(this.ingredientOptions);

    const ingredients = [{ amount: nrOfIngredients, ingredient }];
    const flatIngredients = ingredientSetToFloatFlat(ingredients);

    skillState.memberState.cookingState?.addIngredients(flatIngredients);
    skillState.memberState.addSkillProduce({ berries: [], ingredients });

    return {
      skill: this.skill,
      activations: [
        {
          unit: 'ingredients',
          self: { regular: nrOfIngredients, crit: 0 }
        }
      ]
    };
  }
}

export class IngredientDrawSSandshrewEffect extends IngredientDrawSEffect {
  skill = IngredientDrawSSandshrew;
  ingredientOptions = SANDSHREW.ingredient60.map((ingSet) => ingSet.ingredient);
}

export class IngredientDrawSDwebbleEffect extends IngredientDrawSEffect {
  skill = IngredientDrawSDwebble;
  ingredientOptions = DWEBBLE.ingredient60.map((ingSet) => ingSet.ingredient);
}

export class IngredientDrawSHawluchaEffect extends IngredientDrawSEffect {
  skill = IngredientDrawSHawlucha;
  ingredientOptions = HAWLUCHA.ingredient60.map((ingSet) => ingSet.ingredient);
}

export class IngredientDrawSCutieflyEffect extends IngredientDrawSEffect {
  skill = IngredientDrawSCutiefly;
  ingredientOptions = CUTIEFLY.ingredient60.map((ingSet) => ingSet.ingredient);
}
