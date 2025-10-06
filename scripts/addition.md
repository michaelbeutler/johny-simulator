# Addition Program

This program demonstrates basic addition in the JOHNNY RAM simulator.

## How to Use

### Browser Simulator
1. Load `addition.ram` into the browser simulator
2. Manually set memory values:
   - `memory[100] = first number` (e.g., 15)
   - `memory[101] = second number` (e.g., 25)
3. Run the program
4. Check `memory[102]` for the result (40)

### TypeScript Simulator
```bash
npm test # Includes addition tests: 15+25=40, boundary conditions, large numbers
```

## Algorithm

The program uses three simple instructions:
1. **TAKE**: Load first number from memory[100] into accumulator
2. **ADD**: Add second number from memory[101] to accumulator
3. **SAVE**: Store result from accumulator to memory[102]

## Memory Layout
- **Address 100**: First operand (addend)
- **Address 101**: Second operand (addend)
- **Address 102**: Result (sum)

## Examples
- `15 + 25 = 40`
- `0 + 100 = 100`
- `9999 + 9999 = 19998` (within JOHNNY's 19999 limit)

<!-- AUTO_GENERATED_DOCS_START -->
<!-- Everything below this line will be replaced by auto-generated documentation -->

**Status:** ✅ VALID

**Tests:** ✅ 5/5 passed

## 🧪 Test Cases

- ✅ should validate addition program
- ✅ should add 15 + 25 = 40
- ✅ should add using embedded data (15 + 25 = 40)
- ✅ should add negative simulation (0 - bounded)
- ✅ should handle large numbers

## Program Statistics

- **Instructions:** 4
- **Data Words:** 0
- **Memory Used:** 0-3
- **Has HALT:** Yes

## ⚠️ Warnings

- HLT instruction ignores operand; received 100

## 📋 Program Disassembly

```
Addr | Value | Instruction  | Comment
-----|-------|--------------|--------
000 | 01100 | TAKE 100     | Load mem[100] into ACC
001 | 02101 | ADD 101      | ACC = ACC + mem[101]
002 | 04102 | SAVE 102     | mem[102] = ACC
003 | 10000 | HLT 000      | Halt program
004 | 00000 | DATA         | Empty
005 | 00000 | DATA         | Empty
```

## 💾 Source Code

```
01100
02101
04102
10000
```
