import test from 'ava';

const { scan } = require('./main');

async function init() {
  const routes = await scan('example', ['handler', 'middleware']);
  test('routes exists', (t) => {
    if (routes) t.pass();
  });
  test('route /get/index.js', (t) => {
    if (routes.get) t.pass();
  });
  test('route /get/index.js handler exists', (t) => {
    if (routes.get.handler) t.pass();
  });
  test('route /get/index.js call handler', async (t) => {
    const result = await routes.get.handler();
    if (result === 'hi!') t.pass();
  });
  test('route /get/index.js middleware undefined', (t) => {
    if (!routes.get.middleware) t.pass();
  });
}

init();
