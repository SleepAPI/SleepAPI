import { Mainskill, type ActivationsType, type AmountParams } from '../../mainskill';

export const Psystrike = new (class extends Mainskill {
  name = 'Psystrike (Berry Zone)';
  // Prototype RP values; replace when Mewtwo's full data is available.
  RP = [1408, 2002, 2762, 3813, 5264, 7274];
  // https://www.serebii.net/pokemonsleep/mainskills/psystrikeberryzone.shtml
  strengthAmounts = [1408, 2002, 2762, 3813, 5264, 7274];
  // Percentage points per activation, from the datamined infographic and its Lv.1 correction:
  // https://www.reddit.com/r/PokemonSleep/comments/1wc455o/mewtwo_info_card_v380_update_my_mewtwo_event/
  berryZoneAmounts = [0.6, 0.8, 1, 1.2, 1.6, 2];
  maximumBonus = 24;
  image = 'strength';
  berryZoneAmount = this.leveledAmount(this.berryZoneAmounts);
  description = (params: AmountParams) =>
    `Increases Snorlax's Strength by ${this.activations.strength.amount(params)} and Mago Berry Strength by ${this.berryZoneAmount(params)}%, up to ${this.maximumBonus}%. The zone remains after switching Pokémon, until moving sites.`;
  activations: ActivationsType = {
    strength: { unit: 'strength', amount: this.leveledAmount(this.strengthAmounts) }
  };
})();
