// @ts-ignore
import { describe, test, expect } from 'bun:test';
import { JohnnySimulator } from '../src/core/simulator';
import { RamParser } from '../src/core/parser';
import { RamValidator } from '../src/validation/validator';

describe('Addition Program Tests', () => {
  const simulator = new JohnnySimulator();
  const parser = new RamParser();
  const validator = new RamValidator();

  test('should validate addition program', () => {
    const result = validator.validateFile('scripts/addition.ram');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should add 15 + 25 = 40', async () => {
    const parseResult = parser.parseFile('scripts/addition.ram');
    expect(parseResult.errors).toHaveLength(0);

    const initialMemory = { 100: 15, 101: 25 };
    const finalState = simulator.simulate(parseResult.ram, 0, initialMemory);

    expect(finalState.halted).toBe(true);
    expect(finalState.ram[102]).toBe(40);
    expect(finalState.acc).toBe(40);
  });

  test('should add negative simulation (0 - bounded)', async () => {
    const parseResult = parser.parseFile('scripts/addition.ram');
    const initialMemory = { 100: 0, 101: 100 };
    const finalState = simulator.simulate(parseResult.ram, 0, initialMemory);

    expect(finalState.halted).toBe(true);
    expect(finalState.ram[102]).toBe(100);
  });

  test('should handle large numbers', async () => {
    const parseResult = parser.parseFile('scripts/addition.ram');
    const initialMemory = { 100: 9999, 101: 9999 };
    const finalState = simulator.simulate(parseResult.ram, 0, initialMemory);

    expect(finalState.halted).toBe(true);
    expect(finalState.ram[102]).toBe(19998);
  });
});