import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { AutomationDriver } from '../automation.driver.js';
import { locatorManager } from '../../locators/locator.manager.js';
import { logger } from '../../utils/logger.js';

/**
 * API automation driver implementation using Axios.
 */
export class AxiosApiStrategy extends AutomationDriver {
  private client: AxiosInstance | null = null;

  async initialize(config: any): Promise<AxiosInstance> {
    const { apiBaseUrl, timeout, headers } = config;
    logger.info(`Initializing Axios API Strategy with base URL: ${apiBaseUrl}`);

    this.client = axios.create({
      baseURL: apiBaseUrl,
      timeout: timeout || 30000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...headers,
      },
      validateStatus: () => true,
    });

    return this.client;
  }

  async terminate(): Promise<void> {
    this.client = null;
  }

  async navigateTo(_endpoint: string): Promise<void> {
    // API navigation is implicit
  }

  async findElement(_logicalName: string): Promise<never> {
    throw new Error('findElement() is not applicable for Axios API strategy');
  }

  async loadLocators(pageName: string): Promise<void> {
    locatorManager.load(pageName);
  }

  async get(endpoint: string, options: any = {}): Promise<any> {
    if (!this.client) throw new Error('Driver not initialized');
    logger.info(`Axios GET: ${endpoint}`);
    const response = await this.client.get(endpoint, options);
    return this._wrapResponse(response);
  }

  async post(endpoint: string, data: any = {}, options: any = {}): Promise<any> {
    if (!this.client) throw new Error('Driver not initialized');
    logger.info(`Axios POST: ${endpoint}`);
    const response = await this.client.post(endpoint, data, options);
    return this._wrapResponse(response);
  }

  async put(endpoint: string, data: any = {}, options: any = {}): Promise<any> {
    if (!this.client) throw new Error('Driver not initialized');
    logger.info(`Axios PUT: ${endpoint}`);
    const response = await this.client.put(endpoint, data, options);
    return this._wrapResponse(response);
  }

  async delete(endpoint: string, options: any = {}): Promise<any> {
    if (!this.client) throw new Error('Driver not initialized');
    logger.info(`Axios DELETE: ${endpoint}`);
    const response = await this.client.delete(endpoint, options);
    return this._wrapResponse(response);
  }

  private _wrapResponse(response: AxiosResponse) {
    return {
      status: () => response.status,
      ok: () => response.status >= 200 && response.status < 300,
      json: async () => response.data,
      headers: () => response.headers,
      text: async () =>
        typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
      raw: response,
    };
  }

  getExecutionMode(): string {
    return 'api';
  }

  async captureScreenshot(_name: string): Promise<never> {
    throw new Error('captureScreenshot() is not applicable for API strategy');
  }
}
