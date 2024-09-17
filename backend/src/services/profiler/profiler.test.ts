import { Profile, printProfilingResults } from '@src/services/profiler/profiler';

describe('profiler', () => {
  it('shall count the iterations correctly', () => {
    console.log = jest.fn();
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

    expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/Calls: 10/));
  });
});
