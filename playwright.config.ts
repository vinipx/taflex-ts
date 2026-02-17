import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { configManager } from './src/config/config.manager.js';

const testDir = defineBddConfig({
  features: 'tests/bdd/features/*.feature',
  steps: ['tests/bdd/steps/*.ts', 'tests/fixtures.ts'],
});

const reporters: any[] = [];

configManager.get('REPORTERS').forEach((reporter) => {
  if (reporter === 'html') {
    reporters.push(['html']);
    reporters.push(['json', { outputFile: 'playwright-report/results.json' }]);
  } else if (reporter === 'allure') {
    reporters.push([
      'allure-playwright',
      { outputFolder: configManager.get('ALLURE_RESULTS_DIR') },
    ]);
  } else if (reporter === 'reportportal') {
    reporters.push([
      '@reportportal/agent-js-playwright',
      {
        endpoint: configManager.get('RP_ENDPOINT'),
        apiKey: configManager.get('RP_API_KEY'),
        project: configManager.get('RP_PROJECT'),
        launch: configManager.get('RP_LAUNCH'),
        attributes: configManager.get('RP_ATTRIBUTES'),
        description: configManager.get('RP_DESCRIPTION'),
      },
    ]);
  } else if (reporter === 'xray') {
    reporters.push(['./src/core/reporters/xray.reporter.js']);
  }
});

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: reporters.length > 0 ? reporters : [['list']],
  use: {
    baseURL: configManager.get('BASE_URL') || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      testDir: './tests',
      testIgnore: ['tests/unit/**', 'tests/contract/**', '**/*.axios.spec.ts', 'tests/bdd/**'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'bdd',
      testDir: testDir,
    },
  ],
});
