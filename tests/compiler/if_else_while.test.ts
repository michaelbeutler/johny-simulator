import { describe, it, expect } from 'bun:test';
import { JohnnySimulator } from '../../src/core/simulator';
import { Parser } from '../../src/compiler/parser';
import { IRGenerator } from '../../src/compiler/ir';
import { MemoryMapper, DEFAULT_LAYOUT } from '../../src/compiler/memmap';
import { CodeGenerator } from '../../src/compiler/codegen';
import { Emitter } from '../../src/compiler/emitter';

describe('Johnny C Compiler - If/Else/While', () => {
  const compileSource = (source: string): number[] => {
    const parser = new Parser(source);
    const ast = parser.parse();
    const irGenerator = new IRGenerator();
    const { blocks, symbols } = irGenerator.generate(ast);
    const memoryMapper = new MemoryMapper(DEFAULT_LAYOUT);
    const memoryMap = memoryMapper.createMemoryMap(symbols);
    const codeGenerator = new CodeGenerator(memoryMapper);
    const instructions = codeGenerator.generate(blocks, memoryMap);
    const emitter = new Emitter(memoryMapper);
    const emitted = emitter.emit(instructions, memoryMap, false);
    return emitted.instructions;
  };

  it('should compile if statement', () => {
    const source = `
      int x;
      int result;
      x = 5;
      if (x == 5) {
        result = 10;
      }
      halt;
    `;

    const instructions = compileSource(source);
    const simulator = new JohnnySimulator();
    const state = simulator.createInitialState(instructions);

    let steps = 0;
    while (!state.halted && steps < 200) {
      simulator.executeInstruction(state);
      steps++;
    }

    expect(state.halted).toBe(true);
    // Variables allocated alphabetically: result, x
    expect(state.ram[900]).toBe(10); // result should be 10
    expect(state.ram[901]).toBe(5); // x should be 5
  });

  it('should compile if-else statement', () => {
    const source = `
      int x;
      int result;
      x = 3;
      if (x == 5) {
        result = 10;
      } else {
        result = 20;
      }
      halt;
    `;

    const instructions = compileSource(source);
    const simulator = new JohnnySimulator();
    const state = simulator.createInitialState(instructions);

    let steps = 0;
    while (!state.halted && steps < 200) {
      simulator.executeInstruction(state);
      steps++;
    }

    expect(state.halted).toBe(true);
    // Variables allocated alphabetically: result, x
    expect(state.ram[900]).toBe(20); // result should be 20 (else branch)
    expect(state.ram[901]).toBe(3); // x should be 3
  });

  it('should compile simple while loop', () => {
    const source = `
      int counter;
      int sum;
      counter = 3;
      sum = 0;
      while (counter != 0) {
        sum = sum + counter;
        counter = counter - 1;
      }
      halt;
    `;

    const instructions = compileSource(source);
    const simulator = new JohnnySimulator();
    const state = simulator.createInitialState(instructions);

    let steps = 0;
    while (!state.halted && steps < 500) {
      simulator.executeInstruction(state);
      steps++;
    }

    expect(state.halted).toBe(true);
    // Variables allocated alphabetically: counter, sum
    expect(state.ram[900]).toBe(0); // counter should be 0
    expect(state.ram[901]).toBe(6); // sum should be 6 (3+2+1)
  });
});
