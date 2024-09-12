import { describe, expect, it, vi } from 'vitest';
import { delay } from './async-utils';

describe('delay', () => {
  it('shall delay for the specified amount of time', async () => {
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

    const delayTime = 500;

    const startTime = Date.now();
    await delay(delayTime);
    const endTime = Date.now();

    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), delayTime);
    expect(endTime - startTime).toBeGreaterThanOrEqual(delayTime);

    setTimeoutSpy.mockRestore();
  });
});
