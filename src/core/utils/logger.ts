import pino from 'pino';
import { ReportingApi } from '@reportportal/agent-js-playwright';
import * as allure from 'allure-js-commons';

const pinoLogger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      sync: true,
    },
  },
});

/**
 * Unified logger utility.
 */
export const logger = {
  info: (message: string, ...args: any[]) => {
    pinoLogger.info(message, ...args);
    try {
      ReportingApi.info(message);
      allure.logStep(message, 'passed' as any);
    } catch {
      // Silently ignore if reporting APIs are not available
    }
    if (process.env.TEST_WORKER_INDEX) console.info(`INFO: ${message}`);
  },

  debug: (message: string, ...args: any[]) => {
    pinoLogger.debug(message, ...args);
    try {
      ReportingApi.debug(message);
    } catch {
      // ignore
    }
    if (process.env.TEST_WORKER_INDEX) console.info(`DEBUG: ${message}`);
  },

  warn: (message: string, ...args: any[]) => {
    pinoLogger.warn(message, ...args);
    try {
      ReportingApi.warn(message);
      allure.logStep(`WARN: ${message}`, 'broken' as any);
    } catch {
      // ignore
    }
    if (process.env.TEST_WORKER_INDEX) console.warn(`WARN: ${message}`);
  },

  error: (message: string, ...args: any[]) => {
    pinoLogger.error(message, ...args);
    try {
      ReportingApi.error(message);
      allure.logStep(`ERROR: ${message}`, 'failed' as any);
    } catch {
      // ignore
    }
    if (process.env.TEST_WORKER_INDEX) console.error(`ERROR: ${message}`);
  },

  trace: (message: string, ...args: any[]) => {
    pinoLogger.trace(message, ...args);
    try {
      ReportingApi.trace(message);
    } catch {
      // ignore
    }
    if (process.env.TEST_WORKER_INDEX) console.info(`TRACE: ${message}`);
  },

  screenshot: (name: string, buffer: Buffer) => {
    try {
      // ReportPortal
      ReportingApi.info(name, {
        name,
        type: 'image/png',
        content: buffer.toString('base64'),
      });

      // Allure
      allure.attachment(name, buffer, 'image/png');
    } catch {
      // ignore
    }
  },
};
