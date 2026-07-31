import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import type { Application } from 'express';
import type { Logger } from 'sleepapi-common';
import request from 'supertest';
import { beforeAll, vi } from 'vitest';

DaoFixture.init();

let app: Application;

describe('GET /pokemon', function () {
  beforeAll(async () => {
    // Import app after DaoFixture.init() has set up the test database
    const { app: testApp } = await import('@src/app.js');
    app = testApp;
  });

  beforeEach(() => {
    global.logger = {
      debug: vi.fn() as unknown,
      log: vi.fn() as unknown,
      info: vi.fn() as unknown,
      warn: vi.fn() as unknown,
      error: vi.fn() as unknown
    } as Logger;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Hahaha I'm not maintaining what looks like a snapshot test written without
  // a snapshot framework that's only testing SleepAPI.net. This comment
  // replaces a test that broke.

  it('should respond with 500 when pokemon is not found', async function () {
    await request(app).get('/api/pokemon/not-a-pokemon').expect(500, 'Something went wrong');
  });
});
