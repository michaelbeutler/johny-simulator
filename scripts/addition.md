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

**Tests:** ✅ 9/9 passed

## 🧪 Test Cases

- ✅ should validate addition program
- ✅ should add 15 + 25 = 40
- ✅ should add using embedded data (15 + 25 = 40)
- ✅ should add negative simulation (0 - bounded)
- ✅ should handle large numbers
- ✅ should handle overflow saturation at MAX_VALUE
- ✅ should handle maximum values addition
- ✅ should handle zero plus zero
- ✅ should handle single operand non-zero

## Program Statistics

- **Instructions:** 4
- **Data Words:** 3
- **Memory Used:** 0-102
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
006 | 00000 | DATA         | Empty
007 | 00000 | DATA         | Empty
008 | 00000 | DATA         | Empty
009 | 00000 | DATA         | Empty
010 | 00000 | DATA         | Empty
011 | 00000 | DATA         | Empty
012 | 00000 | DATA         | Empty
013 | 00000 | DATA         | Empty
014 | 00000 | DATA         | Empty
015 | 00000 | DATA         | Empty
016 | 00000 | DATA         | Empty
017 | 00000 | DATA         | Empty
018 | 00000 | DATA         | Empty
019 | 00000 | DATA         | Empty
020 | 00000 | DATA         | Empty
021 | 00000 | DATA         | Empty
022 | 00000 | DATA         | Empty
023 | 00000 | DATA         | Empty
024 | 00000 | DATA         | Empty
025 | 00000 | DATA         | Empty
026 | 00000 | DATA         | Empty
027 | 00000 | DATA         | Empty
028 | 00000 | DATA         | Empty
029 | 00000 | DATA         | Empty
030 | 00000 | DATA         | Empty
031 | 00000 | DATA         | Empty
032 | 00000 | DATA         | Empty
033 | 00000 | DATA         | Empty
034 | 00000 | DATA         | Empty
035 | 00000 | DATA         | Empty
036 | 00000 | DATA         | Empty
037 | 00000 | DATA         | Empty
038 | 00000 | DATA         | Empty
039 | 00000 | DATA         | Empty
040 | 00000 | DATA         | Empty
041 | 00000 | DATA         | Empty
042 | 00000 | DATA         | Empty
043 | 00000 | DATA         | Empty
044 | 00000 | DATA         | Empty
045 | 00000 | DATA         | Empty
046 | 00000 | DATA         | Empty
047 | 00000 | DATA         | Empty
048 | 00000 | DATA         | Empty
049 | 00000 | DATA         | Empty
050 | 00000 | DATA         | Empty
051 | 00000 | DATA         | Empty
052 | 00000 | DATA         | Empty
053 | 00000 | DATA         | Empty
054 | 00000 | DATA         | Empty
055 | 00000 | DATA         | Empty
056 | 00000 | DATA         | Empty
057 | 00000 | DATA         | Empty
058 | 00000 | DATA         | Empty
059 | 00000 | DATA         | Empty
060 | 00000 | DATA         | Empty
061 | 00000 | DATA         | Empty
062 | 00000 | DATA         | Empty
063 | 00000 | DATA         | Empty
064 | 00000 | DATA         | Empty
065 | 00000 | DATA         | Empty
066 | 00000 | DATA         | Empty
067 | 00000 | DATA         | Empty
068 | 00000 | DATA         | Empty
069 | 00000 | DATA         | Empty
070 | 00000 | DATA         | Empty
071 | 00000 | DATA         | Empty
072 | 00000 | DATA         | Empty
073 | 00000 | DATA         | Empty
074 | 00000 | DATA         | Empty
075 | 00000 | DATA         | Empty
076 | 00000 | DATA         | Empty
077 | 00000 | DATA         | Empty
078 | 00000 | DATA         | Empty
079 | 00000 | DATA         | Empty
080 | 00000 | DATA         | Empty
081 | 00000 | DATA         | Empty
082 | 00000 | DATA         | Empty
083 | 00000 | DATA         | Empty
084 | 00000 | DATA         | Empty
085 | 00000 | DATA         | Empty
086 | 00000 | DATA         | Empty
087 | 00000 | DATA         | Empty
088 | 00000 | DATA         | Empty
089 | 00000 | DATA         | Empty
090 | 00000 | DATA         | Empty
091 | 00000 | DATA         | Empty
092 | 00000 | DATA         | Empty
093 | 00000 | DATA         | Empty
094 | 00000 | DATA         | Empty
095 | 00000 | DATA         | Empty
096 | 00000 | DATA         | Empty
097 | 00000 | DATA         | Empty
098 | 00000 | DATA         | Empty
099 | 00000 | DATA         | Empty
100 | 00015 | DATA         | Value: 15
```

## 💾 Source Code

```
01100
02101
04102
10000
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
15
25
25
```
