# JOHNNY RAM Validator & Simulator

A comprehensive TypeScript + Bun implementation of the JOHNNY computer simulator with automated testing, validation, and documentation generation.

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Run all tests
bun test

# Generate documentation
bun run docs

# Validate a specific program
bun run validate scripts/multiply.ram

# Simulate a program interactively
bun run simulate scripts/addition.ram
```

## 📊 Program Summary

- **Total Programs:** 3
- **Valid Programs:** 3/3 
- **Total Instructions:** 18
- **All Tests:** ✅ 13/13 passing

## 📁 Programs

| Program | Status | Instructions | Tests | Description |
|---------|--------|--------------|-------|-------------|
| [addition](scripts/addition.md) | ✅ | 4 | 4/4 | Basic arithmetic addition |
| [countdown](scripts/countdown.md) | ✅ | 4 | 4/4 | Countdown loop with TST |
| [multiply](scripts/multiply.md) | ✅ | 10 | 5/5 | Multiplication via addition |

*See [PROGRAMS.md](PROGRAMS.md) for auto-generated program analysis.*

## 🛠️ Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **test** | `bun test` | Run all test suites with coverage |
| **test:watch** | `bun test --watch` | Run tests in watch mode |
| **docs** | `bun run docs` | Generate documentation for all programs |
| **validate** | `bun run validate <file>` | Validate a specific .ram file |
| **simulate** | `bun run simulate <file>` | Run interactive simulation |
| **clean** | `bun run clean` | Clean generated files |
| **dev** | `bun run dev` | Development mode (test watch) |

## ➕ Adding New Programs

To add a new JOHNNY RAM program, follow this structure:

### 1. Create the Program File

```bash
# Create the .ram file in scripts/
touch scripts/my-program.ram
```

Example program (`scripts/my-program.ram`):
```
01100  // TAKE 100    - Load first number
02101  // ADD 101     - Add second number  
04102  // SAVE 102    - Store result
10000  // HLT         - Halt
```

### 2. Create the Test File

Create `scripts/my-program.test.ts`:

```typescript
// @ts-ignore
import { describe, test, expect } from 'bun:test';
import { JohnnySimulator } from '../src/core/simulator';
import { RamParser } from '../src/core/parser';
import { RamValidator } from '../src/validation/validator';

describe('My Program Tests', () => {
  const simulator = new JohnnySimulator();
  const parser = new RamParser();
  const validator = new RamValidator();

  test('should validate my program', () => {
    const result = validator.validateFile('scripts/my-program.ram');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should perform expected operation', async () => {
    const parseResult = parser.parseFile('scripts/my-program.ram');
    expect(parseResult.errors).toHaveLength(0);

    const initialMemory = { 100: 10, 101: 20 };
    const finalState = simulator.simulate(parseResult.ram, 0, initialMemory);

    expect(finalState.halted).toBe(true);
    expect(finalState.ram[102]).toBe(30); // Expected result
  });
});
```

### 3. Generate Documentation

```bash
# Auto-generate the .md file and update README
bun run docs
```

This will create `scripts/my-program.md` with:
- ✅ Validation status
- 🧪 Test cases with "should..." descriptions
- 📋 Program disassembly
- 📊 Statistics

## 🧪 Testing Helpers

### Core Testing Classes

```typescript
import { JohnnySimulator } from '../src/core/simulator';
import { RamParser } from '../src/core/parser';  
import { RamValidator } from '../src/validation/validator';
```

### Common Test Patterns

```typescript
// Validation Test
test('should validate program', () => {
  const result = validator.validateFile('scripts/program.ram');
  expect(result.isValid).toBe(true);
  expect(result.errors).toHaveLength(0);
});

// Simulation Test
test('should perform operation', async () => {
  const parseResult = parser.parseFile('scripts/program.ram');
  const initialMemory = { 100: value1, 101: value2 };
  const finalState = simulator.simulate(parseResult.ram, 0, initialMemory);
  
  expect(finalState.halted).toBe(true);
  expect(finalState.ram[102]).toBe(expectedResult);
  expect(finalState.steps).toBeGreaterThan(0);
});

// Error Handling Test
test('should handle edge cases', async () => {
  const initialMemory = { 100: 0, 101: 0 };
  const finalState = simulator.simulate(parseResult.ram, 0, initialMemory);
  
  expect(finalState.halted).toBe(true);
  expect(finalState.ram[102]).toBe(0);
});
```

### Test Configuration

Tests support initial memory setup:
```typescript
const initialMemory = { 
  100: 15,    // First operand
  101: 25,    // Second operand  
  102: 0      // Result location (optional)
};
```

### Assertion Helpers

```typescript
// Final state assertions
expect(finalState.halted).toBe(true);           // Program terminated
expect(finalState.steps).toBeGreaterThan(0);    // Steps executed
expect(finalState.acc).toBe(expectedValue);     // Accumulator value
expect(finalState.ram[address]).toBe(value);    // Memory location

