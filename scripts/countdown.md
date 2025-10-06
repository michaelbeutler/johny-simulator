# Countdown Program

This program demonstrates a simple countdown loop that decrements a number until it reaches zero.

## How to Use

### Browser Simulator
1. Load `countdown.ram` into the browser simulator
2. Manually set the starting value:
   - `memory[100] = starting number` (e.g., 5)
3. Run the program
4. Watch as the program decrements the value in `memory[100]` until it reaches 0
5. The program will halt when the countdown reaches 0

### TypeScript Simulator
```bash
npm test # Includes countdown tests: from 5→0, from 10→0, zero handling
```

## Algorithm

The program uses a simple loop structure:
1. Decrement the value at memory[100]
2. Test if the value is zero
3. If not zero, jump back to step 1
4. If zero, continue to halt

## Memory Layout
- **Address 100**: Counter value (decrements from initial value to 0)

## Examples
- Start with 5: 5 → 4 → 3 → 2 → 1 → 0 (halt)
- Start with 10: 10 → 9 → 8 → ... → 1 → 0 (halt)
- Start with 0: Immediately halt (no countdown needed)

## Use Cases
- Timing delays
- Loop counters
- Demonstration of conditional branching
- Basic program flow control

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
