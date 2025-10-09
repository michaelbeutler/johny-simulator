# JOHNNY RAM Validator & Simulator

A comprehensive TypeScript + Bun implementation of the JOHNNY computer simulator with automated testing, validation, documentation generation, and a complete Johnny C compiler.

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Run all tests
bun test

# Compile Johnny C to JOHNNY RAM
bun run compile jcc/simple_add.jcc

# Validate a specific program
bun run validate scripts/multiply.ram

# Simulate a program interactively
bun run simulate scripts/addition.ram

# Generate documentation
bun run docs
```

## 🔧 Johnny C Compiler

Johnny C is a C-like language that compiles to JOHNNY RAM assembly. It supports variables, arithmetic, conditionals, loops, and basic expressions.

### Syntax Guide

#### Variable Declarations

```c
int x;          // Declare integer variable
bool flag;      // Declare boolean variable
```

#### Assignments

```c
x = 5;          // Assign constant
y = x + 2;      // Assign expression result
flag = true;    // Boolean assignment
```

#### Arithmetic Operations

```c
result = a + b;  // Addition
result = a - b;  // Subtraction
result = a * b;  // Multiplication (limited to small numbers)
```

#### Conditional Statements

```c
if (x > 0) {
    y = 1;
} else {
    y = 0;
}

// Nested conditionals
if (a > b) {
    if (c > 0) {
        result = a + c;
    }
}
```

#### While Loops

```c
while (i < 10) {
    sum = sum + i;
    i = i + 1;
}
```

#### Comparison Operators

- `==` (equals)
- `!=` (not equals)
- `<` (less than)
- `>` (greater than)
- `<=` (less than or equal)
- `>=` (greater than or equal)

#### Boolean Operators

- `&&` (and)
- `||` (or)
- `!` (not)

#### Program Termination

```c
halt;  // End program execution
```

### Compiler Usage

```bash
# Compile a Johnny C program
bun run compile <filename.jcc>

# This generates a .ram file that can be simulated
bun run simulate <filename.ram>
```

### Example Programs

See the `jcc/` directory for example programs:

- `simple_add.jcc` - Basic arithmetic
- `variables.jcc` - Variable declarations and assignments
- `if_else.jcc` - Conditional statements
- `countdown.jcc` - While loop with countdown
- `comparisons.jcc` - All comparison operators (==, !=, <, >, <=, >=)
- `expressions.jcc` - Complex expressions
- `nested_if.jcc` - Nested conditional statements
- `factorial.jcc` - Iterative accumulation
- `demo.jcc` - Mixed arithmetic and boolean operations
- `showcase.jcc` - Comprehensive language feature demonstration

### Recent Improvements

✅ **Full Comparison Support**: All comparison operators now implemented
✅ **Boolean Literals**: `true` and `false` keywords supported
✅ **Enhanced Examples**: 10+ example programs covering all language features
✅ **Comprehensive Testing**: Automated test script for all examples

### Limitations

- Constants must be small integers (≤10) for optimal performance
- Multiplication uses repeated addition algorithm
- No functions or procedures yet
- Limited to integer and boolean types

## 📊 Program Summary

- **Total Programs:** 3
- **Valid Programs:** 3/3
- **Total Instructions:** 18
- **All Tests:** ✅ 13/13 passing

## 📁 Programs

| Program                           | Status | Instructions | Tests | Description                 |
| --------------------------------- | ------ | ------------ | ----- | --------------------------- |
| [addition](scripts/addition.md)   | ✅     | 4            | 4/4   | Basic arithmetic addition   |
| [countdown](scripts/countdown.md) | ✅     | 4            | 4/4   | Countdown loop with TST     |
| [multiply](scripts/multiply.md)   | ✅     | 10           | 5/5   | Multiplication via addition |

_See [PROGRAMS.md](PROGRAMS.md) for auto-generated program analysis._

## 🛠️ Available Scripts

| Script         | Command                   | Description                             |
| -------------- | ------------------------- | --------------------------------------- |
| **test**       | `bun test`                | Run all test suites with coverage       |
| **test:watch** | `bun test --watch`        | Run tests in watch mode                 |
| **docs**       | `bun run docs`            | Generate documentation for all programs |
| **validate**   | `bun run validate <file>` | Validate a specific .ram file           |
| **simulate**   | `bun run simulate <file>` | Run interactive simulation              |
| **clean**      | `bun run clean`           | Clean generated files                   |
| **dev**        | `bun run dev`             | Development mode (test watch)           |

## 📖 Documentation System

This project uses an automated documentation generation system for .ram programs that preserves user content while generating technical analysis.

### Placeholder Comment System

Each program's markdown file (e.g., `sieve.md`, `addition.md`) can contain user-written content above a special placeholder comment:

```markdown
# My Program

