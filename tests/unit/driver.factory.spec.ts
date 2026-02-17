import { describe, it, expect, vi } from 'vitest';
import { DriverFactory } from '../../src/core/drivers/driver.factory.js';
import { PlaywrightDriverStrategy } from '../../src/core/drivers/strategies/playwright.strategy.js';
import { WebdriverioMobileStrategy } from '../../src/core/drivers/strategies/webdriverio.mobile.strategy.js';

vi.mock('../../src/config/config.manager.js', () => ({
  configManager: {
    get: vi.fn((key) => {
      if (key === 'EXECUTION_MODE') return 'web';
      if (key === 'API_PROVIDER') return 'playwright';
      return undefined;
    }),
  },
}));

describe('DriverFactory', () => {
  it('should create PlaywrightDriverStrategy for web mode', () => {
    const driver = DriverFactory.create('web');
    expect(driver).toBeInstanceOf(PlaywrightDriverStrategy);
  });

  it('should create WebdriverioMobileStrategy for mobile mode', () => {
    const driver = DriverFactory.create('mobile');
    expect(driver).toBeInstanceOf(WebdriverioMobileStrategy);
  });

  it('should throw error for unsupported mode', () => {
    expect(() => DriverFactory.create('invalid' as any)).toThrow(
      'Unsupported execution mode: invalid'
    );
  });
});
