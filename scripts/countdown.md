# Countdown Program

This program implements a countdown from 10 to 0, storing all countdown values in consecutive memory locations.

## How to Use

### Browser Simulator

1. Load `countdown.ram` into the browser simulator
2. Run the program (no initial setup required)
3. Check memory addresses 50-60 after execution to see the stored countdown values

### TypeScript Simulator

```bash
npm test # Includes countdown tests for the full sequence storage
```

## Algorithm

The program performs the following steps:

1. Initialize counter to 10 using multiple INC operations
2. Store current counter value at address 50 + offset
3. Decrement counter
4. Repeat store and decrement for each value from 10 down to 0
5. Halt

## Memory Layout

- **Address 100**: Counter value (starts at 10, decrements to 0)
- **Address 50**: Stores value 10
- **Address 51**: Stores value 9
- **Address 52**: Stores value 8
- **Address 53**: Stores value 7
- **Address 54**: Stores value 6
- **Address 55**: Stores value 5
- **Address 56**: Stores value 4
- **Address 57**: Stores value 3
- **Address 58**: Stores value 2
- **Address 59**: Stores value 1
- **Address 60**: Stores value 0

## Examples

After execution:

- ADR 50 == 10
- ADR 51 == 9
- ADR 52 == 8
- ...
- ADR 60 == 0

## Use Cases

- Countdown sequence storage
- Memory initialization patterns
- Sequential data processing
- Demonstration of systematic memory operations

<!-- AUTO_GENERATED_DOCS_START -->
<!-- Everything below this line will be replaced by auto-generated documentation -->

**Status:** ✅ VALID

**Tests:** ✅ 4/4 passed

## 🧪 Test Cases

- ✅ should validate countdown program
- ✅ should countdown from 5 to 0
- ✅ should countdown from 10 to 0
- ✅ should handle zero initial value

## Program Statistics

- **Instructions:** 4
- **Data Words:** 0
- **Memory Used:** 0-3
- **Has HALT:** Yes

## 📋 Program Disassembly

```
Addr | Value | Instruction  | Comment
-----|-------|--------------|--------
000 | 08100 | DEC 100      | mem[100] = mem[100] - 1
001 | 06100 | TST 100      | Skip next if mem[100] = 0
002 | 05000 | JMP 000      | Jump to address 0
003 | 10000 | HLT 000      | Halt program
004 | 00000 | DATA         | Empty
005 | 00000 | DATA         | Empty
```

## 💾 Source Code

```
08100
06100
05000
10000
```
