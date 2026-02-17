import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * Zod schema for environment variable validation and type-safety.
 */
const ConfigSchema = z.object({
  EXECUTION_MODE: z.enum(['web', 'api', 'mobile']).default('web'),
  BROWSER: z.enum(['chromium', 'firefox', 'webkit']).default('chromium'),
  HEADLESS: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(true),
  CLOUD_PLATFORM: z.enum(['local', 'browserstack', 'saucelabs']).default('local'),
  CLOUD_USER: z.string().optional(),
  CLOUD_KEY: z.string().optional(),
  BROWSER_VERSION: z.string().default('latest'),
  OS: z.string().optional(),
  OS_VERSION: z.string().optional(),
  REMOTE_URL: z.string().url().optional(),
  BASE_URL: z.preprocess(
    (val) => (val === '' || val === '/' ? undefined : val),
    z.string().url().optional()
  ),
  API_BASE_URL: z.preprocess(
    (val) => (val === '' || val === '/' ? undefined : val),
    z.string().url().optional()
  ),
  API_PROVIDER: z.enum(['playwright', 'axios']).default('playwright'),
  TIMEOUT: z.preprocess((val) => (typeof val === 'string' ? parseInt(val, 10) : val), z.number()).default(30000),
  REPORTERS: z
    .string()
    .default('html')
    .transform((val) => val.split(',').map((s) => s.trim())),
  ALLURE_RESULTS_DIR: z.string().default('allure-results'),
  RP_ENDPOINT: z.string().url().optional(),
  RP_API_KEY: z.string().optional(),
  RP_PROJECT: z.string().optional(),
  RP_LAUNCH: z.string().optional(),
  RP_ATTRIBUTES: z
    .string()
    .optional()
    .transform((val) =>
      val
        ? val.split(';').map((attr) => {
            const [key, value] = attr.split(':');
            return { key, value };
          })
        : []
    ),
  RP_DESCRIPTION: z.string().optional(),
  XRAY_ENABLED: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  XRAY_CLIENT_ID: z.string().optional(),
  XRAY_CLIENT_SECRET: z.string().optional(),
  XRAY_PROJECT_KEY: z.string().optional(),
  XRAY_TEST_PLAN_KEY: z.string().optional(),
  XRAY_TEST_EXEC_KEY: z.string().optional(),
  XRAY_ENVIRONMENT: z.string().optional(),
  PACT_ENABLED: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  PACT_BROKER_URL: z.string().url().optional(),
  PACT_BROKER_TOKEN: z.string().optional(),
  PACT_CONSUMER: z.string().default('taflex-consumer'),
  PACT_PROVIDER: z.string().default('taflex-provider'),
  PACT_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Config = z.infer<typeof ConfigSchema>;

/**
 * Manages framework configuration by loading, validating, and providing
 * access to environment variables.
 */
export class ConfigManager {
  public readonly config: Config;

  /**
   * Initializes the ConfigManager by parsing and validating environment variables.
   */
  constructor() {
    const result = ConfigSchema.safeParse(process.env);
    if (!result.success) {
      console.error('❌ Invalid configuration:', result.error.format());
      throw new Error('Invalid environment configuration');
    }
    this.config = result.data;
  }

  /**
   * Retrieves a configuration value by key.
   */
  get<K extends keyof Config>(key: K): Config[K] {
    return this.config[key];
  }
}

export const configManager = new ConfigManager();
