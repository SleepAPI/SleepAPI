import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import './logger';

describe('Logger in Node.js mode', () => {
  let consoleLogMock: ReturnType<typeof vi.spyOn>;
  let consoleInfoMock: ReturnType<typeof vi.spyOn>;
  let consoleWarnMock: ReturnType<typeof vi.spyOn>;
  let consoleErrorMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogMock = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleInfoMock = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnMock = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.spyOn(logger as any, 'colorize').mockImplementation((_level, message: string): string => message);
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-12-13T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('logs a string message', () => {
    logger.log('Hello, world!');
    expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('Hello, world!'));
  });

  it('logs a number', () => {
    logger.log(42);
    const loggedOutput = consoleLogMock.mock.calls[0][0];

    expect(loggedOutput).toMatchInlineSnapshot(`"[LOG] 2024-12-13T12:00:00.000Z: 42"`);
  });
  it('logs an array as a pretty-printed string', () => {
    const array = [1, 2, 3];
    logger.log(array);

    // Capture the actual logged output
    const loggedOutput = consoleLogMock.mock.calls[0][0];

    // Use a snapshot for validation
    expect(loggedOutput).toMatchInlineSnapshot(`
      "[LOG] 2024-12-13T12:00:00.000Z: [
        1,
        2,
        3
      ]"
    `);
  });

  it('logs an object as JSON', () => {
    const obj = { foo: 'bar', baz: 42 };
    logger.info(obj);
    const loggedOutput = consoleInfoMock.mock.calls[0][0];
    expect(loggedOutput).toContain('[INFO]');
    expect(loggedOutput).toContain('"foo": "bar"');
    expect(loggedOutput).toContain('"baz": 42');
  });

  it('logs an Error message', () => {
    const error = new Error('An error occurred');
    logger.error(error);
    const loggedOutput = consoleErrorMock.mock.calls[0][0];
    expect(loggedOutput).toContain('An error occurred');
    expect(loggedOutput).toContain('Stacktrace');
  });

  it('formats messages with the correct log level and timestamp', () => {
    logger.info('Information here');
    expect(consoleInfoMock).toHaveBeenCalledWith(expect.stringMatching(/\[INFO\] \d{4}-\d{2}-\d{2}T/));
  });

  it('logs a warning with color', () => {
    logger.warn('This is a warning!');
    expect(consoleWarnMock).toHaveBeenCalledWith(expect.stringContaining('This is a warning!'));
  });
});

describe('Logger in browser mode', () => {
  beforeAll(() => {
    global.window = { document: {} } as unknown as Window & typeof globalThis;
  });

  afterAll(() => {
    delete global.window;
  });

  it('applies browser-specific styles for log messages', () => {
    const consoleLogMock = vi.spyOn(console, 'log').mockImplementation(() => {});
    logger.log('Hello from the browser!');
    expect(consoleLogMock).toHaveBeenCalledWith(
      expect.stringMatching(/\[LOG\] \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z: Hello from the browser!/),
      'color: gray;',
    );
  });

  it('logs an object as JSON in browser mode', () => {
    const consoleInfoMock = vi.spyOn(console, 'info').mockImplementation(() => {});
    const obj = { user: 'Ash', pokemon: 'Pikachu' };
    logger.info(obj);
    expect(consoleInfoMock).toHaveBeenCalledWith(
      expect.stringMatching(/\[INFO\] \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z: /),
      'color: blue;',
    );
    expect(consoleInfoMock).toHaveBeenCalledWith(expect.stringMatching(/"user": "Ash"/), 'color: blue;');
  });

  it('applies browser-specific styles for arrays', () => {
    const consoleLogMock = vi.spyOn(console, 'log').mockImplementation(() => {});
    logger.log(['Bulbasaur', 'Charmander', 'Squirtle']);
    expect(consoleLogMock).toHaveBeenCalledWith(
      expect.stringMatching(/\[LOG\] \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z: /),
      'color: gray;',
    );
  });

  it('logs a number in browser mode', () => {
    const consoleLogMock = vi.spyOn(console, 'log').mockImplementation(() => {});
    logger.log(42);
    expect(consoleLogMock).toHaveBeenCalledWith(
      expect.stringMatching(/\[LOG\] \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z: /),
      'color: gray;',
    );
  });
});
