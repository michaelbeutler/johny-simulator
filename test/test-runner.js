// Test Runner for Johnny Simulator
// Validates and tests .ram programs

const fs = require('fs');
const path = require('path');

class JohnnyTestRunner {
  constructor() {
    this.tests = [];
    this.results = [];
  }

  // Load and parse a .ram file
  loadRamFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim() !== '');
      const ram = [];

      for (let i = 0; i < 1000; i++) {
        ram[i] = 0;
      }

      lines.forEach((line, index) => {
        const value = Number.parseInt(line.trim());
        if (!isNaN(value)) {
          ram[index] = value;
        }
      });

      return ram;
    } catch (error) {
      throw new Error(`Failed to load RAM file ${filePath}: ${error.message}`);
    }
  }

  // Validate instruction format
  validateInstruction(instruction, address) {
    const errors = [];

    if (instruction < 0 || instruction > 99999) {
      errors.push(
        `Invalid instruction value ${instruction} at address ${address}`
      );
      return errors;
    }

    const opcode = Math.floor(instruction / 1000);
    const operand = instruction % 1000;

    // Valid opcodes: 01-10, or 0 for data/no-op
    if (opcode < 0 || opcode > 10) {
      errors.push(`Invalid opcode ${opcode} at address ${address}`);
    }

    // Operand should be valid address (0-999) for most instructions
    if (opcode >= 1 && opcode <= 6 && (operand < 0 || operand > 999)) {
      errors.push(
        `Invalid operand ${operand} for opcode ${opcode} at address ${address}`
      );
    }

    // Instructions 07-10 should have operand 000
    if (opcode >= 7 && opcode <= 10 && operand !== 0) {
      errors.push(
        `Opcode ${opcode} should have operand 000, got ${operand} at address ${address}`
      );
    }

    return errors;
  }

  // Validate entire RAM program
  validateProgram(ram) {
    const errors = [];
    let hasHalt = false;

    for (let i = 0; i < 1000; i++) {
      const instruction = ram[i];
      const opcode = Math.floor(instruction / 1000);

      // Check for halt instruction
      if (opcode === 10) {
        hasHalt = true;
      }

      // Only validate actual instructions (opcode > 0)
      if (opcode > 0) {
        const instrErrors = this.validateInstruction(instruction, i);
        errors.push(...instrErrors);
      } // Check for infinite loops (JMP to same address)
      if (opcode === 5) {
        const operand = instruction % 1000;
        if (operand === i) {
          errors.push(`Potential infinite loop: JMP to same address ${i}`);
        }
      }
    }

    if (!hasHalt) {
      errors.push('Program does not contain a HALT instruction (opcode 10)');
    }

    return errors;
  }

  // Simulate program execution (simplified)
  simulateExecution(ram, maxSteps = 10000) {
    const state = {
      pc: 0,
      acc: 0,
      addressBus: 0,
      dataBus: 0,
      instruction: 0,
      steps: 0,
      halted: false,
      ram: [...ram],
      trace: [],
    };

    while (!state.halted && state.steps < maxSteps) {
      if (state.pc >= 1000) {
        throw new Error(`Program counter out of bounds: ${state.pc}`);
      }

      const instruction = state.ram[state.pc];
      const opcode = Math.floor(instruction / 1000);
      const operand = instruction % 1000;

      state.trace.push({
        step: state.steps,
        pc: state.pc,
        instruction: instruction,
        opcode: opcode,
        operand: operand,
        acc: state.acc,
      });

      // Execute instruction
      switch (opcode) {
        case 1: // TAKE
          state.acc = state.ram[operand];
          break;
        case 2: // ADD
          state.acc += state.ram[operand];
          if (state.acc > 99999) state.acc = 99999;
          break;
        case 3: // SUB
          state.acc -= state.ram[operand];
          if (state.acc < 0) state.acc = 0;
          break;
        case 4: // SAVE
          state.ram[operand] = state.acc;
          break;
        case 5: // JMP
          state.pc = operand;
          state.steps++;
          continue;
        case 6: // TST
          if (state.ram[operand] === 0) {
            state.pc++; // Skip next instruction
          }
          break;
        case 7: // INC
          state.acc++;
          if (state.acc > 99999) state.acc = 99999;
          break;
        case 8: // DEC
          state.acc--;
          if (state.acc < 0) state.acc = 0;
          break;
        case 9: // NULL (NOP)
          // No operation
          break;
        case 10: // HLT
          state.halted = true;
          break;
        default:
          if (instruction !== 0) {
            throw new Error(`Invalid opcode ${opcode} at address ${state.pc}`);
          }
          break;
      }

      state.pc++;
      state.steps++;
    }

    if (!state.halted && state.steps >= maxSteps) {
      throw new Error(
        `Program exceeded maximum steps (${maxSteps}), possible infinite loop`
      );
    }

    return state;
  }

  // Add a test case
  addTest(name, ramFile, expectedResults) {
    this.tests.push({
      name,
      ramFile,
      expectedResults,
    });
  }

  // Run a single test
  runTest(test) {
    const result = {
      name: test.name,
      passed: false,
      errors: [],
      warnings: [],
      executionState: null,
    };

    try {
      // Load RAM file
      const ram = this.loadRamFile(test.ramFile);

      // Validate program
      const validationErrors = this.validateProgram(ram);
      if (validationErrors.length > 0) {
        result.errors.push(...validationErrors);
      }

      // Simulate execution
      const executionState = this.simulateExecution(ram);
      result.executionState = executionState;

      // Check expected results
      if (test.expectedResults) {
        const checks = test.expectedResults;

        if (
          checks.finalAcc !== undefined &&
          executionState.acc !== checks.finalAcc
        ) {
          result.errors.push(
            `Expected final accumulator ${checks.finalAcc}, got ${executionState.acc}`
          );
        }

        if (
          checks.maxSteps !== undefined &&
          executionState.steps > checks.maxSteps
        ) {
          result.errors.push(
            `Program took ${executionState.steps} steps, expected max ${checks.maxSteps}`
          );
        }

        if (checks.memoryChanges) {
          for (const [addr, expectedValue] of Object.entries(
            checks.memoryChanges
          )) {
            const actualValue = executionState.ram[Number.parseInt(addr)];
            if (actualValue !== expectedValue) {
              result.errors.push(
                `Expected memory[${addr}] = ${expectedValue}, got ${actualValue}`
              );
            }
          }
        }

        if (
          checks.shouldHalt !== undefined &&
          executionState.halted !== checks.shouldHalt
        ) {
          result.errors.push(
            `Expected halted=${checks.shouldHalt}, got ${executionState.halted}`
          );
        }
      }

      result.passed = result.errors.length === 0;
    } catch (error) {
      result.errors.push(error.message);
      result.passed = false;
    }

    return result;
  }

  // Run all tests
  runAllTests() {
    console.log('🚀 Running Johnny Simulator Tests...\n');

    this.results = [];
    let passed = 0;
    let failed = 0;

    this.tests.forEach(test => {
      const result = this.runTest(test);
      this.results.push(result);

      if (result.passed) {
        console.log(`✅ ${result.name}`);
        passed++;
      } else {
        console.log(`❌ ${result.name}`);
        result.errors.forEach(error => {
          console.log(`   - ${error}`);
        });
        failed++;
      }
    });

    console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);

    if (failed === 0) {
      console.log('🎉 All tests passed!');
    }

    return {
      passed,
      failed,
      results: this.results,
    };
  }

  // Generate test report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.passed).length,
        failed: this.results.filter(r => !r.passed).length,
      },
      tests: this.results,
    };

    return JSON.stringify(report, null, 2);
  }
}

module.exports = JohnnyTestRunner;

// CLI execution
if (require.main === module) {
  const testRunner = new JohnnyTestRunner();

  // Add default tests
  const testDir = path.join(__dirname, '../');

  // Test existing .ram files
  const ramFiles = fs
    .readdirSync(testDir)
    .filter(file => file.endsWith('.ram'));

  ramFiles.forEach(file => {
    const filePath = path.join(testDir, file);
    testRunner.addTest(`Validate ${file}`, filePath);
  });

  // Run tests
  const results = testRunner.runAllTests();

  // Generate report
  const reportPath = path.join(__dirname, 'test-report.json');
  fs.writeFileSync(reportPath, testRunner.generateReport());
  console.log(`\n📄 Test report saved to ${reportPath}`);

  process.exit(results.failed > 0 ? 1 : 0);
}
