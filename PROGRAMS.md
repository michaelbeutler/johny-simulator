# JOHNNY RAM Programs

_Auto-generated documentation_

## 📊 Summary

- **Total Programs:** 5
- **Valid Programs:** 5/5
- **Total Instructions:** 107

## 📁 Programs

| Program                           | Status | Instructions | Tests | Description      |
| --------------------------------- | ------ | ------------ | ----- | ---------------- |
| [sieve](scripts/sieve.md)         | ✅     | 35           | 4/4   | _Auto-generated_ |
| [addition](scripts/addition.md)   | ✅     | 4            | 5/5   | _Auto-generated_ |
| [idiv](scripts/idiv.md)           | ✅     | 14           | 11/11 | _Auto-generated_ |
| [countdown](scripts/countdown.md) | ✅     | 44           | 4/4   | _Auto-generated_ |
| [multiply](scripts/multiply.md)   | ✅     | 10           | 5/5   | _Auto-generated_ |

## 🛠️ JOHNNY Instruction Set

| Opcode | Name  | Description                  |
| ------ | ----- | ---------------------------- |
| 00     | FETCH | Fetch instruction (internal) |
| 01     | TAKE  | Load mem[addr] into ACC      |
| 02     | ADD   | ACC = ACC + mem[addr]        |
| 03     | SUB   | ACC = ACC - mem[addr]        |
| 04     | SAVE  | mem[addr] = ACC              |
| 05     | JMP   | Jump to addr                 |
| 06     | TST   | Skip next if mem[addr] = 0   |
| 07     | INC   | mem[addr] = mem[addr] + 1    |
| 08     | DEC   | mem[addr] = mem[addr] - 1    |
| 09     | NULL  | mem[addr] = 0                |
| 10     | HLT   | Halt program                 |
