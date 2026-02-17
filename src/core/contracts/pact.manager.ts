import { PactV3 } from '@pact-foundation/pact';
import path from 'path';
import { configManager } from '../../config/config.manager.js';

/**
 * Manages Pact contract testing lifecycle and interactions.
 */
export class PactManager {
  public readonly enabled: boolean;
  private pact: PactV3 | null = null;

  constructor() {
    this.enabled = configManager.get('PACT_ENABLED');
  }

  /**
   * Sets up a new PactV3 instance for a consumer-provider pair.
   */
  setup(
    consumer: string = configManager.get('PACT_CONSUMER'),
    provider: string = configManager.get('PACT_PROVIDER')
  ): PactV3 | null {
    if (!this.enabled) return null;

    this.pact = new PactV3({
      consumer,
      provider,
      dir: path.resolve(process.cwd(), 'pacts'),
      logLevel: configManager.get('PACT_LOG_LEVEL'),
    });

    return this.pact;
  }

  /**
   * Adds an interaction to the current Pact contract.
   */
  async addInteraction(interaction: any): Promise<void> {
    if (!this.enabled || !this.pact) return;
    this.pact.addInteraction(interaction);
  }

  /**
   * Executes a test function within the Pact context.
   */
  async executeTest(testFn: (mockServer: any) => Promise<any>): Promise<any> {
    if (!this.enabled || !this.pact) {
      return testFn({ url: '' });
    }
    return this.pact.executeTest(testFn);
  }
}

export const pactManager = new PactManager();
