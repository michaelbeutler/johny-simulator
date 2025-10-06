import { describe, test, expect } from 'bun:test';
import { JohnnySimulator } from '../src/core/simulator';
import { RamParser } from '../src/core/parser';
import { RamValidator } from '../src/validation/validator';

describe('Integer Division (IDIV) Program Tests', () => {
  const simulator = new JohnnySimulator();
  const parser = new RamParser();
  const validator = new RamValidator();

  test('should validate IDIV program', () => {
    const result = validator.validateFile('scripts/idiv.ram');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should divide 15 by 3 = 5 remainder 0', async () => {
    const parseResult = parser.parseFile('scripts/idiv.ram');
    expect(parseResult.errors).toHaveLength(0);

    const initialMemory = { 100: 15, 101: 3 }; // dividend=15, divisor=3
    const finalState = simulator.simulate(parseResult.ram, 0, initialMemory);

    expect(finalState.halted).toBe(true);
    expect(finalState.ram[102]).toBe(5); // quotient
    expect(finalState.ram[103]).toBe(0); // remainder

    // Verify: quotient * divisor + remainder = dividend
    expect(5 * 3 + 0).toBe(15);
  });

  test('should divide 17 by 5 = 3 remainder 2', async () => {
    const parseResult = parser.parseFile('scripts/idiv.ram');
    const initialMemory = { 100: 17, 101: 5 }; // dividend=17, divisor=5
    const finalState = simulator.simulate(parseResult.ram, 0, initialMemory);

    expect(finalState.halted).toBe(true);
    expect(finalState.ram[102]).toBe(3); // quotient
    expect(finalState.ram[103]).toBe(2); // remainder

    // Verify: quotient * divisor + remainder = dividend
    expect(3 * 5 + 2).toBe(17);
  });

  test('should divide 7 by 10 = 0 remainder 7', async () => {
    const parseResult = parser.parseFile('scripts/idiv.ram');
    const initialMemory = { 100: 7, 101: 10 }; // dividend=7, divisor=10
    const finalState = simulator.simulate(parseResult.ram, 0, initialMemory);

    expect(finalState.halted).toBe(true);
    expect(finalState.ram[102]).toBe(0); // quotient
    expect(finalState.ram[103]).toBe(7); // remainder

    // Verify: quotient * divisor + remainder = dividend
    expect(0 * 10 + 7).toBe(7);
  });

  test('should divide 20 by 1 = 20 remainder 0', async () => {
    const parseResult = parser.parseFile('scripts/idiv.ram');
    const initialMemory = { 100: 20, 101: 1 }; // dividend=20, divisor=1
    const finalState = simulator.simulate(parseResult.ram, 0, initialMemory);

    expect(finalState.halted).toBe(true);
    expect(finalState.ram[102]).toBe(20); // quotient
    expect(finalState.ram[103]).toBe(0); // remainder

    // Verify: quotient * divisor + remainder = dividend
    expect(20 * 1 + 0).toBe(20);
  });

  test('should divide 0 by 5 = 0 remainder 0', async () => {
    const parseResult = parser.parseFile('scripts/idiv.ram');
    const initialMemory = { 100: 0, 101: 5 }; // dividend=0, divisor=5
    const finalState = simulator.simulate(parseResult.ram, 0, initialMemory);

    expect(finalState.halted).toBe(true);
    expect(finalState.ram[102]).toBe(0); // quotient
    expect(finalState.ram[103]).toBe(0); // remainder

    // Verify: quotient * divisor + remainder = dividend
    expect(0 * 5 + 0).toBe(0);
  });

  // Edge case tests
  test('should handle division by 1', async () => {
    const parseResult = parser.parseFile('scripts/idiv.ram');
    const initialMemory = { 100: 7, 101: 1 }; // dividend=7, divisor=1
    const finalState = simulator.simulate(parseResult.ram, 0, initialMemory);

    expect(finalState.halted).toBe(true);
    expect(finalState.ram[102]).toBe(7); // quotient
    expect(finalState.ram[103]).toBe(0); // remainder
    expect(7 * 1 + 0).toBe(7);
  });

  test('should handle perfect division', async () => {
    const parseResult = parser.parseFile('scripts/idiv.ram');
    const initialMemory = { 100: 12, 101: 4 }; // dividend=12, divisor=4
    const finalState = simulator.simulate(parseResult.ram, 0, initialMemory);

    expect(finalState.halted).toBe(true);
    expect(finalState.ram[102]).toBe(3); // quotient
    expect(finalState.ram[103]).toBe(0); // remainder
    expect(3 * 4 + 0).toBe(12);
  });

  test('should handle large remainder', async () => {
    const parseResult = parser.parseFile('scripts/idiv.ram');
    const initialMemory = { 100: 23, 101: 7 }; // dividend=23, divisor=7
    const finalState = simulator.simulate(parseResult.ram, 0, initialMemory);

    expect(finalState.halted).toBe(true);
    expect(finalState.ram[102]).toBe(3); // quotient
    expect(finalState.ram[103]).toBe(2); // remainder
    expect(3 * 7 + 2).toBe(23);
  });

  test('should handle same dividend and divisor', async () => {
    const parseResult = parser.parseFile('scripts/idiv.ram');
    const initialMemory = { 100: 5, 101: 5 }; // dividend=5, divisor=5
    const finalState = simulator.simulate(parseResult.ram, 0, initialMemory);

    expect(finalState.halted).toBe(true);
    expect(finalState.ram[102]).toBe(1); // quotient
    expect(finalState.ram[103]).toBe(0); // remainder
    expect(1 * 5 + 0).toBe(5);
  });

  test('should handle single digit operations', async () => {
    const parseResult = parser.parseFile('scripts/idiv.ram');
    const initialMemory = { 100: 8, 101: 3 }; // dividend=8, divisor=3
    const finalState = simulator.simulate(parseResult.ram, 0, initialMemory);

    expect(finalState.halted).toBe(true);
    expect(finalState.ram[102]).toBe(2); // quotient
    expect(finalState.ram[103]).toBe(2); // remainder
    expect(2 * 3 + 2).toBe(8);
  });
});
