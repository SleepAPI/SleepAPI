export function toSeconds(hours: number, minutes: number, seconds: number): number {
  return 3600 * hours + 60 * minutes + seconds;
}
