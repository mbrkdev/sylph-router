import test from 'ava';

const { scan } = require('./main');

async function init() {
  const routes = await scan('example', ['handler', 'middleware']);
  test('routes exists', (t) => {
    if (routes) t.pass();
  });
  test('route /get/index.js', (t) => {
    if (routes['/']) t.pass();
  });
  test('route /get/index.js handler exists', (t) => {
    if (routes['/'].handler) t.pass();
  });
  test('route /get/index.js call handler', async (t) => {
    const result = await routes['/'].handler();
    if (result === 'hi!') t.pass();
  });
  test('route /get/index.js middleware undefined', (t) => {
    if (!routes['/'].middleware) t.pass();
  });
  test('post route user/create exists', (t) => {
    if (routes['user/create']) t.pass();
  });
  test('post route user/create handler exists', (t) => {
    if (routes['user/create'].handler) t.pass();
  });
  test('post route user/create type === post', (t) => {
    if (routes['user/create'].type === 'post') t.pass();
  });
}

init();
