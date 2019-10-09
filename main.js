const readdirp = require('readdirp');
const path = require('path');

function replace(path) {
  return path
  .replace(/\\/gi, '/') // Backslash to forward slash
  .replace(/\/$/gi, '') // Remove ending slash (for xx/index)
  .replace(/ /gi, '-') // Spaces to dashes
  .replace('index.js', '.js') // Change index to just .js
  .replace(/\.js/g, '') // Change index to just .js
  .replace(/_/gi, ':') // Underscore to colon (for dynamic routes)
  .replace(/\/$/gi, '') // Remove ending slash (for xx/index)
}

async function scan(root, imports, options) {
  let routes = {}
  let replaceFunction = options && options.replace || replace;
  
  const r = await readdirp.promise(root, {
    fileFilter: '*.js',
    directoryFilter: ['!public', '!*utils'],
  });
  r.map((route) => {
    const routePath = replaceFunction(route.path)
    const _r = {}
    for (let i = 0; i < imports.length; i++) {
      const imp = require(path.resolve(root, route.path))[imports[i]]
      _r[imports[i]] = imp
    }
    routes[routePath] = _r;
  });
  return routes;
}

module.exports = {
  scan
}