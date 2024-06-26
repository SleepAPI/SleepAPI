class ProfilerImpl {
  private performanceMap = new Map<string, { total: number; count: number }>();

  public init() {
    this.performanceMap.clear();
  }

  public measurePerformance = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    const performanceMap = this.performanceMap;

    descriptor.value = function (...args: any[]) {
      const start = performance.now();
      const result = originalMethod.apply(this, args);
      const end = performance.now();
      const duration = end - start;

      if (!performanceMap.has(propertyKey)) {
        performanceMap.set(propertyKey, { total: 0, count: 0 });
      }

      const entry = performanceMap.get(propertyKey);
      if (entry) {
        entry.total += duration;
        entry.count += 1;
      }

      return result;
    };
    return descriptor;
  };

  public logPerformanceMetrics() {
    this.performanceMap.forEach((value, key) => {
      const average = value.total / value.count;
      console.log(
        `[${key}] Total: ${value.total.toFixed(5)} ms, Calls: ${value.count}, Average: ${average.toFixed(5)} ms`
      );
    });
  }
}

export const Profiler = new ProfilerImpl();
