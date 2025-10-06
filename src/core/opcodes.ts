// JOHNNY RAM Opcode Configuration and Mappings
import { OpcodeMapping, ExecutionState } from '../types';

export const JOHNNY_CONFIG = {
  MEMORY_SIZE: 1000,
  MAX_VALUE: 19999,
  MAX_STEPS: 100000,
  INSTRUCTION_FORMAT: 5, // 5-digit instructions
} as const;

export const DEFAULT_OPCODE_MAPPING: OpcodeMapping = {
  0: {
    name: 'FETCH',
    description: 'Fetch instruction (internal)',
    hasOperand: true,
    operandType: 'ADDRESS',
    execute: (state: ExecutionState, _operand: number) => {
      // FETCH is handled internally by the simulator
    }
  },
  1: {
    name: 'TAKE',
    description: 'Load value from memory address into accumulator',
    hasOperand: true,
    operandType: 'ADDRESS',
    execute: (state: ExecutionState, operand: number) => {
      state.acc = state.ram[operand];
    }
  },
  2: {
    name: 'ADD',
    description: 'Add value from memory address to accumulator',
    hasOperand: true,
    operandType: 'ADDRESS',
    execute: (state: ExecutionState, operand: number) => {
      state.acc += state.ram[operand];
      if (state.acc > JOHNNY_CONFIG.MAX_VALUE) state.acc = JOHNNY_CONFIG.MAX_VALUE;
    }
  },
  3: {
    name: 'SUB',
    description: 'Subtract value from memory address from accumulator',
    hasOperand: true,
    operandType: 'ADDRESS',
    execute: (state: ExecutionState, operand: number) => {
      state.acc -= state.ram[operand];
      if (state.acc < 0) state.acc = 0;
    }
  },
  4: {
    name: 'SAVE',
    description: 'Store accumulator value to memory address',
    hasOperand: true,
    operandType: 'ADDRESS',
    execute: (state: ExecutionState, operand: number) => {
      state.ram[operand] = state.acc;
    }
  },
  5: {
    name: 'JMP',
    description: 'Jump to memory address',
    hasOperand: true,
    operandType: 'ADDRESS',
    execute: (state: ExecutionState, operand: number) => {
      state.pc = operand; // Jump directly to the address
    }
  },
  6: {
    name: 'TST',
    description: 'Skip next instruction if memory address contains zero',
    hasOperand: true,
    operandType: 'ADDRESS',
    execute: (state: ExecutionState, operand: number) => {
      if (state.ram[operand] === 0) {
        state.pc++; // Skip next instruction
      }
    }
  },
  7: {
    name: 'INC',
    description: 'Increment value at memory address',
    hasOperand: true,
    operandType: 'ADDRESS',
    execute: (state: ExecutionState, operand: number) => {
      state.ram[operand] = (state.ram[operand] + 1) % (JOHNNY_CONFIG.MAX_VALUE + 1);
    }
  },
  8: {
    name: 'DEC',
    description: 'Decrement value at memory address',
    hasOperand: true,
    operandType: 'ADDRESS',
    execute: (state: ExecutionState, operand: number) => {
      state.ram[operand] = Math.max(0, state.ram[operand] - 1);
    }
  },
  9: {
    name: 'NULL',
    description: 'Set memory address to zero',
    hasOperand: true,
    operandType: 'ADDRESS',
    execute: (state: ExecutionState, operand: number) => {
      state.ram[operand] = 0;
    }
  },
  10: {
    name: 'HLT',
    description: 'Halt program execution',
    hasOperand: false,
    operandType: 'NONE',
    execute: (state: ExecutionState, _operand: number) => {
      state.halted = true;
    }
  }
};

/**
 * Load opcode mapping from JSON configuration file
 * This allows customization of JOHNNY instruction sets
 */
export function loadOpcodeMapping(configPath?: string): OpcodeMapping {
  if (configPath) {
    try {
      const fs = require('fs');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return { ...DEFAULT_OPCODE_MAPPING, ...config };
    } catch (error) {
      console.warn(`Failed to load opcode mapping from ${configPath}, using default`);
    }
  }
  return DEFAULT_OPCODE_MAPPING;
}

/**
 * Validate if an opcode is valid in the current mapping
 */
export function isValidOpcode(opcode: number, mapping: OpcodeMapping = DEFAULT_OPCODE_MAPPING): boolean {
  return opcode in mapping || opcode === 0; // 0 is always valid for data
}

/**
 * Get instruction name for display purposes
 */
export function getInstructionName(opcode: number, mapping: OpcodeMapping = DEFAULT_OPCODE_MAPPING): string {
  if (opcode === 0) return 'DATA';
  return mapping[opcode]?.name || `UNKNOWN(${opcode})`;
}