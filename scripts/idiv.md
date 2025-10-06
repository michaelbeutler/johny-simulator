# Integer Division Program (IDIV)

This program implements integer division with remainder using repeated subtraction in JOHNNY RAM. It handles division by zero gracefully and uses only the basic instruction set.

## Algorithm

The program performs division `z ÷ n = q remainder r` where:

- `z` (dividend) is stored at address 100
- `n` (divisor) is stored at address 101
- `q` (quotient) is output at address 102
- `r` (remainder) is output at address 103

### Key Innovation: The `r + 1 - n` Test

Since negative results are saturated to 0, a simple `r - n` test would give 0 for both `r < n` and `r = n`. The clever trick `r + 1 - n` distinguishes these cases:

- If `r < n` ⇒ `r + 1 - n` becomes 0 → **Stop division**
- If `r = n` ⇒ `r + 1 - n` becomes 1 → **Continue for one more iteration**

## Memory Layout

| Address | Variable      | Description                       |
| ------- | ------------- | --------------------------------- |
| 100     | z (dividend)  | Input value to be divided         |
| 101     | n (divisor)   | Input value to divide by          |
| 102     | q (quotient)  | Output: result of division        |
| 103     | r (remainder) | Output: remainder after division  |
| 104     | temp          | Temporary storage for `r + 1 - n` |
| 105     | constant 1    | Always contains value 1           |

## Usage Example

**Input:** 17 ÷ 5

```
Address 100: 00017  (dividend)
Address 101: 00005  (divisor)
Address 105: 00001  (constant 1)
```

**Output:**

```
Address 102: 00003  (quotient: 17 ÷ 5 = 3)
Address 103: 00002  (remainder: 17 mod 5 = 2)
```

## Special Cases

- **Division by Zero:** If divisor (address 101) is 0, program sets quotient = 0 and remainder = dividend, then halts safely.

## Program Flow

```
1. Initialize quotient q = 0
2. Set remainder r = dividend z
3. Check if divisor n = 0 (handle special case)
4. Main loop:
   - Test if r + 1 - n = 0 (means r < n, so done)
   - If not done: r = r - n, q = q + 1
   - Repeat until r < n
5. Results in addresses 102 (quotient) and 103 (remainder)
```

<!-- AUTO_GENERATED_DOCS_START -->
<!-- Everything below this line will be replaced by auto-generated documentation -->

**Status:** ✅ VALID

**Tests:** ✅ 12/12 passed

## 🧪 Test Cases

- ✅ should validate IDIV program
- ✅ should divide 15 by 3 = 5 remainder 0
- ✅ should divide 17 by 5 = 3 remainder 2
- ✅ should divide 7 by 10 = 0 remainder 7
- ✅ should divide 20 by 1 = 20 remainder 0
- ✅ should divide 0 by 5 = 0 remainder 0
- ✅ should handle division by 1
- ✅ should handle perfect division
- ✅ should handle large remainder
- ✅ should handle same dividend and divisor
- ✅ should handle single digit operations
- ✅ should handle division by zero gracefully

## Program Statistics

- **Instructions:** 23
- **Data Words:** 0
- **Memory Used:** 0-22
- **Has HALT:** Yes

## ⚠️ Warnings

- HLT instruction ignores operand; received 100
- HLT instruction ignores operand; received 103
- HLT instruction ignores operand; received 103
- HLT instruction ignores operand; received 100

## 📋 Program Disassembly

```
Addr | Value | Instruction  | Comment
-----|-------|--------------|--------
000 | 09102 | NULL 102     | mem[102] = 0
001 | 01100 | TAKE 100     | Load mem[100] into ACC
002 | 04103 | SAVE 103     | mem[103] = ACC
003 | 06101 | TST 101      | Skip next if mem[101] = 0
004 | 05006 | JMP 006      | Jump to address 6
005 | 05019 | JMP 019      | Jump to address 19
006 | 01103 | TAKE 103     | Load mem[103] into ACC
007 | 02105 | ADD 105      | ACC = ACC + mem[105]
008 | 03101 | SUB 101      | ACC = ACC - mem[101]
009 | 04104 | SAVE 104     | mem[104] = ACC
010 | 06104 | TST 104      | Skip next if mem[104] = 0
011 | 05013 | JMP 013      | Jump to address 13
012 | 05018 | JMP 018      | Jump to address 18
013 | 01103 | TAKE 103     | Load mem[103] into ACC
014 | 03101 | SUB 101      | ACC = ACC - mem[101]
015 | 04103 | SAVE 103     | mem[103] = ACC
016 | 07102 | INC 102      | mem[102] = mem[102] + 1
017 | 05006 | JMP 006      | Jump to address 6
018 | 10000 | HLT 000      | Halt program
019 | 09102 | NULL 102     | mem[102] = 0
020 | 01100 | TAKE 100     | Load mem[100] into ACC
021 | 04103 | SAVE 103     | mem[103] = ACC
022 | 10000 | HLT 000      | Halt program
023 | 00000 | DATA         | Empty
024 | 00000 | DATA         | Empty
```

## 💾 Source Code

```
09102
01100
04103
06101
05006
05019
01103
02105
03101
04104
06104
05013
05018
01103
03101
04103
07102
05006
10000
09102
01100
04103
10000
```
