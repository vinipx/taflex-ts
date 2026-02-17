import { remote } from 'webdriverio';
import { AutomationDriver } from '../automation.driver.js';
import { locatorManager } from '../../locators/locator.manager.js';
import { MobileElement } from '../../elements/mobile.element.js';
import { CapabilityBuilder } from '../../utils/capability.builder.js';

/**
 * Mobile automation driver implementation using WebdriverIO (Appium).
 */
export class WebdriverioMobileStrategy extends AutomationDriver {
  private client: any | null = null;

  async initialize(config: any): Promise<any> {
    let wdioConfig = config;

    if (config.CLOUD_PLATFORM && config.CLOUD_PLATFORM !== 'local') {
      wdioConfig = CapabilityBuilder.buildMobileConfig(config);
    }

    this.client = await remote(wdioConfig);
    locatorManager.load();
    return this.client;
  }

  async terminate(): Promise<void> {
    if (this.client) await this.client.deleteSession();
  }

  async navigateTo(activityOrUrl: string): Promise<void> {
    if (!this.client) throw new Error('Driver not initialized');
    await this.client.url(activityOrUrl);
  }

  async findElement(logicalName: string): Promise<MobileElement> {
    if (!this.client) throw new Error('Driver not initialized');
    const selector = locatorManager.resolve(logicalName);
    const element = await this.client.$(selector);
    return new MobileElement(element, logicalName);
  }

  async loadLocators(pageName: string): Promise<void> {
    locatorManager.load(pageName);
  }

  getExecutionMode(): string {
    return 'mobile';
  }

  async captureScreenshot(_name: string): Promise<string> {
    if (!this.client) throw new Error('Driver not initialized');
    const screenshot = await this.client.takeScreenshot();
    return screenshot;
  }
}
