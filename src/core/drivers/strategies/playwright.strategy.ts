import { chromium, firefox, webkit, Browser, BrowserContext, Page, TestInfo } from '@playwright/test';
import { AutomationDriver } from '../automation.driver.js';
import { locatorManager } from '../../locators/locator.manager.js';
import { PlaywrightElement } from '../../elements/playwright.element.js';
import { CapabilityBuilder } from '../../utils/capability.builder.js';
import { logger } from '../../utils/logger.js';
import { Config } from '../../../config/config.manager.js';

/**
 * Web automation driver implementation using Playwright.
 */
export class PlaywrightDriverStrategy extends AutomationDriver {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  public testInfo: TestInfo | null = null;

  async initialize(config: Config): Promise<Page> {
    const { BROWSER = 'chromium', HEADLESS = true, CLOUD_PLATFORM = 'local' } = config;
    const engines: Record<string, any> = { chromium, firefox, webkit };

    if (CLOUD_PLATFORM === 'local') {
      this.browser = await engines[BROWSER].launch({ headless: HEADLESS });
    } else {
      const caps = CapabilityBuilder.buildWebCapabilities(config);
      let wsEndpoint = '';

      if (CLOUD_PLATFORM === 'browserstack') {
        wsEndpoint = `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(caps))}`;
      } else if (CLOUD_PLATFORM === 'saucelabs') {
        wsEndpoint = `wss://ondemand.us-west-1.saucelabs.com/playwright/test?caps=${encodeURIComponent(JSON.stringify(caps))}`;
      }

      this.browser = await engines[BROWSER].connect(wsEndpoint);
    }

    if (!this.browser) throw new Error('Failed to initialize browser');

    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    this.page = await this.context.newPage();

    locatorManager.load();

    return this.page;
  }

  async navigateTo(url: string): Promise<void> {
    if (!this.page) throw new Error('Driver not initialized');
    logger.info(`Navigating to: ${url}`);
    await this.page.goto(url);
  }

  async findElement(logicalName: string): Promise<PlaywrightElement> {
    if (!this.page) throw new Error('Driver not initialized');
    const selector = locatorManager.resolve(logicalName);
    const locator = this.page.locator(selector);
    return new PlaywrightElement(locator, logicalName);
  }

  async loadLocators(pageName: string): Promise<void> {
    locatorManager.load(pageName);
  }

  async terminate(): Promise<void> {
    if (this.browser) await this.browser.close();
  }

  async captureScreenshot(name: string): Promise<Buffer> {
    if (!this.page) throw new Error('Driver not initialized');
    const screenshot = await this.page.screenshot({ fullPage: true });

    if (this.testInfo) {
      await this.testInfo.attach(name, {
        body: screenshot,
        contentType: 'image/png',
      });
    }

    logger.screenshot(name, screenshot);

    return screenshot;
  }

  getExecutionMode(): string {
    return 'web';
  }
}
