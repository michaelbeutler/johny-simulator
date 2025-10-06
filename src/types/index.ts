// Type definitions for JOHNNY RAM simulator and validator

export interface JohnnyInstruction {
  opcode: number;
  operand: number;
  address: number;
  value: number;
}

export interface ExecutionState {
  pc: number; // Program Counter
  acc: number; // Accumulator
  addressBus: number; // Address Bus
  dataBus: number; // Data Bus
  instruction: number; // Current Instruction
  steps: number; // Execution Steps
  halted: boolean; // Halt State
  ram: number[]; // RAM Memory
  trace: ExecutionTrace[];
}

export interface ExecutionTrace {
  step: number;
  pc: number;
  instruction: number;
  opcode: number;
  operand: number;
  acc: number;
  ramChanged?: { address: number; oldValue: number; newValue: number };
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  statistics: ProgramStatistics;
}

export interface ValidationError {
  type: 'SYNTAX' | 'LOGIC' | 'RUNTIME';
  address: number;
  message: string;
  instruction?: number;
}

export interface ValidationWarning {
  type: 'STYLE' | 'PERFORMANCE' | 'SAFETY';
  address: number;
  message: string;
  instruction?: number;
}

export interface ProgramStatistics {
  totalInstructions: number;
  instructionCount: Record<number, number>;
  hasHalt: boolean;
  maxAddress: number;
  dataWords: number;
  potentialInfiniteLoops: number;
}

export interface TestCase {
  name: string;
  description: string;
  ramFile: string;
  setup?: ExecutionSetup;
  expectedResults: TestExpectation[];
  timeout?: number;
}

export interface ExecutionSetup {
  initialAcc?: number;
  initialMemory?: Record<number, number>;
  maxSteps?: number;
}

export interface TestExpectation {
  type: 'MEMORY' | 'ACCUMULATOR' | 'STEPS' | 'HALT' | 'OUTPUT';
  address?: number;
  expectedValue?: number;
  expectedRange?: { min: number; max: number };
  description: string;
}

export interface TestResult {
  testName: string;
  passed: boolean;
  executionTime: number;
  steps: number;
  errors: string[];
  actualResults: Record<string, unknown>;
  trace?: ExecutionTrace[];
}

export interface OpcodeMapping {
  [opcode: number]: {
    name: string;
    description: string;
    hasOperand: boolean;
    operandType: 'ADDRESS' | 'NONE';
    execute: (state: ExecutionState, operand: number) => void;
  };
}

export interface SimulationConfig {
  maxSteps: number;
  memorySize: number;
  maxValue: number;
  enableTrace: boolean;
  validateInstructions: boolean;
}

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}
