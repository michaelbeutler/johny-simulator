# JOHNNY RAM Validator & Simulator

A comprehensive TypeScript + Bun implementation of the JOHNNY computer simulator with automated testing, validation, documentation generation, and a complete **Johnny C** compiler.

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Run all tests
bun test

# Compile Johnny C to JOHNNY RAM
bun run compile jcc/simple_add.jcc

# Compile with comments and variable map
bun run compile jcc/showcase.jcc --comments --print-vars

# Validate a specific program
bun run validate scripts/multiply.ram

# Simulate a program interactively
bun run simulate scripts/addition.ram

# Generate documentation
bun run docs
```

## 🔧 Johnny C Compiler (.jcc files)

**Johnny C** is a C-like programming language that compiles directly to JOHNNY RAM assembly language. It provides a high-level, readable syntax while maintaining full compatibility with the JOHNNY computer architecture.

### Why Johnny C?

- **Educational**: Learn programming concepts with immediate hardware visualization
- **Minimal**: Simple syntax focused on core programming constructs
- **Compatible**: Compiles to standard JOHNNY RAM format
- **Debuggable**: Rich debugging features with variable memory mapping
- **Interactive**: Works seamlessly with the JOHNNY simulator

## 📖 Johnny C Language Reference

### File Extension

Johnny C programs use the `.jcc` file extension (Johnny C Compiler).

### Basic Program Structure

```c
// Variable declarations (must come first)
int x;
int y;
bool flag;

// Program logic
x = 5;
y = 10;
flag = x < y;

if (flag) {
    x = x + y;
}

halt;  // Program termination
```

### Data Types

Johnny C supports two primitive data types:

```c
int number;     // Integer values (signed, range depends on JOHNNY architecture)
bool flag;      // Boolean values (true/false)
```

### Variable Declarations

All variables must be declared before use:

```c
int x;          // Declare integer variable x
int result;     // Declare integer variable result
bool condition; // Declare boolean variable condition
```

### Memory Layout

Variables are automatically allocated in memory:

- **Variables**: RAM[900-949] (user variables, allocated alphabetically)
- **Constants**: RAM[150-151] (CONST_0=0, CONST_1=1)
- **Temporaries**: RAM[960-989] (compiler-generated temporary values)
- **Flags**: RAM[990-995] (boolean variables and conditions)

### Assignments and Expressions

```c
// Simple assignment
x = 5;
y = 10;

// Expression assignment
sum = x + y;
difference = x - y;
product = x * y;

// Boolean assignment
flag = true;
condition = false;
result = x > y;
```

### Arithmetic Operations

Johnny C supports basic arithmetic with automatic optimization:

```c
result = a + b;  // Addition
result = a - b;  // Subtraction
result = a * b;  // Multiplication (uses repeated addition for efficiency)

// Complex expressions
total = (a + b) * c;
average = sum / count;  // Note: Division not yet implemented
```

**Performance Note**: For best performance, use small constants (≤10) as the multiplication algorithm uses repeated addition.

### Comparison Operations

All standard comparison operators are supported:

```c
// Equality
if (x == y) { /* equal */ }
if (x != y) { /* not equal */ }

// Relational
if (x < y)  { /* less than */ }
if (x > y)  { /* greater than */ }
if (x <= y) { /* less than or equal */ }
if (x >= y) { /* greater than or equal */ }
```

### Boolean Operations

```c
// Boolean literals
flag1 = true;
flag2 = false;

// Logical operators
result = flag1 && flag2;  // AND
result = flag1 || flag2;  // OR
result = !flag1;          // NOT

// Complex conditions
if (x > 0 && y < 10) {
    // Both conditions true
}
```

### Control Flow

#### If Statements

```c
// Simple if
if (x > 0) {
    y = 1;
}

// If-else
if (x > 0) {
    y = 1;
} else {
    y = 0;
}

// Nested conditionals
if (a > b) {
    if (c > 0) {
        result = a + c;
    } else {
        result = a - c;
    }
} else {
    result = b;
}
```

#### While Loops

```c
// Countdown loop
i = 10;
while (i > 0) {
    sum = sum + i;
    i = i - 1;
}

// Accumulation loop
count = 0;
total = 0;
while (count < 10) {
    total = total + count;
    count = count + 1;
}
```

### Comments

Johnny C supports C-style single-line comments:

```c
// This is a comment
int x;  // Inline comment
// TODO: Add more features
```

### Program Termination

Every Johnny C program should end with a halt statement:

```c
halt;  // Terminates program execution
```

### Language Limitations

Current limitations of Johnny C:

- **No Functions**: No user-defined functions or procedures yet
- **No Arrays**: Single variables only
- **Limited Types**: Only `int` and `bool` types
- **No Division**: Division operator not implemented
- **Small Constants**: Best performance with constants ≤10
- **No Strings**: No string data type or operations

## 🛠️ Johnny C Compiler Usage

### Basic Compilation

```bash
# Compile a Johnny C program (generates .ram file)
bun run compile program.jcc

