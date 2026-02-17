import { request, APIRequestContext, APIResponse } from '@playwright/test';
import { AutomationDriver } from '../automation.driver.js';
import { locatorManager } from '../../locators/locator.manager.js';
import { logger } from '../../utils/logger.js';

/**
 * API automation driver implementation using Playwright's APIRequestContext.
 */
export class PlaywrightApiStrategy extends AutomationDriver {
  private requestContext: APIRequestContext | null = null;

  async initialize(config: any): Promise<APIRequestContext> {
    const { apiBaseUrl } = config;
    logger.info(`Initializing Playwright API Strategy with base URL: ${apiBaseUrl}`);
    this.requestContext = await request.newContext({
      baseURL: apiBaseUrl,
      extraHTTPHeaders: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    return this.requestContext;
  }

  async terminate(): Promise<void> {
    if (this.requestContext) await this.requestContext.dispose();
  }

  async navigateTo(_endpoint: string): Promise<void> {
    // API navigation is implicit in request methods
  }

  async findElement(_logicalName: string): Promise<never> {
    throw new Error('findElement() is not applicable for API strategy');
  }

  async loadLocators(pageName: string): Promise<void> {
    locatorManager.load(pageName);
  }

  async get(endpoint: string, options: any = {}): Promise<APIResponse> {
    if (!this.requestContext) throw new Error('Driver not initialized');
    logger.info(`Playwright GET: ${endpoint}`);
    return await this.requestContext.get(endpoint, options);
  }

  async post(endpoint: string, options: any = {}): Promise<APIResponse> {
    if (!this.requestContext) throw new Error('Driver not initialized');
    logger.info(`Playwright POST: ${endpoint}`);
    return await this.requestContext.post(endpoint, options);
  }

  async put(endpoint: string, options: any = {}): Promise<APIResponse> {
    if (!this.requestContext) throw new Error('Driver not initialized');
    logger.info(`Playwright PUT: ${endpoint}`);
    return await this.requestContext.put(endpoint, options);
  }

  async delete(endpoint: string, options: any = {}): Promise<APIResponse> {
    if (!this.requestContext) throw new Error('Driver not initialized');
    logger.info(`Playwright DELETE: ${endpoint}`);
    return await this.requestContext.delete(endpoint, options);
  }

  getExecutionMode(): string {
    return 'api';
  }

  async captureScreenshot(_name: string): Promise<never> {
    throw new Error('captureScreenshot() is not applicable for API strategy');
  }
}
