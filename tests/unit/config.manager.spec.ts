import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('dotenv', () => ({
  default: { config: vi.fn() },
}));

describe('ConfigManager', () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.EXECUTION_MODE;
    delete process.env.BROWSER;
    delete process.env.HEADLESS;
    delete process.env.BASE_URL;
    delete process.env.API_BASE_URL;
    delete process.env.TIMEOUT;

    process.env.EXECUTION_MODE = 'web';
    process.env.BROWSER = 'chromium';
  });

  it('should load default values when environment variables are missing', async () => {
    const { ConfigManager } = await import('../../src/config/config.manager.js');
    const config = new ConfigManager();

    expect(config.get('EXECUTION_MODE')).toBe('web');
    expect(config.get('HEADLESS')).toBe(true);
    expect(config.get('TIMEOUT')).toBe(30000);
  });

  it('should throw error on invalid configuration', async () => {
    process.env.EXECUTION_MODE = 'web';
    const { ConfigManager } = await import('../../src/config/config.manager.js');

    process.env.EXECUTION_MODE = 'invalid_mode' as any;
    expect(() => new ConfigManager()).toThrow('Invalid environment configuration');
  });
});
