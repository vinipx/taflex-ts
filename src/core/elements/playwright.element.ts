import { Locator } from '@playwright/test';
import { logger } from '../utils/logger.js';

/**
 * Playwright implementation of the unified element wrapper.
 */
export class PlaywrightElement {
  constructor(public readonly locator: Locator, public readonly name: string) {}

  async click(options: any = {}): Promise<void> {
    logger.info(`Clicking on: ${this.name}`);
    await this.locator.click(options);
  }

  async fill(value: string, options: any = {}): Promise<void> {
    logger.info(`Filling ${this.name} with: ${value}`);
    await this.locator.fill(value, options);
  }

  async type(value: string, options: any = {}): Promise<void> {
    logger.info(`Typing ${value} into: ${this.name}`);
    await this.locator.type(value, options);
  }

  async getText(): Promise<string> {
    return await this.locator.innerText();
  }

  async getValue(): Promise<string> {
    return await this.locator.inputValue();
  }

  async isVisible(): Promise<boolean> {
    return await this.locator.isVisible();
  }

  async isEnabled(): Promise<boolean> {
    return await this.locator.isEnabled();
  }

  async waitFor(options: any = {}): Promise<void> {
    logger.info(`Waiting for element: ${this.name}`);
    await this.locator.waitFor(options);
  }

  async getAttribute(name: string): Promise<string | null> {
    return await this.locator.getAttribute(name);
  }
}
