import { describe, expect, it } from 'bun:test';
import { CodeGenerator } from '../../src/compiler/codegen';
import { Emitter } from '../../src/compiler/emitter';
import { IRGenerator } from '../../src/compiler/ir';
import { DEFAULT_LAYOUT, MemoryMapper } from '../../src/compiler/memmap';
import { Parser } from '../../src/compiler/parser';
import { JohnnySimulator } from '../../src/core/simulator';

describe('Johnny C Compiler', () => {
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

  it('should compile simple assignment', () => {
    const source = 'int x; x = 5; halt;';
    const instructions = compileSource(source);
    const simulator = new JohnnySimulator();
    const state = simulator.createInitialState(instructions);
    let steps = 0;
    while (!state.halted && steps < 100) {
      simulator.executeInstruction(state);
      steps++;
    }
    expect(state.halted).toBe(true);
    expect(state.ram[900]).toBe(5);
  });
});
