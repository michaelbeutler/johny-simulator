# Integer Division (IDIV) Program

This program implements integer division using repeated subtraction, returning both quotient and remainder.

## How to Use

### Browser Simulator

1. Load `idiv.ram` into the browser simulator
2. Set input values:
   - `memory[0] = dividend` (number to be divided)
   - `memory[1] = divisor` (number to divide by)
3. Run the program
4. Results will be stored at:
   - `memory[2] = quotient` (whole number result)
   - `memory[3] = remainder` (leftover amount)

### TypeScript Simulator

```bash
npm test # Includes IDIV tests for various division scenarios
```

## Algorithm

The program implements the mathematical relationship: **z : n = q Rest r**

Where: **q × n + r = z**

- z = dividend (input at address 100)
- n = divisor (input at address 101)
- q = quotient (output at address 102)
- r = remainder (output at address 103)

### Steps:

1. Initialize quotient to 0
2. Copy dividend to remainder
3. Repeatedly subtract divisor from remainder
4. Increment quotient for each successful subtraction
5. Stop when remainder becomes less than divisor
6. Final remainder is the division remainder

## Memory Layout

- **Address 0**: Input dividend (z)
- **Address 1**: Input divisor (n)
- **Address 2**: Output quotient (q)
- **Address 3**: Output remainder (r)
- **Address 4**: Temporary storage

## Examples

### Example 1: 17 ÷ 5

- Input: dividend=17, divisor=5
- Output: quotient=3, remainder=2
- Verification: 3 × 5 + 2 = 17 ✓

### Example 2: 15 ÷ 3

- Input: dividend=15, divisor=3
- Output: quotient=5, remainder=0
- Verification: 5 × 3 + 0 = 15 ✓

### Example 3: 7 ÷ 10

- Input: dividend=7, divisor=10
- Output: quotient=0, remainder=7
- Verification: 0 × 10 + 7 = 7 ✓

## Use Cases

- Integer arithmetic operations
- Modular arithmetic calculations
- Resource distribution problems
- Mathematical computations requiring both quotient and remainder
- Educational demonstrations of division algorithms

## Implementation Notes

- Uses repeated subtraction method
- Handles edge cases like dividend < divisor
- Leverages JOHNNY's underflow protection (negative results become 0)
- Works with any positive integer inputs within JOHNNY's range
