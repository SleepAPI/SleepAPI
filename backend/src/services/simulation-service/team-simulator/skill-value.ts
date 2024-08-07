import { InventoryUtils } from '@src/utils/inventory-utils/inventory-utils';
import { Produce } from 'sleepapi-common';

export class SkillValue {
  private skillValue = 0;
  private skillProduce = InventoryUtils.getEmptyInventory();

  public addValue(added: number) {
    this.skillValue += added;
  }

  public addProduce(added: Produce) {
    this.skillProduce = InventoryUtils.addToInventory(this.skillProduce, added);
  }

  get value() {
    return this.skillValue;
  }

  get produce() {
    return this.skillProduce;
  }
}
