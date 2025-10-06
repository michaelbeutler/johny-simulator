// @ts-ignore
import { describe, test, expect } from 'bun:test';
import { JohnnySimulator } from '../src/core/simulator';
import { RamParser } from '../src/core/parser';
import { RamValidator } from '../src/validation/validator';

describe('Sieve of Eratosthenes Program Tests', () => {
  const simulator = new JohnnySimulator();
  const parser = new RamParser();
  const validator = new RamValidator();

  test('should validate sieve program', () => {
    const result = validator.validateFile('scripts/sieve.ram');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should demonstrate sieve concepts with N=10', async () => {
    const parseResult = parser.parseFile('scripts/sieve.ram');
    expect(parseResult.errors).toHaveLength(0);

    // Initialize with N=10 for demonstration
    const initialMemory = { 100: 10 };
    const finalState = simulator.simulate(parseResult.ram, 0, initialMemory);
    
    // The program should complete successfully
    expect(finalState.halted).toBe(true);
    
    // Check that N is stored in result area
    expect(finalState.ram[105]).toBe(10); // N copied to output
    
    // Check that our demonstration marks some composites
    // This shows sieve concepts, not a complete implementation
    expect(finalState.ram[204]).toBe(1); // 4 marked as composite (2²)
    expect(finalState.ram[206]).toBe(1); // 6 marked as composite (2×3)
    expect(finalState.ram[208]).toBe(1); // 8 marked as composite (2³)
    expect(finalState.ram[209]).toBe(1); // 9 marked as composite (3²)
    expect(finalState.ram[210]).toBe(1); // 10 marked as composite (2×5)
    
    // Positions 2, 3, 5, 7 remain unmarked (0) representing primes
    expect(finalState.ram[202]).toBe(0); // 2 is prime
    expect(finalState.ram[203]).toBe(0); // 3 is prime
    expect(finalState.ram[205]).toBe(0); // 5 is prime
    expect(finalState.ram[207]).toBe(0); // 7 is prime
  });

  test('should demonstrate sieve concept with memory operations', () => {
    // Test memory operations used in sieve with proper instruction format
    const memoryTestProgram = [
      9202,        // NULL 202 - Clear position 2 (mark as prime)
      9203,        // NULL 203 - Clear position 3 (mark as prime)
      7204,        // INC 204 - Mark 4 as composite
      7206,        // INC 206 - Mark 6 as composite
      1100,        // TAKE 100 - Load N from address 100
      4105,        // SAVE 105 - Store in result area
      10000        // HLT
    ];
    
    const initialMemory = { 100: 10 }; // N = 10
    const finalState = simulator.simulate(memoryTestProgram, 0, initialMemory);
    
    expect(finalState.halted).toBe(true);
    expect(finalState.ram[100]).toBe(10);  // N preserved
    expect(finalState.ram[202]).toBe(0);   // 2 marked as prime
    expect(finalState.ram[203]).toBe(0);   // 3 marked as prime
    expect(finalState.ram[204]).toBe(1);   // 4 marked as composite
    expect(finalState.ram[206]).toBe(1);   // 6 marked as composite
    expect(finalState.ram[105]).toBe(10);  // N copied to result area
  });

  test('should handle basic arithmetic operations correctly', () => {
    // Test basic operations that would be used in a full sieve implementation
    const arithmeticProgram = [
      1100,        // TAKE 100 - Load value from address 100
      2101,        // ADD 101  - Add value from address 101
      4102,        // SAVE 102 - Save result to address 102
      1100,        // TAKE 100 - Load value from address 100 again
      3101,        // SUB 101  - Subtract value from address 101
      4103,        // SAVE 103 - Save result to address 103
      10000        // HLT
    ];
    
    const initialMemory = { 100: 15, 101: 5 }; // Test with 15 and 5
    const finalState = simulator.simulate(arithmeticProgram, 0, initialMemory);
    
    expect(finalState.halted).toBe(true);
    expect(finalState.ram[100]).toBe(15);  // Original values preserved
    expect(finalState.ram[101]).toBe(5);   
    expect(finalState.ram[102]).toBe(20);  // 15 + 5 = 20
    expect(finalState.ram[103]).toBe(10);  // 15 - 5 = 10
  });
});