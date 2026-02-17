import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { configManager } from '../config/config.manager.js';
import { promises as fs } from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../');

/**
 * TaflexMcpServer implements the Model Context Protocol (MCP).
 */
class TaflexMcpServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'taflex-ts-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.setupHandlers();

    this.server.onerror = (error) => console.error('[MCP Error]', error);

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupHandlers() {
    this.setupResourceHandlers();
    this.setupToolHandlers();
  }

  private setupResourceHandlers() {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'taflex://config/current',
          name: 'Current Framework Configuration',
          mimeType: 'application/json',
          description: 'Returns the currently active configuration (secrets masked)',
        },
        {
          uri: 'taflex://reports/latest',
          name: 'Latest Test Report Summary',
          mimeType: 'application/json',
          description: "Summary of the most recent test execution (requires 'json' reporter)",
        },
      ],
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      if (request.params.uri === 'taflex://config/current') {
        const config = { ...configManager.config };
        const secrets: (keyof typeof config)[] = [
          'CLOUD_KEY',
          'RP_API_KEY',
          'XRAY_CLIENT_SECRET',
          'PACT_BROKER_TOKEN',
        ];
        secrets.forEach((key) => {
          if (config[key]) (config as any)[key] = '****';
        });

        return {
          contents: [
            {
              uri: request.params.uri,
              mimeType: 'application/json',
              text: JSON.stringify(config, null, 2),
            },
          ],
        };
      }

      if (request.params.uri === 'taflex://reports/latest') {
        try {
          const reportPath = path.join(ROOT_DIR, 'playwright-report', 'results.json');
          const data = await fs.readFile(reportPath, 'utf-8');
          return {
            contents: [
              {
                uri: request.params.uri,
                mimeType: 'application/json',
                text: data,
              },
            ],
          };
        } catch {
          throw new McpError(
            ErrorCode.InternalError,
            "Latest report not found. Ensure 'json' reporter is enabled and tests have been run."
          );
        }
      }

      throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${request.params.uri}`);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'list_specs',
          description: 'List all available test specification files in the tests/ directory.',
          inputSchema: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['web', 'api', 'unit', 'contract', 'bdd'],
                description: 'Filter by test sub-directory',
              },
            },
          },
        },
        {
          name: 'get_locator',
          description: 'Retrieve the content of a specific locator JSON file.',
          inputSchema: {
            type: 'object',
            properties: {
              page: {
                type: 'string',
                description: "Name of the page/component (e.g., 'login')",
              },
              mode: {
                type: 'string',
                enum: ['web', 'mobile'],
                default: 'web',
                description: 'The automation mode',
              },
            },
            required: ['page'],
          },
        },
        {
          name: 'list_locators',
          description: 'List all available locator files for a given mode.',
          inputSchema: {
            type: 'object',
            properties: {
              mode: {
                type: 'string',
                enum: ['web', 'mobile'],
                default: 'web',
              },
            },
          },
        },
        {
          name: 'run_test',
          description: "Execute a specific test file using the framework's test runner.",
          inputSchema: {
            type: 'object',
            properties: {
              specPath: {
                type: 'string',
                description: 'Path to the spec file relative to project root',
              },
              project: {
                type: 'string',
                enum: ['chromium', 'firefox', 'webkit', 'api', 'bdd'],
                description: 'The Playwright project/configuration to use',
              },
              headed: {
                type: 'boolean',
                description: 'Whether to run the browser in headed mode',
                default: false,
              },
            },
            required: ['specPath'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'list_specs':
          return await this.handleListSpecs(request.params.arguments);
        case 'get_locator':
          return await this.handleGetLocator(request.params.arguments);
        case 'list_locators':
          return await this.handleListLocators(request.params.arguments);
        case 'run_test':
          return await this.handleRunTest(request.params.arguments);
        default:
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
      }
    });
  }

  private async handleListSpecs(args: any) {
    const testDir = path.join(ROOT_DIR, 'tests');
    const subDir = args?.type ? path.join(testDir, args.type) : testDir;

    try {
      const files = await this.getFilesRecursively(subDir);
      const specs = files.filter((f) => f.endsWith('.spec.ts') || f.endsWith('.feature'));
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              specs.map((f) => path.relative(ROOT_DIR, f)),
              null,
              2
            ),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [{ type: 'text', text: `Error listing specs: ${error.message}` }],
        isError: true,
      };
    }
  }

  private async handleGetLocator(args: any) {
    const { page, mode = 'web' } = args;
    const locatorPath = path.join(ROOT_DIR, 'src', 'resources', 'locators', mode, `${page}.json`);

    try {
      const content = await fs.readFile(locatorPath, 'utf-8');
      return {
        content: [{ type: 'text', text: content }],
      };
    } catch {
      return {
        content: [{ type: 'text', text: `Locator not found for page '${page}' in mode '${mode}'` }],
        isError: true,
      };
    }
  }

  private async handleListLocators(args: any) {
    const { mode = 'web' } = args || {};
    const locatorsDir = path.join(ROOT_DIR, 'src', 'resources', 'locators', mode);

    try {
      const files = await fs.readdir(locatorsDir);
      const locators = files.filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''));
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(locators, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          { type: 'text', text: `Error listing locators for mode '${mode}': ${error.message}` },
        ],
        isError: true,
      };
    }
  }

  private async handleRunTest(args: any) {
    const { specPath, project, headed = false } = args;

    return new Promise<any>((resolve) => {
      const cmdArgs = ['playwright', 'test', specPath];
      if (project) {
        cmdArgs.push('--project', project);
      }
      if (headed) {
        cmdArgs.push('--headed');
      }

      const child = spawn('npx', cmdArgs, {
        cwd: ROOT_DIR,
        env: { ...process.env, FORCE_COLOR: '0' },
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => (stdout += data));
      child.stderr.on('data', (data) => (stderr += data));

      child.on('close', (code) => {
        resolve({
          content: [
            {
              type: 'text',
              text: `Exit Code: ${code}

STDOUT:
${stdout}

STDERR:
${stderr}`,
            },
          ],
          isError: code !== 0,
        });
      });
    });
  }

  private async getFilesRecursively(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries.map((entry) => {
        const res = path.resolve(dir, entry.name);
        return entry.isDirectory() ? this.getFilesRecursively(res) : res;
      })
    );
    return Array.prototype.concat(...files);
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Taflex TS MCP Server running on stdio');
  }
}

const server = new TaflexMcpServer();
server.run().catch(console.error);
