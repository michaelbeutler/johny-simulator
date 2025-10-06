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

  test('should initialize correctly with N=10', async () => {
    const parseResult = parser.parseFile('scripts/sieve.ram');
    expect(parseResult.errors).toHaveLength(0);

    // Initialize memory with N = 10 at address 100
    const initialMemory = { 100: 10 };
    const finalState = simulator.simulate(parseResult.ram, 0, initialMemory);
    
    // The program should complete successfully
    expect(finalState.halted).toBe(true);
    
    // Check that N is preserved in memory 
    expect(finalState.ram[100]).toBe(10); // N should be 10
    
    // Check that primes are marked correctly (0 = prime, 1 = composite)
    expect(finalState.ram[202]).toBe(0); // 2 is prime
    expect(finalState.ram[203]).toBe(0); // 3 is prime
    expect(finalState.ram[204]).toBe(1); // 4 is composite  
    expect(finalState.ram[205]).toBe(0); // 5 is prime
    expect(finalState.ram[206]).toBe(1); // 6 is composite
    expect(finalState.ram[207]).toBe(0); // 7 is prime
    expect(finalState.ram[208]).toBe(1); // 8 is composite
    expect(finalState.ram[209]).toBe(1); // 9 is composite
    expect(finalState.ram[210]).toBe(1); // 10 is composite
    
    // Check that N was copied to result area
    expect(finalState.ram[105]).toBe(10); // N copied to result
  });

  test('should demonstrate sieve concept with manual setup', () => {
    // Create a simplified program that demonstrates the sieve concept
    const conceptProgram = [
      // Store N=10 at address 100
      10,          // DATA 10
      4100,        // SAVE 100
      
      // Initialize some sieve positions manually to show the concept
      0,           // DATA 0 (prime marker)
      4202,        // SAVE 202 - mark 2 as prime
      4203,        // SAVE 203 - mark 3 as prime  
      1,           // DATA 1 (composite marker)
      4204,        // SAVE 204 - mark 4 as composite
      0,           // DATA 0 
      4205,        // SAVE 205 - mark 5 as prime
      1,           // DATA 1
      4206,        // SAVE 206 - mark 6 as composite
      0,           // DATA 0
      4207,        // SAVE 207 - mark 7 as prime
      1,           // DATA 1
      4208,        // SAVE 208 - mark 8 as composite
      4209,        // SAVE 209 - mark 9 as composite
      4210,        // SAVE 210 - mark 10 as composite
      10000        // HLT
    ];
    
    const finalState = simulator.simulate(conceptProgram, 0, {});
    
    expect(finalState.halted).toBe(true);
    expect(finalState.ram[100]).toBe(10); // N stored correctly
    
    // Verify prime/composite marking matches expected results
    expect(finalState.ram[202]).toBe(0); // 2 is prime
    expect(finalState.ram[203]).toBe(0); // 3 is prime
    expect(finalState.ram[204]).toBe(1); // 4 is composite
    expect(finalState.ram[205]).toBe(0); // 5 is prime
    expect(finalState.ram[206]).toBe(1); // 6 is composite
    expect(finalState.ram[207]).toBe(0); // 7 is prime
    expect(finalState.ram[208]).toBe(1); // 8 is composite
    expect(finalState.ram[209]).toBe(1); // 9 is composite
    expect(finalState.ram[210]).toBe(1); // 10 is composite
  });

  test('should handle memory operations correctly', () => {
    // Test basic memory operations used in the sieve
    const memoryTestProgram = [
      25,          // DATA 25
      4100,        // SAVE 100 - Store N=25 at address 100
      2,           // DATA 2
      4101,        // SAVE 101 - Store i=2 at address 101  
      5,           // DATA 5
      4104,        // SAVE 104 - Store sqrt(N)=5 at address 104
      200,         // DATA 200
      4105,        // SAVE 105 - Store base address 200 at address 105
      1101,        // TAKE 101 - Load i
      2104,        // ADD 104 - Add sqrt(N)
      4106,        // SAVE 106 - store result
      10000        // HLT
    ];
    
    const finalState = simulator.simulate(memoryTestProgram, 0, {});
    
    expect(finalState.halted).toBe(true);
    expect(finalState.ram[100]).toBe(25);  // N
    expect(finalState.ram[101]).toBe(2);   // i 
    expect(finalState.ram[104]).toBe(5);   // sqrt(N)
    expect(finalState.ram[105]).toBe(200); // base address
    expect(finalState.ram[106]).toBe(7);   // i + sqrt(N) = 2 + 5
  });
});