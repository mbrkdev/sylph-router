const { scan } = require('./main');

(async () => {
  const routes = await scan('example', ['handler', 'middleware']);
  console.log(routes);
})();