User-written documentation, examples, theory, etc.

<!-- AUTO_GENERATED_DOCS_START -->
<!-- Everything below this line will be replaced by auto-generated documentation -->
```

Everything **above** the placeholder is preserved when regenerating docs.
Everything **below** the placeholder is replaced with auto-generated content including:

- ✅ **Status**: Program validation status
- 🧪 **Test Cases**: Results from test suites
- 📊 **Statistics**: Instructions, memory usage, etc.
- ⚠️ **Warnings**: Any validation warnings
- 📋 **Disassembly**: Human-readable instruction breakdown
- 💾 **Source Code**: Raw .ram file contents

### Generating Documentation

```bash
npm run docs
```

This will:

1. Scan all `.ram` files in the `scripts/` directory
2. Analyze each program (validation, testing, disassembly)
3. Update individual `.md` files (preserving user content above placeholder)
4. Generate master `PROGRAMS.md` with overview

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

### 3. Create Documentation Template

Create `scripts/my-program.md` with user content and placeholder:

```markdown
# My Program

Explain what your program does, how to use it, etc.

## How to Use

### Browser Simulator

1. Load `my-program.ram` into the browser simulator
2. Set memory values as needed
3. Run the program

<!-- AUTO_GENERATED_DOCS_START -->
<!-- Everything below this line will be replaced by auto-generated documentation -->
```

### 4. Generate Documentation

```bash
# Auto-generate technical analysis and update all docs
npm run docs
```

This will update `scripts/my-program.md` with your user content preserved above the placeholder, plus auto-generated technical analysis below.

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
  100: 15, // First operand
  101: 25, // Second operand
  102: 0, // Result location (optional)
};
```

### Assertion Helpers

```typescript
// Final state assertions
expect(finalState.halted).toBe(true); // Program terminated
expect(finalState.steps).toBeGreaterThan(0); // Steps executed
expect(finalState.acc).toBe(expectedValue); // Accumulator value
expect(finalState.ram[address]).toBe(value); // Memory location

// Parse result assertions
expect(parseResult.errors).toHaveLength(0); // No parse errors
expect(parseResult.ram).toHaveLength(1000); // Memory size

// Validation assertions
expect(result.isValid).toBe(true); // Valid program
expect(result.errors).toHaveLength(0); // No validation errors
expect(result.warnings).toBeDefined(); // Warnings array exists
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
└── examples/                  # Example programs and tutorials
```

## 🛠️ JOHNNY Instruction Set

The JOHNNY computer uses 2-digit opcodes with 3-digit operands (format: OOAAA).

| Opcode | Name  | Format | Description                  | Example |
| ------ | ----- | ------ | ---------------------------- | ------- |
| **00** | FETCH | 00000  | Fetch instruction (internal) | 00000   |
| **01** | TAKE  | 01AAA  | Load mem[AAA] into ACC       | 01100   |
| **02** | ADD   | 02AAA  | ACC = ACC + mem[AAA]         | 02101   |
| **03** | SUB   | 03AAA  | ACC = ACC - mem[AAA]         | 03102   |
| **04** | SAVE  | 04AAA  | mem[AAA] = ACC               | 04103   |
| **05** | JMP   | 05AAA  | Jump to address AAA          | 05010   |
| **06** | TST   | 06AAA  | Skip next if mem[AAA] = 0    | 06100   |
| **07** | INC   | 07AAA  | mem[AAA] = mem[AAA] + 1      | 07100   |
| **08** | DEC   | 08AAA  | mem[AAA] = mem[AAA] - 1      | 08101   |
| **09** | NULL  | 09AAA  | mem[AAA] = 0                 | 09102   |
| **10** | HLT   | 10000  | Halt program execution       | 10000   |

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
  validateInstructions: true,
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

_Documentation maintained manually. Program analysis auto-generated with `bun run docs`._
