import { createBdd } from 'playwright-bdd';
import { test, expect } from '../../fixtures.js';

const { Given, When, Then } = createBdd(test);

Given('I navigate to {string}', async ({ driver }, url: string) => {
  await driver.navigateTo(url);
});

When(
  'I enter {string} as username and {string} as password',
  async ({ driver }, username: string, password: string) => {
    await driver.loadLocators('login');
    const usernameField = await driver.findElement('username_field');
    const passwordField = await driver.findElement('password_field');

    await usernameField.fill(username);
    await passwordField.fill(password);
  }
);

When('I click on the login button', async ({ driver }) => {
  const loginButton = await driver.findElement('login_button');
  await loginButton.click();
});

Then('I should see {string} in the flash message', async ({ driver }, expectedText: string) => {
  const flashMessage = await driver.findElement('flash_message');
  const actualText = await flashMessage.getText();
  expect(actualText).toContain(expectedText);
});
