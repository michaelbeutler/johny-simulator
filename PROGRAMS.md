# JOHNNY RAM Programs

*Auto-generated documentation*

## 📊 Summary

- **Total Programs:** 4
- **Valid Programs:** 4/4
- **Total Instructions:** 36

## 📁 Programs

| Program | Status | Instructions | Tests | Description |
|---------|--------|--------------|-------|-------------|
| [sieve](scripts/sieve.md) | ✅ | 18 | 4/4 | *Auto-generated* |
| [addition](scripts/addition.md) | ✅ | 4 | 5/5 | *Auto-generated* |
| [countdown](scripts/countdown.md) | ✅ | 4 | 4/4 | *Auto-generated* |
| [multiply](scripts/multiply.md) | ✅ | 10 | 5/5 | *Auto-generated* |

## 🛠️ JOHNNY Instruction Set

| Opcode | Name | Description |
|--------|------|-------------|
| 00 | FETCH | Fetch instruction (internal) |
| 01 | TAKE | Load mem[addr] into ACC |
| 02 | ADD | ACC = ACC + mem[addr] |
| 03 | SUB | ACC = ACC - mem[addr] |
| 04 | SAVE | mem[addr] = ACC |
| 05 | JMP | Jump to addr |
| 06 | TST | Skip next if mem[addr] = 0 |
| 07 | INC | mem[addr] = mem[addr] + 1 |
| 08 | DEC | mem[addr] = mem[addr] - 1 |
| 09 | NULL | mem[addr] = 0 |
| 10 | HLT | Halt program |
