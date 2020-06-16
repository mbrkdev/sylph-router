// import test from 'ava';

// const { scan } = require('./main');

// async function init() {
//   const routes = await scan('example', ['handler', 'middleware']);
//   test('routes exists', (t) => {
//     if (routes) t.pass();
//   });
//   test('route /get/index.js', (t) => {
//     if (routes['/']) t.pass();
//   });
//   test('route /get/index.js handler exists', (t) => {
//     if (routes['/'].handler) t.pass();
//   });
//   test('route /get/index.js call handler', async (t) => {
//     const result = await routes['/'].handler();
//     if (result === 'hi!') t.pass();
//   });
//   test('route /get/index.js middleware undefined', (t) => {
//     if (!routes['/'].middleware) t.pass();
//   });
//   test('post route user/create exists', (t) => {
//     if (routes['user/create']) t.pass();
//   });
//   test('post route user/create handler exists', (t) => {
//     if (routes['user/create'].handler) t.pass();
//   });
//   test('post route user/create type === post', (t) => {
//     if (routes['user/create'].type === 'post') t.pass();
//   });
// }

// init();
import { scan, ScanResults } from '../dist/main';

describe('Scan for existing folder', () => {
  let routes: string[];
  beforeAll(async () => {
    const scanResults: ScanResults = await scan('./example', ['handler'], {
      directoryBanlist: ['banned'],
    });
    routes = scanResults.routes.map((r) => r.replace('\\', '/'));
  });

  test('available valid routes are more than one', async () => {
    expect(routes.length >= 1).toBe(true);
  });

  test('valid route exists', async () => {
    expect(routes.indexOf('get/index.js')).not.toBe(-1);
  });

  test('banned folder should not produce any results', async () => {
    expect(routes.indexOf('banned/banned.js')).toBe(-1);
  });

  test('banned folder should not produce any subfolder results', async () => {
    expect(routes.indexOf('banned/sub-banned/also-banned.js')).toBe(-1);
  });
});

describe('Scan with replacer function', () => {
  let routes: string[];
  beforeAll(async () => {
    const scanResults: ScanResults = await scan('./example', ['handler'], {
      directoryBanlist: ['banned'],
      replaceFunction: (route: string) => {
        return route.replace(/\//g, '-').replace(/.[t|j]s$/, '');
      },
    });
    routes = scanResults.routes.map((r) => r.replace('\\', '/'));
  });

  test('route replaces / with - and omits .js', async () => {
    expect(routes.indexOf('get-index')).not.toBe(-1);
  });

  test('route replaces / with - and omits .ts', async () => {
    expect(routes.indexOf('get-indexts')).not.toBe(-1);
  });
});

describe('Scan for non-existant folder', () => {
  let scanResults: ScanResults;
  beforeAll(async () => {
    scanResults = await scan('./thisFolderDoesNotExist', ['handler']);
  });

  test('available valid routes are zero', async () => {
    const { routes } = scanResults;
    expect(routes.length >= 1).not.toBe(true);
  });
});
