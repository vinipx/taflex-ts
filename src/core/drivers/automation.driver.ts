/**
 * Base class for all automation drivers in the TAFLEX TS framework.
 */
export abstract class AutomationDriver {
  /**
   * Initializes the driver with the provided configuration.
   */
  abstract initialize(config: any): Promise<any>;

  /**
   * Terminates the driver session and performs cleanup.
   */
  abstract terminate(): Promise<void>;

  /**
   * Navigates to a specific URL or activity.
   */
  abstract navigateTo(url: string): Promise<void>;

  /**
   * Finds an element using its logical name resolved through the LocatorManager.
   */
  abstract findElement(logicalName: string): Promise<any>;

  /**
   * Loads locators for a specific page or feature.
   */
  abstract loadLocators(pageName: string): Promise<void>;

  /**
   * Gets the current execution mode of the driver.
   */
  abstract getExecutionMode(): string;

  /**
   * Captures a screenshot.
   */
  abstract captureScreenshot(name: string): Promise<Buffer | string>;
}
