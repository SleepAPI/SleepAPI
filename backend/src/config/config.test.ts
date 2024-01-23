import { BackendConfig } from './config';

describe('config', () => {
  it('shall use default values', () => {
    const backendConfig = new BackendConfig();
    process.env = {};

    expect(backendConfig.config).toMatchInlineSnapshot(`
      {
        "DATABASE_MIGRATION": undefined,
        "DB_HOST": undefined,
        "DB_PASS": undefined,
        "DB_PORT": undefined,
        "DB_USER": undefined,
        "GENERATE_TIERLIST": false,
        "NODE_ENV": "DEV",
        "PORT": 3000,
      }
    `);
  });

  it('shall throw if DATABASE_MIGRATION is set to unexpected value', () => {
    const backendConfig = new BackendConfig();
    process.env.DATABASE_MIGRATION = 'incorrect';

    expect(() => backendConfig.config).toThrowErrorMatchingInlineSnapshot(
      `"DATABASE_MIGRATION is optional, but if set must be one of [UP, DOWN]"`
    );
  });
});
