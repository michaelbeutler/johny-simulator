// JOHNNY RAM Opcode Configuration and Mappings
import { OpcodeMapping, ExecutionState } from '../types';

export const JOHNNY_CONFIG = {
  MEMORY_SIZE: 1000,
  MAX_VALUE: 19999,
  MAX_STEPS: 100000,
  INSTRUCTION_FORMAT: 5, // 5-digit instructions (OOXXX format)
} as const;

// Opcode constants
export const OPCODES = {
  DATA: 0,
  TAKE: 10,
  ADD: 20,
  SUB: 30,
  SAVE: 40,
  JMP: 50,
  TST: 60,
  INC: 70,
  DEC: 80,
  NULL: 90,
  HLT: 100,
} as const;

export const DEFAULT_OPCODE_MAPPING: OpcodeMapping = {
  [OPCODES.DATA]: {
    name: 'DATA',
    description: 'Data word (no operation)',
    hasOperand: false,
    operandType: 'NONE',
    execute: (_state: ExecutionState, _operand: number) => {
      // Data word - no operation, just increment PC
    },
  },
  [OPCODES.TAKE]: {
    name: 'TAKE',
    description: 'Load value from memory address into accumulator',
    hasOperand: true,
    operandType: 'ADDRESS',
    execute: (state: ExecutionState, operand: number) => {
      state.acc = state.ram[operand] || 0; // Handle undefined/null values
    },
  },
  [OPCODES.ADD]: {
    name: 'ADD',
    description: 'Add value from memory address to accumulator',
    hasOperand: true,
    operandType: 'ADDRESS',
    execute: (state: ExecutionState, operand: number) => {
      const value = state.ram[operand] || 0; // Handle undefined/null values
      state.acc += value;
      if (state.acc > JOHNNY_CONFIG.MAX_VALUE)
        state.acc = JOHNNY_CONFIG.MAX_VALUE;
    },
  },
  [OPCODES.SUB]: {
    name: 'SUB',
    description: 'Subtract value from memory address from accumulator',
    hasOperand: true,
    operandType: 'ADDRESS',
    execute: (state: ExecutionState, operand: number) => {
      const value = state.ram[operand] || 0; // Handle undefined/null values
      state.acc -= value;
      if (state.acc < 0) state.acc = 0;
    },
  },
  [OPCODES.SAVE]: {
    name: 'SAVE',
    description: 'Store accumulator value to memory address',
    hasOperand: true,
    operandType: 'ADDRESS',
    execute: (state: ExecutionState, operand: number) => {
      state.ram[operand] = state.acc;
    },
  },
  [OPCODES.JMP]: {
    name: 'JMP',
    description: 'Jump to memory address',
    hasOperand: true,
    operandType: 'ADDRESS',
    execute: (state: ExecutionState, operand: number) => {
      state.pc = operand; // Jump directly to the address
    },
  },
  [OPCODES.TST]: {
    name: 'TST',
    description: 'Skip next instruction if memory address contains zero',
    hasOperand: true,
    operandType: 'ADDRESS',
    execute: (state: ExecutionState, operand: number) => {
      if ((state.ram[operand] || 0) === 0) {
        state.pc++; // Skip next instruction
      }
    },
  },
  [OPCODES.INC]: {
    name: 'INC',
    description: 'Increment value at memory address',
    hasOperand: true,
    operandType: 'ADDRESS',
    execute: (state: ExecutionState, operand: number) => {
      const currentValue = state.ram[operand] || 0; // Handle undefined/null values
      state.ram[operand] = (currentValue + 1) % (JOHNNY_CONFIG.MAX_VALUE + 1);
    },
  },
  [OPCODES.DEC]: {
    name: 'DEC',
    description: 'Decrement value at memory address',
    hasOperand: true,
    operandType: 'ADDRESS',
    execute: (state: ExecutionState, operand: number) => {
      const currentValue = state.ram[operand] || 0; // Handle undefined/null values
      state.ram[operand] = Math.max(0, currentValue - 1);
    },
  },
  [OPCODES.NULL]: {
    name: 'NULL',
    description: 'Set memory address to zero',
    hasOperand: true,
    operandType: 'ADDRESS',
    execute: (state: ExecutionState, operand: number) => {
      state.ram[operand] = 0;
    },
  },
  [OPCODES.HLT]: {
    name: 'HLT',
    description: 'Halt program execution',
    hasOperand: false,
    operandType: 'NONE',
    execute: (state: ExecutionState, _operand: number) => {
      state.halted = true;
    },
  },
};

/**
 * Load opcode mapping from JSON configuration file
 * This allows customization of JOHNNY instruction sets
 */
export function loadOpcodeMapping(configPath?: string): OpcodeMapping {
  if (configPath) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require('fs');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return { ...DEFAULT_OPCODE_MAPPING, ...config };
    } catch {
      console.warn(
        `Failed to load opcode mapping from ${configPath}, using default`
      );
    }
  }
  return DEFAULT_OPCODE_MAPPING;
}

/**
 * Validate if an opcode is valid in the current mapping
 */
export function isValidOpcode(
  opcode: number,
  mapping: OpcodeMapping = DEFAULT_OPCODE_MAPPING
): boolean {
  return opcode in mapping; // All opcodes including 0 are in the mapping
}

/**
 * Get instruction name for display purposes
 */
export function getInstructionName(
  opcode: number,
  mapping: OpcodeMapping = DEFAULT_OPCODE_MAPPING
): string {
  return mapping[opcode]?.name || `UNKNOWN(${opcode})`;
}
