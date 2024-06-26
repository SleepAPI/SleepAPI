import { Profiler } from '@src/services/profiler/profiler';

describe('profiler', () => {
  it('shall count the iterations correctly', () => {
    console.log = jest.fn();
    class TestClass {
      @Profiler.measurePerformance
      public someFunction() {
        return 1;
      }
    }

    Profiler.init();
    const testClass = new TestClass();
    for (let i = 0; i < 10; i++) {
      testClass.someFunction();
    }

    Profiler.logPerformanceMetrics();

    expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/Calls: 10/));
  });
});
