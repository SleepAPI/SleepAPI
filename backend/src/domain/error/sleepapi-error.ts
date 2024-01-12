export class SleepAPIError extends Error {
  static message(message: string) {
    return new this(message);
  }
}
