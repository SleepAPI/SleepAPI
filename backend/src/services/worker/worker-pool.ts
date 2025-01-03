import { relativePath } from '@src/utils/file-utils/file-utils.js';
import workerpool from 'workerpool';

export const calculatorPool = workerpool.pool(relativePath('calculator-worker.js', import.meta.url), {
  minWorkers: 4,
  maxWorkers: 4
});

export const solvePool = workerpool.pool(relativePath('solve-worker.js', import.meta.url), {
  minWorkers: 4,
  maxWorkers: 4
});
