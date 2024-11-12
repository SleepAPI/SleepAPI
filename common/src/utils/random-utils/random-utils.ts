class RandomUtilsImpl {
  public roll(percentage: number): boolean {
    const roll = Math.random();
    return roll < percentage;
  }

  public randomElement<T>(array: T[]): T | undefined {
    if (array.length === 0) return undefined;
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
  }
}

export const RandomUtils = new RandomUtilsImpl();
