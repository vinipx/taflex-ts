import { xrayService } from '../utils/xray.service.js';
import { configManager } from '../../config/config.manager.js';
import { FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter';

/**
 * Custom Playwright reporter that exports test results to Jira Xray.
 */
class XrayReporter implements Reporter {
  private results: any[] = [];
  private readonly enabled: boolean;

  constructor() {
    this.enabled = configManager.get('XRAY_ENABLED');
  }

  onTestEnd(test: TestCase, result: TestResult) {
    if (!this.enabled) return;

    const xrayKey = this.extractXrayKey(test);
    if (!xrayKey) return;

    this.results.push({
      testKey: xrayKey,
      start: new Date(result.startTime).toISOString(),
      finish: new Date(new Date(result.startTime).getTime() + result.duration).toISOString(),
      status: this.mapStatus(result.status),
      comment: result.error ? result.error.message : undefined,
    });
  }

  async onEnd(_result: FullResult) {
    if (!this.enabled || this.results.length === 0) {
      if (this.enabled) {
        console.info('Xray: No tests with Xray keys found. Skipping upload.');
      }
      return;
    }

    const formattedResults = xrayService.formatResults(this.results);
    try {
      await xrayService.importExecution(formattedResults);
    } catch (error: any) {
      console.error('Xray: Failed to upload results:', error.message);
    }
  }

  private extractXrayKey(test: TestCase): string | null {
    const tagMatch = test.annotations?.find(
      (a) =>
        a.type === 'tag' &&
        (a.description?.match(/^[A-Z]+-\d+$/) || a.description?.match(/^@?[A-Z]+-\d+$/))
    );
    if (tagMatch && tagMatch.description) return tagMatch.description.replace(/^@/, '');

    const titleMatch = test.title.match(/([A-Z]+-\d+)/);
    return titleMatch ? titleMatch[1] : null;
  }

  private mapStatus(playwrightStatus: string): string {
    switch (playwrightStatus) {
      case 'passed':
        return 'PASSED';
      case 'failed':
      case 'timedOut':
        return 'FAILED';
      case 'skipped':
        return 'TODO';
      default:
        return 'FAILED';
    }
  }
}

export default XrayReporter;