# Specify output file
bun run compile program.jcc -o custom_name.ram
```

### Advanced Compilation Options

```bash
# Include inline comments in output
bun run compile program.jcc --comments

# Print variable memory mapping to console
bun run compile program.jcc --print-vars

# Generate memory map files (.json and .md)
bun run compile program.jcc --memmap memory_map.json

# Combined options for debugging
bun run compile program.jcc --comments --print-vars --memmap debug.json
```

### Johnny Simulator Compatibility

By default, the compiler generates files compatible with the original Johnny simulator:

```bash
# Default mode - Johnny simulator compatible
bun run compile program.jcc

# Non-compatible mode with comment headers (for debugging)
bun run compile program.jcc --comments --no-compatible
```

### Variable Memory Map Output

When using `--print-vars`, the compiler shows exactly where your variables are stored:

```
=================================
VARIABLE MEMORY MAP
=================================
Variables:
  result (int) -> RAM[900]
  x (int) -> RAM[901]
  y (int) -> RAM[902]
Constants:
  CONST_0 -> RAM[150] = 0
  CONST_1 -> RAM[151] = 1
Temporary Variables:
  _t0 -> RAM[960]
  _t1 -> RAM[961]
=================================
```

### Workflow: Compile and Simulate

After compilation, you can immediately simulate your program:

```bash
# 1. Compile Johnny C to JOHNNY RAM
bun run compile countdown.jcc --comments

# 2. Simulate the generated program
bun run simulate countdown.ram

# 3. Or validate the program first
bun run validate countdown.ram
```

## 📚 Example Programs

The `jcc/` directory contains comprehensive examples demonstrating all Johnny C features:

### Basic Examples

- **`simple_add.jcc`** - Basic arithmetic operations
- **`variables.jcc`** - Variable declarations and assignments
- **`expressions.jcc`** - Complex arithmetic expressions

### Control Flow Examples

- **`if_else.jcc`** - Conditional statements (if/else)
- **`nested_if.jcc`** - Nested conditional logic
- **`countdown.jcc`** - While loop with countdown

### Comparison Examples

- **`comparisons.jcc`** - All comparison operators (==, !=, <, >, <=, >=)

### Advanced Examples

- **`factorial.jcc`** - Iterative factorial calculation
- **`multiply.jcc`** - Multiplication using repeated addition
- **`demo.jcc`** - Mixed arithmetic and boolean operations
- **`showcase.jcc`** - Comprehensive language feature demonstration

### Running Examples

```bash
# Try the basic addition example
bun run compile jcc/simple_add.jcc --print-vars
bun run simulate simple_add.ram

# Explore the comprehensive showcase
bun run compile jcc/showcase.jcc --comments --print-vars

# Test control flow with countdown
bun run compile jcc/countdown.jcc --comments
bun run simulate countdown.ram
```

## 🎯 Getting Started with Johnny C

### 1. Your First Program

Create a file called `hello.jcc`:

```c
// My first Johnny C program
int result;

result = 42;
halt;
```

### 2. Compile and Run

```bash
# Compile your program
bun run compile hello.jcc --print-vars

# This shows where your variables are stored:
# Variables:
#   result (int) -> RAM[900]

# Simulate the program
bun run simulate hello.ram
```

### 3. Add Some Logic

Update `hello.jcc` with conditionals:

```c
int x;
int y;
int max;

x = 15;
y = 23;

if (x > y) {
    max = x;
} else {
    max = y;
}

halt;
```

### 4. Explore Advanced Features

Try loops and complex expressions:

```c
int counter;
int total;
bool continue_loop;

counter = 1;
total = 0;
continue_loop = true;

while (continue_loop) {
    total = total + counter;
    counter = counter + 1;

    if (counter > 5) {
        continue_loop = false;
    }
}

halt;
```

### 5. Debug with Memory Maps

Use the debugging features to understand what's happening:

```bash
# Compile with full debugging info
bun run compile my_program.jcc --comments --print-vars --memmap debug.json

# This generates:
# - my_program.ram (the compiled program)
# - debug.json (detailed memory map)
# - debug.md (human-readable memory documentation)
```

## ✨ Language Features

### ✅ Currently Supported

- ✅ **Variable Declarations**: `int`, `bool` types
- ✅ **Arithmetic**: `+`, `-`, `*` operations
- ✅ **Comparisons**: `==`, `!=`, `<`, `>`, `<=`, `>=`
- ✅ **Boolean Logic**: `&&`, `||`, `!` operators
- ✅ **Control Flow**: `if`/`else`, `while` loops
- ✅ **Constants**: `true`, `false`, integer literals
- ✅ **Comments**: C-style `//` comments
- ✅ **Program Control**: `halt` statement

