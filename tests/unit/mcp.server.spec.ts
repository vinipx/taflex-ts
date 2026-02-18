import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';

describe('MCP Server Integration', () => {
  let serverProcess: ChildProcess;
  let serverStdout = '';
  let serverStderr = '';

  const sendMessage = (message: any) => {
    return new Promise<void>((resolve, reject) => {
      if (!serverProcess.stdin) {
        reject(new Error('Server stdin not available'));
        return;
      }
      const jsonString = JSON.stringify(message) + '\n';
      serverProcess.stdin.write(jsonString, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  };

  const waitForResponse = (id: number | string, timeout = 5000): Promise<any> => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkOutput = () => {
        const lines = serverStdout.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.id === id) {
              resolve(json);
              return;
            }
          } catch (e) {
            // Ignore non-JSON lines
          }
        }

        if (Date.now() - startTime > timeout) {
          reject(new Error(`Timeout waiting for response to ID ${id}`));
        } else {
          setTimeout(checkOutput, 100);
        }
      };

      checkOutput();
    });
  };

  beforeAll(async () => {
    const serverPath = path.resolve(__dirname, '../../src/mcp/server.ts');
    
    // Spawn the server process
    // Use ts-node/esm loader to run the TypeScript file directly with node resolution for extensions
    serverProcess = spawn('node', [
      '--no-warnings',
      '--loader', 'ts-node/esm',
      '--experimental-specifier-resolution=node',
      serverPath
    ], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '0' }
    });

    serverProcess.stdout?.on('data', (data) => {
      serverStdout += data.toString();
    });

    serverProcess.stderr?.on('data', (data) => {
      serverStderr += data.toString();
      // console.error(`MCP Server Error: ${data}`); 
    });
    
    // Wait a bit for the server to start
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  afterAll(() => {
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  it('should respond to initialize request', async () => {
    const initRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'test-client',
          version: '1.0.0'
        }
      }
    };

    await sendMessage(initRequest);
    const response = await waitForResponse(1);

    expect(response).toBeDefined();
    expect(response.result).toBeDefined();
    expect(response.result.serverInfo.name).toBe('taflex-ts-mcp-server');
  }, 10000);

  it('should list available tools', async () => {
    // Need to initialize first if strict, but let's see if we can just call tools/list
    // The MCP SDK usually requires initialization first.
    // We already initialized in the previous test, but since we are reusing the process, state is preserved.
    
    // Send initialized notification (required by spec after initialize response)
    await sendMessage({
      jsonrpc: '2.0',
      method: 'notifications/initialized'
    });

    const listToolsRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list'
    };

    await sendMessage(listToolsRequest);
    const response = await waitForResponse(2);

    expect(response).toBeDefined();
    expect(response.result).toBeDefined();
    expect(response.result.tools).toBeInstanceOf(Array);
    
    const toolNames = response.result.tools.map((t: any) => t.name);
    expect(toolNames).toContain('list_specs');
    expect(toolNames).toContain('list_locators');
    expect(toolNames).toContain('get_locator');
    expect(toolNames).toContain('run_test');
  });

  it('should list available resources', async () => {
    const listResourcesRequest = {
      jsonrpc: '2.0',
      id: 3,
      method: 'resources/list'
    };

    await sendMessage(listResourcesRequest);
    const response = await waitForResponse(3);

    expect(response).toBeDefined();
    expect(response.result).toBeDefined();
    expect(response.result.resources).toBeInstanceOf(Array);

    const resourceUris = response.result.resources.map((r: any) => r.uri);
    expect(resourceUris).toContain('taflex://config/current');
    expect(resourceUris).toContain('taflex://reports/latest');
  });

  it('should execute list_specs tool', async () => {
    const listSpecsRequest = {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'list_specs',
        arguments: {}
      }
    };

    await sendMessage(listSpecsRequest);
    const response = await waitForResponse(4);

    expect(response).toBeDefined();
    expect(response.result).toBeDefined();
    expect(response.result.content).toBeInstanceOf(Array);
    expect(response.result.content[0].type).toBe('text');
    
    const specs = JSON.parse(response.result.content[0].text);
    expect(specs).toBeInstanceOf(Array);
    expect(specs.length).toBeGreaterThan(0);
    expect(specs.some((s: string) => s.includes('login.spec.ts') || s.includes('users.axios.spec.ts'))).toBe(true);
  });

  it('should execute get_locator tool', async () => {
    const getLocatorRequest = {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'get_locator',
        arguments: {
          page: 'login',
          mode: 'web'
        }
      }
    };

    await sendMessage(getLocatorRequest);
    const response = await waitForResponse(5);

    expect(response).toBeDefined();
    expect(response.result).toBeDefined();
    expect(response.result.content).toBeInstanceOf(Array);
    expect(response.result.content[0].type).toBe('text');

    const locatorContent = JSON.parse(response.result.content[0].text);
    expect(locatorContent).toBeDefined();
    // basic check if it looks like a locator file
    expect(typeof locatorContent).toBe('object');
  });
});
