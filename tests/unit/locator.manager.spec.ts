import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import { LocatorManager } from '../../src/core/locators/locator.manager.js';

vi.mock('fs');
vi.mock('../../src/config/config.manager.js', () => ({
  configManager: {
    get: vi.fn().mockReturnValue('web'),
  },
}));

describe('LocatorManager', () => {
  let locatorManager: LocatorManager;

  beforeEach(() => {
    vi.clearAllMocks();
    locatorManager = new LocatorManager();
  });

  it('should resolve logical names from loaded locators', () => {
    (fs.existsSync as any).mockImplementation((p: string) => p.includes('global.json'));
    (fs.readFileSync as any).mockReturnValue(JSON.stringify({ btn_login: '#login' }));

    locatorManager.load();

    expect(locatorManager.resolve('btn_login')).toBe('#login');
  });

  it('should return the logical name if no locator is found', () => {
    (fs.existsSync as any).mockReturnValue(false);
    locatorManager.load();
    expect(locatorManager.resolve('unknown')).toBe('unknown');
  });
});
