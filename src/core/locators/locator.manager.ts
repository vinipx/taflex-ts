import fs from 'fs';
import path from 'path';
import { configManager } from '../../config/config.manager.js';

/**
 * Manages hierarchical locators using a cascading inheritance model.
 */
export class LocatorManager {
  private locators: Record<string, string> = {};
  private readonly basePath: string;
  private readonly currentMode: string;
  public currentPage: string | null = null;

  constructor() {
    this.basePath = path.resolve(process.cwd(), 'src/resources/locators');
    this.currentMode = configManager.get('EXECUTION_MODE');
  }

  /**
   * Loads and merges locators for the current execution mode and an optional specific page.
   */
  load(pageName: string | null = null): void {
    this.currentPage = pageName;

    const globalLocators = this._readJson('global.json');
    const modeLocators = this._readJson(path.join(this.currentMode, 'common.json'));

    let pageLocators = {};
    if (pageName) {
      pageLocators = this._readJson(path.join(this.currentMode, `${pageName}.json`));
    }

    this.locators = {
      ...globalLocators,
      ...modeLocators,
      ...pageLocators,
    };
  }

  /**
   * Resolves a logical name to its underlying selector string.
   */
  resolve(logicalName: string): string {
    return this.locators[logicalName] || logicalName;
  }

  private _readJson(relativePath: string): Record<string, string> {
    const filePath = path.join(this.basePath, relativePath);
    if (fs.existsSync(filePath)) {
      try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      } catch (error: any) {
        console.warn(`⚠️ Failed to parse locator file: ${filePath}. Error: ${error.message}`);
      }
    }
    return {};
  }
}

export const locatorManager = new LocatorManager();