// Parse result assertions  
expect(parseResult.errors).toHaveLength(0);     // No parse errors
expect(parseResult.ram).toHaveLength(1000);     // Memory size

// Validation assertions
expect(result.isValid).toBe(true);              // Valid program
expect(result.errors).toHaveLength(0);          // No validation errors
expect(result.warnings).toBeDefined();          // Warnings array exists
```

## 📁 Project Structure

```
├── scripts/                    # RAM programs and tests
│   ├── *.ram                  # JOHNNY assembly programs
│   ├── *.test.ts              # Jest/Bun test files  
│   └── *.md                   # Auto-generated docs
├── src/
│   ├── core/                  # Core simulator components
│   │   ├── opcodes.ts         # Instruction definitions
│   │   ├── parser.ts          # RAM file parser
│   │   └── simulator.ts       # JOHNNY simulator engine
│   ├── scripts/               # Utility scripts
│   │   ├── generate-docs.ts   # Documentation generator
│   │   ├── simulator.ts       # Interactive simulator
│   │   ├── test-runner.ts     # Test runner utilities
│   │   └── validate-ram.ts    # Program validator
│   ├── testing/               # Test utilities and helpers
│   ├── types/                 # TypeScript type definitions
│   └── validation/            # Validation logic
├── examples/                  # Example programs and tutorials
└── simulator/                 # Legacy JavaScript files
```

## 🛠️ JOHNNY Instruction Set

The JOHNNY computer uses 2-digit opcodes with 3-digit operands (format: OOAAA).

| Opcode | Name | Format | Description | Example |
|--------|------|--------|-------------|---------|
| **00** | FETCH | 00000 | Fetch instruction (internal) | 00000 |
| **01** | TAKE | 01AAA | Load mem[AAA] into ACC | 01100 |
| **02** | ADD | 02AAA | ACC = ACC + mem[AAA] | 02101 |
| **03** | SUB | 03AAA | ACC = ACC - mem[AAA] | 03102 |
| **04** | SAVE | 04AAA | mem[AAA] = ACC | 04103 |
| **05** | JMP | 05AAA | Jump to address AAA | 05010 |
| **06** | TST | 06AAA | Skip next if mem[AAA] = 0 | 06100 |
| **07** | INC | 07AAA | mem[AAA] = mem[AAA] + 1 | 07100 |
| **08** | DEC | 08AAA | mem[AAA] = mem[AAA] - 1 | 08101 |
| **09** | NULL | 09AAA | mem[AAA] = 0 | 09102 |
| **10** | HLT | 10000 | Halt program execution | 10000 |

### Memory Layout

- **Memory Size:** 1000 words (addresses 000-999)
- **Program Counter:** Starts at address 000
- **Accumulator:** Single register for arithmetic operations
- **Address Bus:** Current memory address being accessed
- **Data Bus:** Data being transferred

## 🔧 Advanced Usage

### Custom Simulator Configuration

```typescript
const simulator = new JohnnySimulator({
  memorySize: 1000,
  maxSteps: 100000,
  enableTrace: true,
  validateInstructions: true
});
```

### Programmatic Validation

```typescript
import { RamValidator } from './src/validation/validator';

const validator = new RamValidator();
const result = validator.validateFile('program.ram');

if (result.isValid) {
  console.log('✅ Program is valid');
} else {
  console.log('❌ Validation errors:', result.errors);
}
```

### Interactive Simulation

```typescript
import { JohnnySimulator } from './src/core/simulator';
import { RamParser } from './src/core/parser';

const parser = new RamParser();  
const simulator = new JohnnySimulator();

const { ram } = parser.parseFile('program.ram');
const initialMemory = { 100: 42, 101: 0 };
const result = simulator.simulate(ram, 0, initialMemory);

console.log('Final state:', result);
console.log('Execution trace:', result.trace);
```

## 🤝 Contributing

1. **Add Programs:** Follow the 3-file pattern (.ram, .test.ts, auto-generated .md)
2. **Write Tests:** Use descriptive "should..." test names
3. **Generate Docs:** Run `bun run docs` after changes
4. **Test Everything:** Ensure `bun test` passes

## 📚 Resources

- **JOHNNY Specification:** Classic educational computer architecture
- **Bun Runtime:** Fast TypeScript execution and testing
- **Jest Testing:** Comprehensive test framework integration
- **Auto-Documentation:** Generates docs from tests and code analysis

---

*Documentation maintained manually. Program analysis auto-generated with `bun run docs`.*
