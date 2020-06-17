import { scan, ScanResults } from '../dist/main';

describe('Scan for existing folder', () => {
  let scanResults: ScanResults;
  beforeAll(async () => {
    scanResults = await scan('./example', ['handler'], {
      directoryBanlist: ['banned'],
    });
  });

  test('available valid routes are more than one', async () => {
    expect(Object.keys(scanResults).length >= 1).toBe(true);
  });

  test('valid route exists', async () => {
    expect(Object.keys(scanResults).indexOf('get/index.js')).not.toBe(-1);
  });

  test('banned folder should not produce any results', async () => {
    expect(Object.keys(scanResults).indexOf('banned/banned.js')).toBe(-1);
  });

  test('banned folder should not produce any subfolder results', async () => {
    expect(Object.keys(scanResults).indexOf('banned/sub-banned/also-banned.js')).toBe(-1);
  });
});

describe('Scan with replacer function', () => {
  let scanResults: ScanResults;
  beforeAll(async () => {
    scanResults = await scan('./example', ['handler'], {
      directoryBanlist: ['banned'],
      replaceFunction: (route: string) => {
        return route.replace(/\//g, '-').replace(/.[t|j]s$/, '');
      },
    });
  });

  test('route replaces / with - and omits .js', async () => {
    expect(scanResults['get-index']).not.toBe(undefined);
  });

  test('route replaces / with - and omits .ts', async () => {
    expect(scanResults['get-indexts']).not.toBe(undefined);
  });

  test('route handler available on replaced route', async () => {
    const handler: () => unknown = scanResults['get-index'].handler;
    expect(handler).not.toBe(undefined);
  });

  test('route handler available can be run', async () => {
    const handler: () => string = scanResults['get-index'].handler;
    const result: string = await handler();
    expect(result).toBe('hi!');
  });

  test('valid route with no handler is undefined', async () => {
    const handler: () => unknown = scanResults['get-indexts'].handler;
    expect(handler).toBe(undefined);
  });
});

describe('Multiple exported handlers', () => {
  let scanResults: ScanResults;
  beforeAll(async () => {
    scanResults = await scan('./example', ['handler', 'secondHandler', 'echoHandler'], {
      directoryBanlist: ['banned'],
    });
  });

  test('primary handler exists', async () => {
    const handler: () => unknown = scanResults['get/index.js'].handler;
    expect(handler).not.toBe(undefined);
  });

  test('primary handler can be run', async () => {
    const handler: () => string = scanResults['get/index.js'].handler;
    const result: string = await handler();
    expect(result).toBe('hi!');
  });

  test('secondary handler exists', async () => {
    const handler: () => unknown = scanResults['get/index.js'].secondHandler;
    expect(handler).not.toBe(undefined);
  });

  test('secondary handler can be run', async () => {
    const handler: () => string = scanResults['get/index.js'].secondHandler;
    const result: string = await handler();
    expect(result).toBe('bye!');
  });

  test('echo handler exists', async () => {
    const handler: () => unknown = scanResults['get/index.js'].handler;
    expect(handler).not.toBe(undefined);
  });

  test('echo handler works perfectly', async () => {
    const handler: (val: string) => string = scanResults['get/index.js'].echoHandler;
    const result = await handler('echo');
    expect(result).toBe('echo!');
  });
});

describe('Scan for non-existant folder', () => {
  let scanResults: ScanResults;
  beforeAll(async () => {
    scanResults = await scan('./thisFolderDoesNotExist', ['handler']);
  });

  test('available valid routes are zero', async () => {
    expect(Object.keys(scanResults).length >= 1).toBe(false);
  });
});

describe('Scan with complex replacer function', () => {
  let scanResults: ScanResults;
  beforeAll(async () => {
    scanResults = await scan('./example', ['handler'], {
      replaceFunction: (route: string) => {
        return route
          .replace(/\\/gi, '/') // Backslash to forward slash
          .replace(/\/$/gi, '') // Remove ending slash (for xx/index)
          .replace(/ /gi, '-') // Spaces to dashes
          .replace(/index.([t|j])s/, '.$1s') // Change index to just .t/js
          .replace(/\.[t|j]s/g, '') // Remove .t/js
          .replace(/_/gi, ':') // Underscore to colon (for dynamic routes)
          .replace(/\/$/gi, '') // Remove ending slash (for xx/index));
          .replace(/^(\w+)$/, '$1/'); // replace xxx/index with xxx/
      },
    });
  });

  test('available route /get/index.js becomes /', async () => {
    expect(!!scanResults['get/']).toBe(true);
  });

  test('available route /get/indexts.ts becomes get/indexts', async () => {
    expect(!!scanResults['get/indexts']).toBe(true);
  });
});
