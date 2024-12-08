import { Profile, printProfilingResults } from '@src/services/profiler/profiler.js';
import { Logger } from 'sleepapi-common';

describe('profiler', () => {
  beforeEach(() => {
    global.logger = {
      debug: vi.fn() as unknown,
      log: vi.fn() as unknown,
      info: vi.fn() as unknown,
      warn: vi.fn() as unknown,
      error: vi.fn() as unknown
    } as Logger;
  });

  it('shall count the iterations correctly', () => {
    logger.log = vi.fn();
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
