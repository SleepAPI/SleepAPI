interface ProfilingData {
  callCount: number;
  totalTime: number;
  avgTime: number;
}

const profilingResults: Record<string, ProfilingData> = {};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Profile(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  const className = target.constructor.name;

  const profilingKey = `${className}.${propertyKey}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  descriptor.value = function (...args: any[]) {
    const start = performance.now();

    if (!profilingResults[profilingKey]) {
      profilingResults[profilingKey] = {
        callCount: 0,
        totalTime: 0,
        avgTime: 0
      };
    }

    const result = originalMethod.apply(this, args);

    const end = performance.now();
    const duration = end - start;

    profilingResults[profilingKey].callCount++;
    profilingResults[profilingKey].totalTime += duration;
    profilingResults[profilingKey].avgTime =
      profilingResults[profilingKey].totalTime / profilingResults[profilingKey].callCount;

    return result;
  };

  return descriptor;
}

export function printProfilingResults() {
  logger.log('Profiling Results:');
  for (const key in profilingResults) {
    const { callCount, totalTime, avgTime } = profilingResults[key];
    logger.log(`Function: ${key}`);
    logger.log(`  Calls: ${callCount}`);
    logger.log(`  Total Time: ${totalTime.toFixed(6)}ms`);
    logger.log(`  Average Time per Call: ${avgTime.toFixed(6)}ms`);
    logger.log('');
  }

  Object.keys(profilingResults).forEach((key) => delete profilingResults[key]);
}
