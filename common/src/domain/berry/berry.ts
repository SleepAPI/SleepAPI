export interface Berry {
  name: string;
  value: number;
  type: string;
}
export interface BerrySet {
  amount: number;
  berry: Berry;
  level: number;
}
export type BerryIndexToAmount = Float32Array;
