import { Profile, printProfilingResults } from '@src/services/profiler/profiler.js';
import { describe, expect, it } from 'bun:test';
import { boozle } from 'bunboozle';

describe('profiler', () => {
  it('shall count the iterations correctly', () => {
    boozle(console, 'log', () => undefined);
    class TestClass {
      @Profile
      public someFunction() {
        return 1;
      }
    }

    const testClass = new TestClass();
    for (let i = 0; i < 10; i++) {
      testClass.someFunction();
    }

    printProfilingResults();

    expect(logger.log).toHaveBeenCalledWith(expect.stringMatching(/Calls: 10/));
  });
});
