const LOG_LEVEL = process.env.LOG_LEVEL || 'warn';

const levels = {
  error: 0,
  warn: 1,
  info: 2
};

const currentLevel = levels[LOG_LEVEL] ?? levels.warn;

console.info = (...args) => {
  if (currentLevel >= levels.info) {
    process.stdout.write(`[INFO] ${args.join(' ')}\n`);
  }
};

console.warn = (...args) => {
  if (currentLevel >= levels.warn) {
    process.stderr.write(`[WARN] ${args.join(' ')}\n`);
  }
};

console.error = (...args) => {
  if (currentLevel >= levels.error) {
    process.stderr.write(`[ERROR] ${args.join(' ')}\n`);
  }
};
