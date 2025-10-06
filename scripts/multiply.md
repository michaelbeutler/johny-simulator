# MULTIPLY Program

**Status:** ✅ VALID

**Tests:** ✅ 4/4 passed

## Program Statistics

- **Instructions:** 10
- **Data Words:** 0
- **Memory Used:** 0-9
- **Has HALT:** Yes

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
