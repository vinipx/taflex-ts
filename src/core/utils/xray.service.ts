import axios from 'axios';
import { configManager } from '../../config/config.manager.js';
import { logger } from './logger.js';

/**
 * Service class for interacting with Jira Xray Cloud API.
 */
export class XrayService {
  private readonly baseUrl: string = 'https://xray.cloud.getxray.app/api/v2';
  public token: string | null = null;

  /**
   * Authenticates with Xray using client credentials.
   */
  async authenticate(): Promise<string> {
    if (this.token) return this.token;

    const clientId = configManager.get('XRAY_CLIENT_ID');
    const clientSecret = configManager.get('XRAY_CLIENT_SECRET');

    try {
      const response = await axios.post(`${this.baseUrl}/authenticate`, {
        client_id: clientId,
        client_secret: clientSecret,
      });
      this.token = response.data;
      return this.token as string;
    } catch (error: any) {
      logger.error('Failed to authenticate with Xray:', error.message);
      throw error;
    }
  }

  /**
   * Imports a set of test execution results into Jira Xray.
   */
  async importExecution(results: any): Promise<any> {
    if (!configManager.get('XRAY_ENABLED')) {
      return;
    }

    const token = await this.authenticate();

    try {
      const response = await axios.post(`${this.baseUrl}/import/execution`, results, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      logger.info(`Results imported to Xray. Execution Key: ${response.data.key}`);
      return response.data;
    } catch (error: any) {
      logger.error('Failed to import execution to Xray:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Formats raw test results into the Xray JSON import format.
   */
  formatResults(testResults: any[]): any {
    const info: any = {
      summary: `Execution of automated tests - ${new Date().toISOString()}`,
      description: 'Imported from taflex-ts',
      testPlanKey: configManager.get('XRAY_TEST_PLAN_KEY'),
      testExecKey: configManager.get('XRAY_TEST_EXEC_KEY'),
      project: configManager.get('XRAY_PROJECT_KEY'),
    };

    if (configManager.get('XRAY_ENVIRONMENT')) {
      info.testEnvironments = [configManager.get('XRAY_ENVIRONMENT')];
    }

    // Clean up undefined fields
    Object.keys(info).forEach((key) => info[key] === undefined && delete info[key]);

    return {
      info,
      tests: testResults,
    };
  }
}

export const xrayService = new XrayService();
