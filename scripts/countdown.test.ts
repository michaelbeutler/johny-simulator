// @ts-ignore
import { describe, test, expect } from 'bun:test';
import { JohnnySimulator } from '../src/core/simulator';
import { RamParser } from '../src/core/parser';
import { RamValidator } from '../src/validation/validator';

describe('Countdown Program Tests', () => {
  const simulator = new JohnnySimulator();
  const parser = new RamParser();
  const validator = new RamValidator();

  test('should validate countdown program', () => {
    const result = validator.validateFile('scripts/countdown.ram');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should countdown from 5 to 0', async () => {
    const parseResult = parser.parseFile('scripts/countdown.ram');
    expect(parseResult.errors).toHaveLength(0);

    const initialMemory = { 100: 5 };
    const finalState = simulator.simulate(parseResult.ram, 0, initialMemory);

    expect(finalState.halted).toBe(true);
    expect(finalState.ram[100]).toBe(0);
    expect(finalState.steps).toBe(15); // 5 iterations * 3 steps
  });

  test('should countdown from 10 to 0', async () => {
    const parseResult = parser.parseFile('scripts/countdown.ram');
    const initialMemory = { 100: 10 };
    const finalState = simulator.simulate(parseResult.ram, 0, initialMemory);

    expect(finalState.halted).toBe(true);
    expect(finalState.ram[100]).toBe(0);
    expect(finalState.steps).toBe(30); // 10 iterations * 3 steps
  });

  test('should handle zero initial value', async () => {
    const parseResult = parser.parseFile('scripts/countdown.ram');
    const initialMemory = { 100: 0 };
    const finalState = simulator.simulate(parseResult.ram, 0, initialMemory);

    expect(finalState.halted).toBe(true);
    expect(finalState.ram[100]).toBe(0); // Should stay 0 (DEC of 0 = 0)
    expect(finalState.steps).toBe(3); // DEC, TST, HLT (TST skips JMP)
  });
});
