import { test as base } from 'playwright-bdd';
import { DriverFactory } from '../src/core/drivers/driver.factory.js';
import { configManager } from '../src/config/config.manager.js';
import { AutomationDriver } from '../src/core/drivers/automation.driver.js';

export const test = base.extend<{
  mode: 'web' | 'api' | 'mobile';
  driver: AutomationDriver;
}>({
  mode: ['web', { option: true }],
  driver: async ({ mode }, use, testInfo) => {
    const driver = DriverFactory.create(mode);
    const config = {
      ...configManager.config,
      // For backwards compatibility or specific strategy expectations
      browserType: configManager.get('BROWSER'),
      headless: configManager.get('HEADLESS'),
      apiBaseUrl: configManager.get('API_BASE_URL'),
      cloudPlatform: configManager.get('CLOUD_PLATFORM'),
    };

    await driver.initialize(config);
    (driver as any).testInfo = testInfo;

    await use(driver);

    await driver.terminate();
  },
});

export { expect } from '@playwright/test';
