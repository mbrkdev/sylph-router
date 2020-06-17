# Sylph Router

A small single-pass recursive directory scanner that extracts and returns exports you specify as an object with keys being based on folder structure. See [Getting Started](#getting-started) for more information.

Originally built to be consumed by [Sylph](https://github.com/jetdevuk/sylph), a rapid express-based API framework. 

Since the creation of the Sylph Router it has shown to be extremely useful in many different scenarios, version 2.0 was built in order to facilitate more general use cases going forwards.

## Getting Started

To install:

```bash
# With Yarn

yarn add sylph-router

# Or with NPM

npm i sylph-router
```

Next in order to scan a folder for modules and extract the `handler` export:

```js
// TypeScript

import { scan, ScanResults } from 'sylph-router';

async function runScan() {
  const results: ScanResults = await scan('./directory', ['handler']);
  console.log(results);
}

```

```js
// JavaScript

const { scan } = require('sylph-router');

async function runScan() {
  const results = await scan('./directory', ['handler']);
  console.log(results);
}
runScan()

```

```ts
// Deno

import { scan, ScanResults } from 
  'https://raw.githubusercontent.com/jetdevuk/sylph-router/master/deno.ts';

const results: ScanResults = await scan('./directory', ['handler']);
console.log(results);

```