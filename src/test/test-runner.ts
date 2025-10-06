#!/usr/bin/env node
// Main test runner entry point
import { TestRunner } from '../scripts/test-runner';

async function main() {
  const runner = new TestRunner();
  await runner.run();
}

if (require.main === module) {
  main().catch(error => {
    console.error(`Test runner failed: ${error.message}`);
    process.exit(1);
  });
}
