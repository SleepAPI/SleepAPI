export function roundDown(num: number, decimals: number) {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

/**
 * splits number into array for each whole integer, finishing with the decimals
 * 2.35 -> [1, 1, 0.35]
 */
export function splitNumber(num: number): number[] {
  const wholePart = Math.floor(num);
  const decimalPart = parseFloat((num - wholePart).toFixed(4)); // Ensures the decimal part is not overly long

  const onesArray = Array(wholePart).fill(1);

  if (decimalPart > 0) {
    onesArray.push(decimalPart);
  }

  return onesArray;
}
