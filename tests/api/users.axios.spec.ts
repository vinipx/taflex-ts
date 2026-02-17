import { describe, it, expect, beforeAll } from 'vitest';
import { DriverFactory } from '../../src/core/drivers/driver.factory.js';
import { configManager } from '../../src/config/config.manager.js';
import { AxiosApiStrategy } from '../../src/core/drivers/strategies/axios.api.strategy.js';

describe('Specialized API Tests (Axios + Vitest)', () => {
  let driver: AxiosApiStrategy;

  beforeAll(async () => {
    driver = DriverFactory.create('api') as AxiosApiStrategy;

    await driver.initialize({
      apiBaseUrl: configManager.get('API_BASE_URL') || 'https://jsonplaceholder.typicode.com',
      timeout: configManager.get('TIMEOUT'),
    });
  });

  it('should fetch users list using Axios strategy', async () => {
    const response = await driver.get('/users');

    expect(response.status()).toBe(200);
    expect(response.ok()).toBe(true);

    const users = await response.json();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
    expect(users[0]).toHaveProperty('username');
  });
});
