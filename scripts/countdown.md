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
- ✅ should execute without errors
- ✅ should countdown from 10 to 0 and store all values
- ✅ should store countdown sequence correctly

## Program Statistics

- **Instructions:** 44
- **Data Words:** 0
- **Memory Used:** 0-43
- **Has HALT:** Yes

## ⚠️ Warnings

- HLT instruction ignores operand; received 100
- HLT instruction ignores operand; received 100
- HLT instruction ignores operand; received 100
- HLT instruction ignores operand; received 100
- HLT instruction ignores operand; received 100
- HLT instruction ignores operand; received 100
- HLT instruction ignores operand; received 100
- HLT instruction ignores operand; received 100
- HLT instruction ignores operand; received 100
- HLT instruction ignores operand; received 100
- HLT instruction ignores operand; received 100

## 📋 Program Disassembly

```
Addr | Value | Instruction  | Comment
-----|-------|--------------|--------
000 | 09100 | NULL 100     | mem[100] = 0
001 | 07100 | INC 100      | mem[100] = mem[100] + 1
002 | 07100 | INC 100      | mem[100] = mem[100] + 1
003 | 07100 | INC 100      | mem[100] = mem[100] + 1
004 | 07100 | INC 100      | mem[100] = mem[100] + 1
005 | 07100 | INC 100      | mem[100] = mem[100] + 1
006 | 07100 | INC 100      | mem[100] = mem[100] + 1
007 | 07100 | INC 100      | mem[100] = mem[100] + 1
008 | 07100 | INC 100      | mem[100] = mem[100] + 1
009 | 07100 | INC 100      | mem[100] = mem[100] + 1
010 | 07100 | INC 100      | mem[100] = mem[100] + 1
011 | 01100 | TAKE 100     | Load mem[100] into ACC
012 | 04050 | SAVE 050     | mem[50] = ACC
013 | 08100 | DEC 100      | mem[100] = mem[100] - 1
014 | 01100 | TAKE 100     | Load mem[100] into ACC
015 | 04051 | SAVE 051     | mem[51] = ACC
016 | 08100 | DEC 100      | mem[100] = mem[100] - 1
017 | 01100 | TAKE 100     | Load mem[100] into ACC
018 | 04052 | SAVE 052     | mem[52] = ACC
019 | 08100 | DEC 100      | mem[100] = mem[100] - 1
020 | 01100 | TAKE 100     | Load mem[100] into ACC
021 | 04053 | SAVE 053     | mem[53] = ACC
022 | 08100 | DEC 100      | mem[100] = mem[100] - 1
023 | 01100 | TAKE 100     | Load mem[100] into ACC
024 | 04054 | SAVE 054     | mem[54] = ACC
025 | 08100 | DEC 100      | mem[100] = mem[100] - 1
026 | 01100 | TAKE 100     | Load mem[100] into ACC
027 | 04055 | SAVE 055     | mem[55] = ACC
028 | 08100 | DEC 100      | mem[100] = mem[100] - 1
029 | 01100 | TAKE 100     | Load mem[100] into ACC
030 | 04056 | SAVE 056     | mem[56] = ACC
031 | 08100 | DEC 100      | mem[100] = mem[100] - 1
032 | 01100 | TAKE 100     | Load mem[100] into ACC
033 | 04057 | SAVE 057     | mem[57] = ACC
034 | 08100 | DEC 100      | mem[100] = mem[100] - 1
035 | 01100 | TAKE 100     | Load mem[100] into ACC
036 | 04058 | SAVE 058     | mem[58] = ACC
037 | 08100 | DEC 100      | mem[100] = mem[100] - 1
038 | 01100 | TAKE 100     | Load mem[100] into ACC
039 | 04059 | SAVE 059     | mem[59] = ACC
040 | 08100 | DEC 100      | mem[100] = mem[100] - 1
041 | 01100 | TAKE 100     | Load mem[100] into ACC
042 | 04060 | SAVE 060     | mem[60] = ACC
043 | 10000 | HLT 000      | Halt program
044 | 00000 | DATA         | Empty
045 | 00000 | DATA         | Empty
```

## 💾 Source Code

```
09100
07100
07100
07100
07100
07100
07100
07100
07100
07100
07100
01100
04050
08100
01100
04051
08100
01100
04052
08100
01100
04053
08100
01100
04054
08100
01100
04055
08100
01100
04056
08100
01100
04057
08100
01100
04058
08100
01100
04059
08100
01100
04060
10000
```
