class MathUtilsImpl {
  public floor(num: number, decimals: number) {
    const factor = Math.pow(10, decimals);
    return Math.trunc(num * factor) / factor;
  }

  public round(num: number, decimals: number) {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
  }

  public rollRandomChance(percentage: number): boolean {
    const roll = Math.random();
    return roll < percentage;
  }
}

export const MathUtils = new MathUtilsImpl();
