// Comprehensive Test Framework for JOHNNY RAM programs
import { TestCase, TestResult, TestExpectation, ExecutionState } from '../types';
import { JohnnySimulator } from '../core/simulator';
import { RamValidator } from '../validation/validator';
import { RamParser } from '../core/parser';
const chalk = require('chalk');

export class TestFramework {
  private simulator: JohnnySimulator;
  private validator: RamValidator;
  private parser: RamParser;

  constructor() {
    this.simulator = new JohnnySimulator();
    this.validator = new RamValidator();
    this.parser = new RamParser();
  }

  /**
   * Run a single test case
   */
  async runTest(testCase: TestCase): Promise<TestResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const actualResults: Record<string, any> = {};

    try {
      // Parse the program
      const parseResult = this.parser.parseFile(testCase.ramFile);
      if (parseResult.errors.length > 0) {
        return {
          testName: testCase.name,
          passed: false,
          executionTime: Date.now() - startTime,
          steps: 0,
          errors: parseResult.errors,
          actualResults: {}
        };
      }

      // Validate the program
      const validationResult = this.validator.validateProgram(parseResult.ram);
      if (!validationResult.isValid) {
        errors.push(...validationResult.errors.map(e => e.message));
      }

      // Set up simulation
      const maxSteps = testCase.timeout || 10000;
      this.simulator.updateConfig({ maxSteps });

      // Run simulation
      const finalState = this.simulator.simulate(
        parseResult.ram,
        testCase.setup?.initialAcc || 0,
        testCase.setup?.initialMemory
      );

      actualResults.finalAcc = finalState.acc;
      actualResults.steps = finalState.steps;
      actualResults.halted = finalState.halted;
      actualResults.ram = [...finalState.ram];

      // Check expectations
      const expectationResults = this.checkExpectations(testCase.expectedResults, finalState, actualResults);
      errors.push(...expectationResults.errors);

      return {
        testName: testCase.name,
        passed: errors.length === 0,
        executionTime: Date.now() - startTime,
        steps: finalState.steps,
        errors,
        actualResults,
        trace: finalState.trace
      };

    } catch (error) {
      return {
        testName: testCase.name,
        passed: false,
        executionTime: Date.now() - startTime,
        steps: 0,
        errors: [`Execution failed: ${(error as Error).message}`],
        actualResults
      };
    }
  }

  /**
   * Run multiple test cases
   */
  async runTests(testCases: TestCase[]): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    for (const testCase of testCases) {
      console.log(chalk.blue(`\n🧪 Running test: ${testCase.name}`));
      console.log(chalk.gray(`   ${testCase.description}`));
      
      const result = await this.runTest(testCase);
      results.push(result);
      
      if (result.passed) {
        console.log(chalk.green(`✅ PASSED (${result.executionTime}ms, ${result.steps} steps)`));
      } else {
        console.log(chalk.red(`❌ FAILED (${result.executionTime}ms)`));
        result.errors.forEach(error => {
          console.log(chalk.red(`   • ${error}`));
        });
      }
    }

    return results;
  }

  /**
   * Check test expectations against actual results
   */
  private checkExpectations(
    expectations: TestExpectation[],
    finalState: ExecutionState,
    actualResults: Record<string, any>
  ): { errors: string[] } {
    const errors: string[] = [];

    for (const expectation of expectations) {
      try {
        switch (expectation.type) {
          case 'MEMORY':
            this.checkMemoryExpectation(expectation, finalState, errors);
            break;
          case 'ACCUMULATOR':
            this.checkAccumulatorExpectation(expectation, finalState, errors);
            break;
          case 'STEPS':
            this.checkStepsExpectation(expectation, finalState, errors);
            break;
          case 'HALT':
            this.checkHaltExpectation(expectation, finalState, errors);
            break;
          case 'OUTPUT':
            this.checkOutputExpectation(expectation, finalState, errors);
            break;
        }
      } catch (error) {
        errors.push(`Error checking expectation: ${(error as Error).message}`);
      }
    }

    return { errors };
  }

  /**
   * Check memory expectation
   */
  private checkMemoryExpectation(expectation: TestExpectation, finalState: ExecutionState, errors: string[]): void {
    if (expectation.address === undefined) {
      errors.push(`Memory expectation missing address`);
      return;
    }

    const actualValue = finalState.ram[expectation.address];
    
    if (expectation.expectedValue !== undefined) {
      if (actualValue !== expectation.expectedValue) {
        errors.push(`${expectation.description}: Expected memory[${expectation.address}] = ${expectation.expectedValue}, got ${actualValue}`);
      }
    } else if (expectation.expectedRange) {
      const { min, max } = expectation.expectedRange;
      if (actualValue < min || actualValue > max) {
        errors.push(`${expectation.description}: Expected memory[${expectation.address}] in range [${min}, ${max}], got ${actualValue}`);
      }
    }
  }

  /**
   * Check accumulator expectation
   */
  private checkAccumulatorExpectation(expectation: TestExpectation, finalState: ExecutionState, errors: string[]): void {
    const actualValue = finalState.acc;
    
    if (expectation.expectedValue !== undefined) {
      if (actualValue !== expectation.expectedValue) {
        errors.push(`${expectation.description}: Expected ACC = ${expectation.expectedValue}, got ${actualValue}`);
      }
    } else if (expectation.expectedRange) {
      const { min, max } = expectation.expectedRange;
      if (actualValue < min || actualValue > max) {
        errors.push(`${expectation.description}: Expected ACC in range [${min}, ${max}], got ${actualValue}`);
      }
    }
  }

  /**
   * Check steps expectation
   */
  private checkStepsExpectation(expectation: TestExpectation, finalState: ExecutionState, errors: string[]): void {
    const actualSteps = finalState.steps;
    
    if (expectation.expectedValue !== undefined) {
      if (actualSteps !== expectation.expectedValue) {
        errors.push(`${expectation.description}: Expected ${expectation.expectedValue} steps, got ${actualSteps}`);
      }
    } else if (expectation.expectedRange) {
      const { min, max } = expectation.expectedRange;
      if (actualSteps < min || actualSteps > max) {
        errors.push(`${expectation.description}: Expected steps in range [${min}, ${max}], got ${actualSteps}`);
      }
    }
  }

  /**
   * Check halt expectation
   */
  private checkHaltExpectation(expectation: TestExpectation, finalState: ExecutionState, errors: string[]): void {
    const expectedHalted = expectation.expectedValue === 1;
    if (finalState.halted !== expectedHalted) {
      errors.push(`${expectation.description}: Expected halted = ${expectedHalted}, got ${finalState.halted}`);
    }
  }

  /**
   * Check output expectation (for programs that write to specific memory locations)
   */
  private checkOutputExpectation(expectation: TestExpectation, finalState: ExecutionState, errors: string[]): void {
    // This can be extended to check specific output patterns or calculations
    if (expectation.address !== undefined) {
      this.checkMemoryExpectation(expectation, finalState, errors);
    }
  }

  /**
   * Create test case for multiplication verification
   */
  createMultiplicationTest(
    name: string,
    ramFile: string,
    multiplicand: number,
    multiplier: number,
    resultAddress: number,
    multiplicandAddress?: number,
    multiplierAddress?: number
  ): TestCase {
    const setup = {
      initialMemory: {} as Record<number, number>
    };

    if (multiplicandAddress !== undefined) {
      setup.initialMemory[multiplicandAddress] = multiplicand;
    }
    if (multiplierAddress !== undefined) {
      setup.initialMemory[multiplierAddress] = multiplier;
    }

    return {
      name,
      description: `Multiply ${multiplicand} × ${multiplier} = ${multiplicand * multiplier}`,
      ramFile,
      setup,
      expectedResults: [
        {
          type: 'MEMORY',
          address: resultAddress,
          expectedValue: multiplicand * multiplier,
          description: `Result should be ${multiplicand * multiplier}`
        },
        {
          type: 'HALT',
          expectedValue: 1,
          description: 'Program should halt properly'
        }
      ],
      timeout: 50000
    };
  }

  /**
   * Generate summary report
   */
  generateSummary(results: TestResult[]): void {
    const passed = results.filter(r => r.passed).length;
    const failed = results.length - passed;
    const totalTime = results.reduce((sum, r) => sum + r.executionTime, 0);
    const totalSteps = results.reduce((sum, r) => sum + r.steps, 0);

    console.log(chalk.blue('\n' + '='.repeat(60)));
    console.log(chalk.blue('📊 Test Summary'));
    console.log(chalk.blue('='.repeat(60)));
    console.log(`Total Tests: ${results.length}`);
    console.log(chalk.green(`✅ Passed: ${passed}`));
    if (failed > 0) {
      console.log(chalk.red(`❌ Failed: ${failed}`));
    }
    console.log(`⏱️  Total Time: ${totalTime}ms`);
    console.log(`🔢 Total Steps: ${totalSteps}`);
    console.log(`📈 Average Steps per Test: ${Math.round(totalSteps / results.length)}`);

    if (failed > 0) {
      console.log(chalk.red('\n❌ Failed Tests:'));
      results.filter(r => !r.passed).forEach(result => {
        console.log(chalk.red(`   • ${result.testName}`));
        result.errors.slice(0, 2).forEach(error => {
          console.log(chalk.gray(`     ${error}`));
        });
      });
    }
  }
}