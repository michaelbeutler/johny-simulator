# Multiply Program

This program demonstrates multiplication using repeated addition in the JOHNNY RAM simulator.

## How to Use

### Browser Simulator
1. Load `multiply.ram` into the browser simulator
2. Manually set memory values:
   - `memory[100] = first number` (multiplicand, e.g., 3)
   - `memory[101] = second number` (multiplier, e.g., 4)
3. Run the program
4. Check `memory[102]` for the result (12)

### TypeScript Simulator
```bash
npm test # Includes multiply tests: 3×4=12, 7×8=56, zero handling
```

## Algorithm

The program implements multiplication as repeated addition:
- Initialize result to 0
- Add the multiplicand to result, multiplier times
- Uses a loop counter to track iterations

## Memory Layout
- **Address 100**: Multiplicand (first number)
- **Address 101**: Multiplier (second number, also used as counter)
- **Address 102**: Result (accumulated sum)
- **Address 103**: Temporary storage

## Examples
- `3 × 4 = 12`: Add 3 to itself 4 times (3+3+3+3)
- `7 × 8 = 56`: Add 7 to itself 8 times
- `5 × 0 = 0`: Zero multiplier results in zero

<!-- AUTO_GENERATED_DOCS_START -->
<!-- Everything below this line will be replaced by auto-generated documentation -->

**Status:** ✅ VALID

**Tests:** ✅ 5/5 passed

## 🧪 Test Cases

- ✅ should validate multiplication program
- ✅ should multiply 3 × 4 = 12
- ✅ should multiply 7 × 8 = 56
- ✅ should handle multiplication by zero
- ✅ should handle large numbers

## Program Statistics

- **Instructions:** 10
- **Data Words:** 0
- **Memory Used:** 0-9
- **Has HALT:** Yes

## ⚠️ Warnings

- HLT instruction ignores operand; received 102

## 📋 Program Disassembly

```
Addr | Value | Instruction  | Comment
-----|-------|--------------|--------
000 | 09102 | NULL 102     | mem[102] = 0
001 | 06101 | TST 101      | Skip next if mem[101] = 0
002 | 05004 | JMP 004      | Jump to address 4
003 | 10000 | HLT 000      | Halt program
004 | 01102 | TAKE 102     | Load mem[102] into ACC
005 | 02100 | ADD 100      | ACC = ACC + mem[100]
006 | 04102 | SAVE 102     | mem[102] = ACC
007 | 08101 | DEC 101      | mem[101] = mem[101] - 1
008 | 05001 | JMP 001      | Jump to address 1
009 | 10000 | HLT 000      | Halt program
010 | 00000 | DATA         | Empty
011 | 00000 | DATA         | Empty
```

## 💾 Source Code

```
09102
06101
05004
10000
01102
02100
04102
08101
05001
10000
```
