import { describe, it, expect } from 'bun:test';
import { JohnnySimulator } from '../../src/core/simulator';
import { Parser } from '../../src/compiler/parser';
import { IRGenerator } from '../../src/compiler/ir';
import { MemoryMapper, DEFAULT_LAYOUT } from '../../src/compiler/memmap';
import { CodeGenerator } from '../../src/compiler/codegen';
import { Emitter } from '../../src/compiler/emitter';

describe('Johnny C Compiler - Multiplication', () => {
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

  it('should compile multiplication', () => {
    const source = `
      int x;
      int y;
      int product;
      x = 3;
      y = 4;
      product = x * y;
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
    // Variables allocated alphabetically: product, x, y
    expect(state.ram[900]).toBe(12); // product = 3 * 4 = 12
    expect(state.ram[901]).toBe(3); // x = 3
    expect(state.ram[902]).toBe(4); // y = 4
  });

  it('should handle multiplication by zero', () => {
    const source = `
      int x;
      int y;
      int product;
      x = 5;
      y = 0;
      product = x * y;
      halt;
    `;

    const instructions = compileSource(source);
    const simulator = new JohnnySimulator();
    const state = simulator.createInitialState(instructions);

    let steps = 0;
    while (!state.halted && steps < 100) {
      simulator.executeInstruction(state);
      steps++;
    }

    expect(state.halted).toBe(true);
    // Variables allocated alphabetically: product, x, y
    expect(state.ram[900]).toBe(0); // product = 5 * 0 = 0
    expect(state.ram[901]).toBe(5); // x = 5
    expect(state.ram[902]).toBe(0); // y = 0
  });
});
