import { OptimalSetResult } from '../../routes/optimal-router/optimal-router';
import { prettifyIngredientDrop } from '../../utils/json/json-utils';

class CSVConverterServiceImpl {
  public toOptimalSet(data: OptimalSetResult) {
    const header = 'Member1,Member2,Member3,Member4,Member5,Filler Ingredients\n';
    const csvEntries = data.teams
      .map(
        (c) =>
          `${c.team.map((member) => member.pokemonCombination.pokemon.name).join(',')},${prettifyIngredientDrop(
            c.surplus.total
          ).replace(/,/g, ' ')}`
      )
      .join('\n');
    return header + csvEntries;
  }
}

export const CSVConverterService = new CSVConverterServiceImpl();
