# COUNTDOWN Program

**Status:** ✅ VALID

**Tests:** ✅ 4/4 passed

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
