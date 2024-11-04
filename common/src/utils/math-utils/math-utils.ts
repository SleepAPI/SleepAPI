class MathUtilsImpl {
  public floor(num: number, decimals: number) {
    const factor = Math.pow(10, decimals);
    return Math.trunc(num * factor) / factor;
  }

  public round(num: number, decimals: number) {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
  }
}

export const MathUtils = new MathUtilsImpl();
