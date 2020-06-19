import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';
import {scan, ScanResults} from '../deno.ts'

const results: ScanResults = await scan('./example', ['handler'], {
  fileFilter: [/.js$/, /[\/|\\]banned[\/|\\]/]
})

Deno.test("results return", async () => {
  assertEquals(!!results, true);
});

Deno.test("results return handler", async () => {
  const handler = results['example/get/real.ts'].handler
  const includesHandler = !!handler
  assertEquals(includesHandler, true);
});
  
Deno.test("results handler returns expected value", async () => {
  const handler = results['example/get/real.ts'].handler
  assertEquals(handler() === 'handler', true);
});

Deno.test("banned directory (via fileFilter) not in result", async () => {
  assertEquals(!results['example/banned/sub-banned/real.ts'], true);
});

Deno.test("banned directory (via directoryBanlist) not in result", async () => {
  const r: ScanResults = await scan('./example', ['handler'], {
    directoryBanlist: ['banned']
  })
  assertEquals(!r['example/banned/sub-banned/real.ts'], true);
});