### 🚧 Planned Features

- 🚧 **Functions**: User-defined functions and procedures
- 🚧 **Arrays**: Array declarations and indexing
- 🚧 **Division**: Integer division operator `/`
- 🚧 **Modulo**: Remainder operator `%`
- 🚧 **For Loops**: `for` loop syntax
- 🚧 **String Type**: Basic string operations
- 🚧 **Input/Output**: Read/write operations

## 📊 Project Summary

### Johnny C Compiler (.jcc)

- **Johnny C Programs:** 11 example programs
- **Language Features:** Variables, arithmetic, conditionals, loops, booleans
- **Compilation Targets:** JOHNNY RAM assembly language
- **Memory Management:** Automatic variable allocation and optimization
- **Debugging Support:** Variable memory maps, inline comments, JSON/Markdown output

### JOHNNY RAM Programs (.ram)

- **Hand-written Programs:** 3 legacy assembly programs
- **Valid Programs:** 3/3 ✅
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
| **compile**    | `bun run compile <file>`  | Compile Johnny C (.jcc) to JOHNNY RAM   |
| **test**       | `bun test`                | Run all test suites with coverage       |
| **test:watch** | `bun test --watch`        | Run tests in watch mode                 |
| **docs**       | `bun run docs`            | Generate documentation for all programs |
| **validate**   | `bun run validate <file>` | Validate a specific .ram file           |
| **simulate**   | `bun run simulate <file>` | Run interactive simulation              |
| **clean**      | `bun run clean`           | Clean generated files                   |
| **dev**        | `bun run dev`             | Development mode (test watch)           |

### Johnny C Compiler Options

| Option            | Description                               | Example                                                  |
| ----------------- | ----------------------------------------- | -------------------------------------------------------- |
| `-o <file>`       | Specify output file                       | `bun run compile program.jcc -o output.ram`              |
| `--comments`      | Include inline comments in output         | `bun run compile program.jcc --comments`                 |
| `--print-vars`    | Print variable memory map to console      | `bun run compile program.jcc --print-vars`               |
| `--memmap <file>` | Generate memory map files (.json and .md) | `bun run compile program.jcc --memmap map.json`          |
| `--no-compatible` | Disable Johnny simulator compatibility    | `bun run compile program.jcc --comments --no-compatible` |
| `--help`          | Show compiler help                        | `bun run compile --help`                                 |

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
├── jcc/                        # Johnny C source programs (.jcc files)
│   ├── simple_add.jcc         # Basic arithmetic examples
│   ├── showcase.jcc           # Comprehensive feature demo
│   ├── countdown.jcc          # While loop examples
│   ├── factorial.jcc          # Advanced algorithms
│   └── *.ram                  # Compiled JOHNNY RAM files
├── scripts/                    # Legacy RAM programs and tests
│   ├── *.ram                  # Hand-written JOHNNY assembly
│   ├── *.test.ts              # Jest/Bun test files
│   └── *.md                   # Auto-generated docs
├── src/
│   ├── compiler/              # Johnny C compiler
│   │   ├── cli.ts             # Compiler command-line interface
│   │   ├── lexer.ts           # Lexical analysis (tokenization)
│   │   ├── parser.ts          # Syntax analysis (AST generation)
│   │   ├── ir.ts              # Intermediate representation
│   │   ├── codegen.ts         # Code generation (IR to JOHNNY)
│   │   ├── emitter.ts         # Final output formatting
│   │   └── memmap.ts          # Memory mapping and layout
│   ├── core/                  # Core simulator components
│   │   ├── opcodes.ts         # JOHNNY instruction definitions
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
└── tests/                     # Compiler and integration tests
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

## 🔧 How Johnny C Works

### Compilation Pipeline

Johnny C uses a multi-stage compilation process:

```
Johnny C (.jcc) → Lexer → Parser → IR Generator → Code Generator → Emitter → JOHNNY RAM (.ram)
```

1. **Lexical Analysis**: Converts source code into tokens
2. **Syntax Analysis**: Builds Abstract Syntax Tree (AST) from tokens
3. **IR Generation**: Creates Intermediate Representation with symbol table
4. **Memory Mapping**: Assigns memory addresses to variables
5. **Code Generation**: Converts IR to JOHNNY assembly instructions
6. **Emission**: Formats final output with optional comments

### Example Compilation

**Input (`example.jcc`):**

```c
int x;
int result;

x = 5;
result = x * 3;
halt;
```

**Output (`example.ram`):**

