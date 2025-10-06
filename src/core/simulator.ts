// JOHNNY RAM Simulator - Core execution engine
import { ExecutionState, ExecutionTrace, SimulationConfig, OpcodeMapping } from '../types';
import { DEFAULT_OPCODE_MAPPING, JOHNNY_CONFIG } from './opcodes';

export class JohnnySimulator {
  private opcodeMapping: OpcodeMapping;
  private config: SimulationConfig;

  constructor(opcodeMapping?: OpcodeMapping, config?: Partial<SimulationConfig>) {
    this.opcodeMapping = opcodeMapping || DEFAULT_OPCODE_MAPPING;
    this.config = {
      maxSteps: JOHNNY_CONFIG.MAX_STEPS,
      memorySize: JOHNNY_CONFIG.MEMORY_SIZE,
      maxValue: JOHNNY_CONFIG.MAX_VALUE,
      enableTrace: true,
      validateInstructions: true,
      ...config
    };
  }

  /**
   * Create initial execution state
   */
  createInitialState(ram: number[], initialAcc: number = 0, initialMemory?: Record<number, number>): ExecutionState {
    const state: ExecutionState = {
      pc: 0,
      acc: initialAcc,
      addressBus: 0,
      dataBus: 0,
      instruction: 0,
      steps: 0,
      halted: false,
      ram: [...ram],
      trace: []
    };

    // Apply initial memory values
    if (initialMemory) {
      Object.entries(initialMemory).forEach(([addr, value]) => {
        const address = parseInt(addr);
        if (address >= 0 && address < this.config.memorySize) {
          state.ram[address] = value;
        }
      });
    }

    return state;
  }

  /**
   * Execute a single instruction
   */
  executeInstruction(state: ExecutionState): void {
    if (state.halted || state.pc >= this.config.memorySize) {
      return;
    }
    
    if (state.pc < 0) {
      state.halted = true;
      throw new Error(`Program counter went out of bounds: ${state.pc}`);
    }

    const instruction = state.ram[state.pc];
    // Extract opcode like original simulator: Math.floor(instruction / 1000) * 10
    const opcode = Math.floor((instruction || 0) / 1000) * 10;
    // Extract operand: last 3 digits
    const operand = (instruction || 0) % 1000;

    // Validate instruction if enabled
    if (this.config.validateInstructions && opcode > 0 && !this.opcodeMapping[opcode]) {
      throw new Error(`Invalid opcode ${opcode} at address ${state.pc}`);
    }

    // Record trace
    if (this.config.enableTrace) {
      const trace: ExecutionTrace = {
        step: state.steps,
        pc: state.pc,
        instruction: instruction,
        opcode: opcode,
        operand: operand,
        acc: state.acc
      };
      state.trace.push(trace);
    }

    // Update state
    state.instruction = instruction;
    state.addressBus = state.pc;
    state.dataBus = instruction;

    // Execute instruction
    if (opcode === 0) {
      // Data word - no operation, just increment PC
      state.pc++;
    } else if (this.opcodeMapping[opcode]) {
      const opcodeInfo = this.opcodeMapping[opcode];
      
      // Validate operand for address-based instructions
      if (opcodeInfo.operandType === 'ADDRESS' && (operand < 0 || operand >= this.config.memorySize)) {
        throw new Error(`Invalid address operand ${operand} for ${opcodeInfo.name} at address ${state.pc}`);
      }

      // Record memory state before execution for trace
      const oldRamValue = opcodeInfo.operandType === 'ADDRESS' ? state.ram[operand] : 0;

      // Execute the instruction
      opcodeInfo.execute(state, operand);

      // Record memory change in trace
      if (this.config.enableTrace && opcodeInfo.operandType === 'ADDRESS') {
        const newRamValue = state.ram[operand];
        if (oldRamValue !== newRamValue && state.trace.length > 0) {
          const lastTrace = state.trace[state.trace.length - 1];
          lastTrace.ramChanged = {
            address: operand,
            oldValue: oldRamValue,
            newValue: newRamValue
          };
        }
      }

      // Increment PC (unless instruction already modified it, like JMP)
      if (opcode !== 50) { // JMP handles PC itself
        state.pc++;
      }
    } else {
      throw new Error(`Unknown opcode ${opcode} at address ${state.pc}`);
    }

    state.steps++;
  }

  /**
   * Run program until halt or max steps reached
   */
  simulate(ram: number[], initialAcc: number = 0, initialMemory?: Record<number, number>): ExecutionState {
    const state = this.createInitialState(ram, initialAcc, initialMemory);

    while (!state.halted && state.steps < this.config.maxSteps) {
      try {
        this.executeInstruction(state);
      } catch (error) {
        state.halted = true;
        throw new Error(`Execution error at step ${state.steps}, PC ${state.pc}: ${(error as Error).message}`);
      }
    }

    if (!state.halted && state.steps >= this.config.maxSteps) {
      throw new Error(`Program exceeded maximum steps (${this.config.maxSteps}), possible infinite loop`);
    }

    return state;
  }

  /**
   * Step through program one instruction at a time
   */
  step(state: ExecutionState): boolean {
    if (state.halted || state.steps >= this.config.maxSteps) {
      return false;
    }

    try {
      this.executeInstruction(state);
      return !state.halted;
    } catch (error) {
      state.halted = true;
      throw error;
    }
  }

  /**
   * Reset simulation state
   */
  reset(state: ExecutionState, ram: number[], initialAcc: number = 0): void {
    state.pc = 0;
    state.acc = initialAcc;
    state.addressBus = 0;
    state.dataBus = 0;
    state.instruction = 0;
    state.steps = 0;
    state.halted = false;
    state.ram = [...ram];
    state.trace = [];
  }

  /**
   * Get current opcode mapping
   */
  getOpcodeMapping(): OpcodeMapping {
    return { ...this.opcodeMapping };
  }

  /**
   * Update simulation configuration
   */
  updateConfig(newConfig: Partial<SimulationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}