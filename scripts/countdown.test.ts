import { describe, test, expect } from 'bun:test';
import { JohnnySimulator } from '../src/core/simulator';
import { RamParser } from '../src/core/parser';
import { RamValidator } from '../src/validation/validator';

describe('Countdown Program Tests', () => {
  // Use reduced max steps for faster infinite loop detection
  const simulator = new JohnnySimulator(undefined, { maxSteps: 10000 });
  const parser = new RamParser();
  const validator = new RamValidator();

  test('should validate countdown program', () => {
    const result = validator.validateFile('scripts/countdown.ram');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should execute without errors', async () => {
    const parseResult = parser.parseFile('scripts/countdown.ram');
    expect(parseResult.errors).toHaveLength(0);

    const finalState = simulator.simulate(parseResult.ram, 0, {});

    expect(finalState.halted).toBe(true);
    expect(finalState.ram[100]).toBe(0);
  });

  test('should countdown from 10 to 0 and store all values', async () => {
    const parseResult = parser.parseFile('scripts/countdown.ram');
    const finalState = simulator.simulate(parseResult.ram, 0, {});

    expect(finalState.halted).toBe(true);

    // Check that all countdown values are stored in consecutive registers
    expect(finalState.ram[50]).toBe(10); // ADR 50 == 10
    expect(finalState.ram[51]).toBe(9); // ADR 51 == 9
    expect(finalState.ram[52]).toBe(8); // ADR 52 == 8
    expect(finalState.ram[53]).toBe(7); // ADR 53 == 7
    expect(finalState.ram[54]).toBe(6); // ADR 54 == 6
    expect(finalState.ram[55]).toBe(5); // ADR 55 == 5
    expect(finalState.ram[56]).toBe(4); // ADR 56 == 4
    expect(finalState.ram[57]).toBe(3); // ADR 57 == 3
    expect(finalState.ram[58]).toBe(2); // ADR 58 == 2
    expect(finalState.ram[59]).toBe(1); // ADR 59 == 1
    expect(finalState.ram[60]).toBe(0); // ADR 60 == 0

    // Final counter should be 0
    expect(finalState.ram[100]).toBe(0);
  });

  test('should store countdown sequence correctly', async () => {
    const parseResult = parser.parseFile('scripts/countdown.ram');
    const finalState = simulator.simulate(parseResult.ram, 0, {});

    expect(finalState.halted).toBe(true);

    // Verify the countdown sequence is correct
    for (let i = 0; i <= 10; i++) {
      expect(finalState.ram[50 + i]).toBe(10 - i);
    }
  });
});
