import { PlaywrightDriverStrategy } from './strategies/playwright.strategy.js';
import { PlaywrightApiStrategy } from './strategies/playwright.api.strategy.js';
import { AxiosApiStrategy } from './strategies/axios.api.strategy.js';
import { WebdriverioMobileStrategy } from './strategies/webdriverio.mobile.strategy.js';
import { configManager } from '../../config/config.manager.js';
import { AutomationDriver } from './automation.driver.js';

/**
 * Factory class for instantiating the correct AutomationDriver strategy.
 */
export class DriverFactory {
  /**
   * Creates and returns an AutomationDriver instance based on the configuration.
   */
  static create(overriddenMode: 'web' | 'api' | 'mobile' | null = null): AutomationDriver {
    const mode = overriddenMode || configManager.get('EXECUTION_MODE');

    switch (mode) {
      case 'web':
        return new PlaywrightDriverStrategy();
      case 'api': {
        const provider = configManager.get('API_PROVIDER');
        return provider === 'axios' ? new AxiosApiStrategy() : new PlaywrightApiStrategy();
      }
      case 'mobile':
        return new WebdriverioMobileStrategy();
      default:
        throw new Error(`Unsupported execution mode: ${mode}`);
    }
  }
}
