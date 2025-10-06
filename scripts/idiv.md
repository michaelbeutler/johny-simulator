# IDIV Program

<!-- AUTO_GENERATED_DOCS_START -->
<!-- Everything below this line will be replaced by auto-generated documentation -->

**Status:** ✅ VALID

**Tests:** ✅ 11/11 passed

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

## Program Statistics

- **Instructions:** 14
- **Data Words:** 0
- **Memory Used:** 0-13
- **Has HALT:** Yes

## ⚠️ Warnings

- HLT instruction ignores operand; received 100
- HLT instruction ignores operand; received 103
- HLT instruction ignores operand; received 103

## 📋 Program Disassembly

```
Addr | Value | Instruction  | Comment
-----|-------|--------------|--------
000 | 09102 | NULL 102     | mem[102] = 0
001 | 01100 | TAKE 100     | Load mem[100] into ACC
002 | 04103 | SAVE 103     | mem[103] = ACC
003 | 01103 | TAKE 103     | Load mem[103] into ACC
004 | 03101 | SUB 101      | ACC = ACC - mem[101]
005 | 04104 | SAVE 104     | mem[104] = ACC
006 | 06104 | TST 104      | Skip next if mem[104] = 0
007 | 05012 | JMP 012      | Jump to address 12
008 | 01103 | TAKE 103     | Load mem[103] into ACC
009 | 03101 | SUB 101      | ACC = ACC - mem[101]
010 | 04103 | SAVE 103     | mem[103] = ACC
011 | 07102 | INC 102      | mem[102] = mem[102] + 1
012 | 05003 | JMP 003      | Jump to address 3
013 | 10000 | HLT 000      | Halt program
014 | 00000 | DATA         | Empty
015 | 00000 | DATA         | Empty
```

## 💾 Source Code

```
09102
01100
04103
01103
03101
04104
06104
05012
01103
03101
04103
07102
05003
10000
00000
```
