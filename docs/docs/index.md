---
sidebar_position: 1
title: Introduction
---

# TAFLEX TS

**Enterprise Test Automation Framework in TypeScript**

---

## 🎯 What is TAFLEX TS?

TAFLEX TS is a **unified, enterprise-grade test automation framework** designed for testing Web, API, and Mobile applications using a single codebase. Migrated from the JavaScript version, it leverages **TypeScript** for superior developer experience, type safety, and maintainability.

### ✨ Key Highlights

| Feature | Description |
|---------|-------------|
| 🚀 **TypeScript First** | Fully typed API for better IDE support and catch errors at compile time. |
| 🧩 **Strategy Pattern** | Runtime driver resolution between platforms. |
| 📄 **Hierarchical Locators** | Cascading JSON inheritance model. |
| 🛡️ **Type-Safe Config** | Environment variables validated with **Zod**. |

---

## 💻 Code Example (TypeScript)

### Web Test

```typescript
import { test, expect } from '../fixtures';

test('should login successfully', async ({ driver }) => {
    await driver.navigateTo('https://the-internet.herokuapp.com/login');
    await driver.loadLocators('login');

    const username = await driver.findElement('username_field');
    const password = await driver.findElement('password_field');
    const loginButton = await driver.findElement('login_button');

    await username.fill('tomsmith');
    await password.fill('SuperSecretPassword!');
    await loginButton.click();

    const flashMessage = await driver.findElement('flash_message');
    expect(await flashMessage.getText()).toContain('You logged into a secure area!');
});
```
