#!/usr/bin/env node
// Test Runner for JOHNNY RAM Programs with comprehensive testing capabilities
import * as fs from 'fs';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const chalk = require('chalk');
import { TestFramework } from '../testing/framework';
import { TestCase } from '../types';

export class TestRunner {
  private framework: TestFramework;

  constructor() {
    this.framework = new TestFramework();
  }

  /**
   * Main entry point
   */
  async run(): Promise<void> {
    console.log(chalk.blue('🧪 JOHNNY RAM Test Framework v2.0'));
    console.log(chalk.blue('='.repeat(50)));

    const testCases = this.loadTestCases();

    if (testCases.length === 0) {
      console.log(
        chalk.yellow('No test cases found. Creating sample tests...')
      );
      this.createSampleTests();
      return;
    }

    const results = await this.framework.runTests(testCases);
    this.framework.generateSummary(results);

    const failed = results.filter(r => !r.passed).length;
    process.exit(failed > 0 ? 1 : 0);
  }

  /**
   * Load test cases from various sources
   */
  private loadTestCases(): TestCase[] {
    const testCases: TestCase[] = [];

    // Load basic test programs
    testCases.push(...this.loadBasicTests());

    // Load multiplication tests
    testCases.push(...this.loadMultiplicationTests());

    // Load arithmetic tests
    testCases.push(...this.loadArithmeticTests());

    return testCases;
  }

  /**
   * Load basic functionality tests
   */
  private loadBasicTests(): TestCase[] {
    const tests: TestCase[] = [];

    // Test halt functionality
    if (fs.existsSync('halt.ram')) {
      tests.push({
        name: 'Basic Halt Test',
        description: 'Test that HLT instruction works correctly',
        ramFile: 'halt.ram',
        expectedResults: [
          {
            type: 'HALT',
            expectedValue: 1,
            description: 'Program should halt',
          },
          {
            type: 'STEPS',
            expectedRange: { min: 1, max: 5 },
            description: 'Should complete in few steps',
          },
        ],
      });
    }

    // Test load/save functionality
    if (fs.existsSync('loadsave.ram')) {
      tests.push({
        name: 'Load/Save Test',
        description: 'Test TAKE and SAVE instructions',
        ramFile: 'loadsave.ram',
        setup: {
          initialMemory: { 100: 42 },
        },
        expectedResults: [
          {
            type: 'MEMORY',
            address: 101,
            expectedValue: 42,
            description: 'Value should be copied from address 100 to 101',
          },
          {
            type: 'HALT',
            expectedValue: 1,
            description: 'Program should halt',
          },
        ],
      });
    }

    return tests;
  }

  /**
   * Load multiplication test cases
   */
  private loadMultiplicationTests(): TestCase[] {
    const tests: TestCase[] = [];

    if (fs.existsSync('multiply.ram')) {
      // Test various multiplication scenarios
      const multiplyTests = [
        { a: 3, b: 4, result: 12 },
        { a: 7, b: 8, result: 56 },
        { a: 0, b: 5, result: 0 },
        { a: 1, b: 100, result: 100 },
        { a: 12, b: 12, result: 144 },
      ];

      multiplyTests.forEach(({ a, b, result: _result }) => {
        tests.push(
          this.framework.createMultiplicationTest(
            `Multiply ${a} × ${b}`,
            'multiply.ram',
            a,
            b,
            102, // Result address
            100, // Multiplicand address
            101 // Multiplier address
          )
        );
      });
    }

    // Test multiplication by zero
    if (fs.existsSync('multiply.ram')) {
      tests.push(
        this.framework.createMultiplicationTest(
          'Multiply by Zero',
          'multiply.ram',
          15,
          0,
          102,
          100,
          101
        )
      );
    }

    return tests;
  }

  /**
   * Load arithmetic test cases
   */
  private loadArithmeticTests(): TestCase[] {
    const tests: TestCase[] = [];

    if (fs.existsSync('arithmetic.ram')) {
      tests.push({
        name: 'Basic Arithmetic',
        description: 'Test ADD and SUB instructions',
        ramFile: 'arithmetic.ram',
        setup: {
          initialMemory: { 100: 10, 101: 5 },
        },
        expectedResults: [
          {
            type: 'ACCUMULATOR',
            expectedValue: 15,
            description: 'ACC should contain 10 + 5',
          },
          {
            type: 'HALT',
            expectedValue: 1,
            description: 'Program should halt',
          },
        ],
      });
    }

    // Test countdown program
    if (fs.existsSync('countdown.ram')) {
      tests.push({
        name: 'Countdown Test',
        description: 'Test countdown from 10 to 0',
        ramFile: 'countdown.ram',
        setup: {
          initialMemory: { 100: 10 },
        },
        expectedResults: [
          {
            type: 'MEMORY',
            address: 100,
            expectedValue: 0,
            description: 'Counter should reach 0',
          },
          {
            type: 'STEPS',
            expectedRange: { min: 20, max: 50 },
            description: 'Should complete countdown in reasonable steps',
          },
          {
            type: 'HALT',
            expectedValue: 1,
            description: 'Program should halt',
          },
        ],
        timeout: 1000,
      });
    }

    return tests;
  }

  /**
   * Create sample test programs if none exist
   */
  private createSampleTests(): void {
    console.log(chalk.blue('\n📝 Creating sample test programs...'));

    // Create a simple multiplication program
    const multiplyProgram = `01100
02101
04102
07100
08101
06101
00500
10000`;

    if (!fs.existsSync('test-multiply.ram')) {
      fs.writeFileSync('test-multiply.ram', multiplyProgram);
      console.log(chalk.green('✅ Created test-multiply.ram'));
    }

    // Create test with data
    const testData = `10
5
0
0
0
01000
02001
04002
10000`;

    if (!fs.existsSync('test-add.ram')) {
      fs.writeFileSync('test-add.ram', testData);
      console.log(chalk.green('✅ Created test-add.ram'));
    }

    console.log(
      chalk.blue(
        '\n🧪 Sample test programs created. Run again to execute tests.'
      )
    );
    console.log(
      chalk.gray(
        'Edit the .ram files to set up your test data and expected results.'
      )
    );
  }
}

// Main execution
if (require.main === module) {
  const runner = new TestRunner();
  runner.run().catch(error => {
    console.error(chalk.red(`Test runner failed: ${error.message}`));
    process.exit(1);
  });
}
