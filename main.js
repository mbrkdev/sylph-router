const readdirp = require('readdirp');
const path = require('path');

function replace(route) {
  return route
    .replace(/\\/gi, '/') // Backslash to forward slash
    .replace(/\/$/gi, '') // Remove ending slash (for xx/index)
    .replace(/ /gi, '-') // Spaces to dashes
    .replace('index.js', '.js') // Change index to just .js
    .replace(/\.js/g, '') // Change index to just .js
    .replace(/_/gi, ':') // Underscore to colon (for dynamic routes)
    .replace(/\/$/gi, ''); // Remove ending slash (for xx/index)
}

async function scan(root, imports, options) {
  const routes = {};
  const replaceFunction = options ? options.replace : replace;

  const r = await readdirp.promise(root, {
    fileFilter: '*.js',
    directoryFilter: options ? options.filter : ['!public', '!*utils'],
  });
  for (let y = 0; y < r.length; y += 1) {
    const route = r[y];
    const routePath = replaceFunction(route.path);
    const routeObject = {};
    for (let i = 0; i < imports.length; i += 1) {
      const imp = require(path.resolve(root, route.path))[imports[i]]; //eslint-disable-line
      routeObject[imports[i]] = imp;
    }
    routes[routePath] = routeObject;
  }
  return routes;
}

module.exports = {
  scan,
};
