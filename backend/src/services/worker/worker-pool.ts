import path from 'path';
import workerpool from 'workerpool';

export const calculatorPool = workerpool.pool(path.resolve(__dirname, './calculator-worker.js'), {
  minWorkers: 4,
  maxWorkers: 4
});

export const solvePool = workerpool.pool(path.resolve(__dirname, './solve-worker.js'), {
  minWorkers: 4,
  maxWorkers: 4
});
