/**
 * Jest setup for polyfills and global mocks
 * This runs before setupTests.ts
 */

// Polyfill fetch for older Node.js environments
import 'whatwg-fetch';
import fetchMock from 'jest-fetch-mock';

// Enable fetch mocking
fetchMock.enableMocks();

// Mock AbortSignal.timeout for older Node.js versions
if (!global.AbortSignal.timeout) {
  global.AbortSignal.timeout = (delay: number) => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), delay);
    return controller.signal;
  };
}

// Mock console methods to reduce noise in tests
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock global fetch with proper Response interface
global.fetch = fetchMock as any;

// Ensure fetch mock creates proper Response objects
fetchMock.mockResponse = (body: string, init?: any) => {
  return Promise.resolve({
    ok: init?.status ? init.status < 400 : true,
    status: init?.status || 200,
    statusText: init?.statusText || 'OK',
    headers: new Headers(init?.headers || {}),
    json: () => Promise.resolve(JSON.parse(body)),
    text: () => Promise.resolve(body),
  } as Response);
};

// Add basic Response constructor if missing
if (!global.Response) {
  global.Response = class MockResponse {
    ok: boolean;
    status: number;
    statusText: string;
    headers: Headers;
    
    constructor(body?: any, init?: any) {
      this.ok = init?.status ? init.status < 400 : true;
      this.status = init?.status || 200;
      this.statusText = init?.statusText || 'OK';
      this.headers = new Headers(init?.headers || {});
    }
    
    async json() {
      return {};
    }
    
    async text() {
      return '';
    }
  } as any;
}