```
09150  // Initialize CONST_0 = 0
09151  // Initialize CONST_1 = 0
07151  // CONST_1 = 1
09901  // entry: x = 0
09900  // result = 0
09960  // _t0 = 0
07960  // _t0++
07960  // _t0++
07960  // _t0++
07960  // _t0++
07960  // _t0++
01960  // Load _t0
04901  // x = _t0
01901  // Load x
04961  // _t1 = x
09962  // _t2 = 0
01961  // Load _t1
04963  // _t3 = _t1
01962  // Load _t2
02963  // Add _t3
04962  // _t2 = _t2 + _t3
01961  // Load _t1
08961  // _t1--
06961  // Skip next if _t1 = 0
05016  // Jump to 016
01962  // Load _t2
04900  // result = _t2
10000  // Program end
```

**Memory Map:**

```
Variables:
  result (int) -> RAM[900]
  x (int) -> RAM[901]
Constants:
  CONST_0 -> RAM[150] = 0
  CONST_1 -> RAM[151] = 1
Temporary Variables:
  _t0 -> RAM[960]
  _t1 -> RAM[961]
  _t2 -> RAM[962]
  _t3 -> RAM[963]
```

### Optimization Features

- **Constant Propagation**: Small constants (≤10) compiled to efficient increment sequences
- **Dead Code Elimination**: Unused variables and expressions are optimized away
- **Register Allocation**: Efficient use of temporary memory locations
- **Loop Optimization**: While loops compiled to efficient jump patterns

## 🤝 Contributing

### For Johnny C Development

1. **Add Language Features:** Extend lexer, parser, and code generator
2. **Create Examples:** Add new `.jcc` programs demonstrating features
3. **Write Tests:** Test both compilation and execution
4. **Update Documentation:** Keep README and examples current

### For JOHNNY RAM Programs

1. **Add Programs:** Follow the 3-file pattern (.ram, .test.ts, auto-generated .md)
2. **Write Tests:** Use descriptive "should..." test names
3. **Generate Docs:** Run `bun run docs` after changes
4. **Test Everything:** Ensure `bun test` passes

## � Troubleshooting

### Common Johnny C Compilation Issues

**Error: "Parse error at line X, column Y: Expected ';' after variable declaration"**

```c
// ❌ Wrong
int x

// ✅ Correct
int x;
```

**Error: "Symbol 'variable' not found in memory map"**

```c
// ❌ Wrong - using undeclared variable
result = x + y;

// ✅ Correct - declare first
int x;
int y;
int result;
result = x + y;
```

**Error: "Compilation failed: Variable 'x' declared but never used"**

```c
// ❌ Wrong - unused variable
int x;
int y;
y = 5;

// ✅ Correct - use all declared variables or remove unused ones
int y;
y = 5;
```

### Johnny Simulator Compatibility Issues

**Problem: "Johnny simulator can't load the .ram file"**

Solution: Ensure you're using compatible mode (default):

```bash
# ✅ Compatible with Johnny simulator
bun run compile program.jcc

# ❌ Not compatible (has comment headers)
bun run compile program.jcc --comments --no-compatible
```

**Problem: "Variables aren't where I expect them in memory"**

Solution: Use `--print-vars` to see exact memory layout:

```bash
bun run compile program.jcc --print-vars
```

### Performance Issues

**Problem: "Multiplication is very slow"**

Johnny C uses repeated addition for multiplication. For best performance:

```c
// ✅ Fast - small constants
result = x * 3;

// ⚠️ Slower - large constants
result = x * 100;
```

**Problem: "Program takes too long to compile"**

For complex programs, the compiler generates many temporary variables. This is normal for:

- Complex expressions: `result = (a + b) * (c - d);`
- Nested conditions: Multiple levels of if/else
- Long loops: While loops with complex conditions

## �📚 Resources

### Johnny C Language

- **Language Guide:** This README contains the complete Johnny C reference
- **Example Programs:** See `jcc/` directory for comprehensive examples
- **Compiler Source:** Full source code in `src/compiler/`
- **Memory Layout:** Automatic variable allocation with debugging support

### JOHNNY Computer Architecture

- **JOHNNY Specification:** Classic educational computer architecture
- **Instruction Set:** 11 core instructions for educational computing
- **Memory Model:** 1000-word memory with accumulator-based operations
- **Simulation:** Full interactive simulation with step-by-step debugging

### Development Tools

- **Bun Runtime:** Fast TypeScript execution and testing
- **TypeScript:** Type-safe development with comprehensive tooling
- **Jest/Bun Testing:** Comprehensive test framework integration
- **Auto-Documentation:** Generates docs from tests and code analysis

### Learning Resources

- **Getting Started:** Follow the step-by-step guide above
- **Examples:** Start with `simple_add.jcc`, progress to `showcase.jcc`
- **Debugging:** Use `--print-vars` and `--comments` for learning
- **Simulation:** Run compiled programs in the interactive simulator

---

_Johnny C documentation maintained manually. JOHNNY RAM program analysis auto-generated with `bun run docs`._
