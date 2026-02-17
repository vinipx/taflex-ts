/**
 * WebdriverIO implementation of the unified element wrapper for Mobile automation.
 */
export class MobileElement {
  constructor(
    public readonly element: WebdriverIO.Element,
    public readonly name: string
  ) {}

  async click(options: any = {}): Promise<void> {
    await this.element.click(options);
  }

  async fill(value: string | number): Promise<void> {
    await this.element.setValue(value);
  }

  async type(value: string | number): Promise<void> {
    await this.element.addValue(value);
  }

  async getText(): Promise<string> {
    return await this.element.getText();
  }

  async getValue(): Promise<string> {
    return (await this.element.getValue()) as string;
  }

  async isVisible(): Promise<boolean> {
    return await this.element.isDisplayed();
  }

  async isEnabled(): Promise<boolean> {
    return await this.element.isEnabled();
  }

  async waitFor(options: any = {}): Promise<void> {
    await this.element.waitForDisplayed(options);
  }

  async getAttribute(name: string): Promise<string | null> {
    return await this.element.getAttribute(name);
  }
}
