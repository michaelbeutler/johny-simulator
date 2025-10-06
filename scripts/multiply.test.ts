import { describe, test, expect } from 'bun:test';
import { JohnnySimulator } from '../src/core/simulator';
import { RamParser } from '../src/core/parser';
import { RamValidator } from '../src/validation/validator';

describe('Multiplication Program Tests', () => {
  const simulator = new JohnnySimulator();
  const parser = new RamParser();
  const validator = new RamValidator();

  test('should validate multiplication program', () => {
    const result = validator.validateFile('scripts/multiply.ram');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should multiply 3 × 4 = 12', async () => {
    const parseResult = parser.parseFile('scripts/multiply.ram');
    expect(parseResult.errors).toHaveLength(0);

    const initialMemory = { 100: 3, 101: 4 };
    const finalState = simulator.simulate(parseResult.ram, 0, initialMemory);

    expect(finalState.halted).toBe(true);
    expect(finalState.ram[102]).toBe(12); // Result should be 12
    expect(finalState.ram[101]).toBe(0); // Multiplier should be 0
    expect(finalState.steps).toBeGreaterThan(0);
  });

  test('should multiply 7 × 8 = 56', async () => {
    const parseResult = parser.parseFile('scripts/multiply.ram');
    const initialMemory = { 100: 7, 101: 8 };
    const finalState = simulator.simulate(parseResult.ram, 0, initialMemory);

    expect(finalState.halted).toBe(true);
    expect(finalState.ram[102]).toBe(56);
  });

  test('should handle multiplication by zero', async () => {
    const parseResult = parser.parseFile('scripts/multiply.ram');
    const initialMemory = { 100: 5, 101: 0 };
    const finalState = simulator.simulate(parseResult.ram, 0, initialMemory);

    expect(finalState.halted).toBe(true);
    expect(finalState.ram[102]).toBe(0);
  });

  test('should handle large numbers', async () => {
    const parseResult = parser.parseFile('scripts/multiply.ram');
    const initialMemory = { 100: 100, 101: 50 };
    const finalState = simulator.simulate(parseResult.ram, 0, initialMemory);

    expect(finalState.halted).toBe(true);
    expect(finalState.ram[102]).toBe(5000);
  });
});
