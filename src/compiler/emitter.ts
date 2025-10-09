// Emitter - Resolves labels to numbers and formats with comments
import { GeneratedInstruction } from './codegen';
import { MemoryMap, MemoryMapper } from './memmap';

export interface EmittedProgram {
  instructions: number[];
  comments: string[];
  labelMap: Map<string, number>;
}

export class Emitter {
  private memoryMapper: MemoryMapper;

  constructor(memoryMapper: MemoryMapper) {
    this.memoryMapper = memoryMapper;
  }

  /**
   * Emit final program with resolved labels
   */
  emit(
    instructions: GeneratedInstruction[],
    memoryMap: MemoryMap,
    includeComments: boolean = false
  ): EmittedProgram {
    // First pass: collect labels
    const labelMap = this.collectLabels(instructions);

    // Second pass: resolve operands and emit
    const emittedInstructions: number[] = [];
    const comments: string[] = [];

    for (const instr of instructions) {
      const resolvedOperand = this.resolveOperand(instr, labelMap, memoryMap);
      const encodedInstruction = this.encodeInstruction(
        instr.opcode,
        resolvedOperand
      );

      emittedInstructions.push(encodedInstruction);

      if (includeComments) {
        comments.push(this.formatComment(instr, resolvedOperand));
      }
    }

    return {
      instructions: emittedInstructions,
      comments,
      labelMap,
    };
  }

  /**
   * Format program as string array for .ram file
   */
  formatAsRamFile(
    emitted: EmittedProgram,
    includeComments: boolean = false
  ): string[] {
    const lines: string[] = [];

    for (let i = 0; i < emitted.instructions.length; i++) {
      const instruction = emitted.instructions[i];
      let line = instruction.toString().padStart(5, '0');

      if (includeComments && emitted.comments[i]) {
        line += ` // ${emitted.comments[i]}`;
      }

      lines.push(line);
    }

    return lines;
  }

  private collectLabels(
    instructions: GeneratedInstruction[]
  ): Map<string, number> {
    const labelMap = new Map<string, number>();
    let address = 0;

    for (const instr of instructions) {
      if (instr.label) {
        labelMap.set(instr.label, address);
      }
      address++;
    }

    return labelMap;
  }

  private resolveOperand(
    instr: GeneratedInstruction,
    labelMap: Map<string, number>,
    memoryMap: MemoryMap
  ): number {
    // If operand is already resolved (non-zero), use it
    if (instr.operand !== 0) {
      return instr.operand;
    }

    // Special handling for specific instruction types
    switch (instr.opcode) {
      case 50: // JMP
        if (instr.label) {
          const labelAddr = labelMap.get(instr.label);
          if (labelAddr === undefined) {
            throw new Error(`Undefined label: ${instr.label}`);
          }
          return labelAddr;
        }
        break;

      case 60: // TST
        // For conditional jumps, we need to resolve the condition variable
        if (instr.comment && instr.comment.includes('Test ')) {
          const match = instr.comment.match(/Test (\w+)/);
          if (match) {
            const conditionVar = match[1];
            try {
              return this.memoryMapper.getAddress(memoryMap, conditionVar);
            } catch {
              // If not found in memory map, it might be a temp variable
              // For now, we'll handle this in the codegen phase
              return 0;
            }
          }
        }
        break;
    }

    return instr.operand;
  }

  private encodeInstruction(opcode: number, operand: number): number {
    // Encode as: opcode (zero-padded to 2 digits) + operand (zero-padded to 3 digits)
    // Format: OOXXX where OO is 2-digit opcode, XXX is 3-digit operand
    const paddedOpcode = opcode.toString().padStart(2, '0');
    const paddedOperand = operand.toString().padStart(3, '0');
    return parseInt(paddedOpcode + paddedOperand);
  }

  private formatComment(
    instr: GeneratedInstruction,
    resolvedOperand: number
  ): string {
    if (instr.comment) {
      if (resolvedOperand !== instr.operand) {
        return `${instr.comment} [${resolvedOperand}]`;
      }
      return instr.comment;
    }

    // Generate default comment based on opcode
    const opcodeNames: Record<number, string> = {
      0: 'DATA',
      1: 'TAKE',
      2: 'ADD',
      3: 'SUB',
      4: 'SAVE',
      5: 'JMP',
      6: 'TST',
      7: 'INC',
      8: 'DEC',
      9: 'NULL',
      10: 'HLT',
    };

    const opcodeName = opcodeNames[instr.opcode] || `OP${instr.opcode}`;
    if (instr.opcode === 100) {
      return opcodeName;
    }
    return `${opcodeName} ${resolvedOperand}`;
  }

  /**
   * Validate the emitted program
   */
  validate(emitted: EmittedProgram): string[] {
    const errors: string[] = [];

    // Check for empty program
    if (emitted.instructions.length === 0) {
      errors.push('Program is empty');
      return errors;
    }

    // Check for halt instruction
    const hasHalt = emitted.instructions.some(instr => {
      const opcode = Math.floor(instr / 1000);
      return opcode === 10; // HLT opcode is 10 in OOXXX format
    });

    if (!hasHalt) {
      errors.push('Program does not contain a HALT instruction');
    }

    // Check instruction format
    for (let i = 0; i < emitted.instructions.length; i++) {
      const instr = emitted.instructions[i];
      const opcode = Math.floor(instr / 1000);
      const operand = instr % 1000;

      // Check opcode validity
      const validOpcodes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      if (!validOpcodes.includes(opcode)) {
        errors.push(`Invalid opcode ${opcode} at address ${i}`);
      }

      // Check operand range
      if (operand < 0 || operand > 999) {
        errors.push(`Invalid operand ${operand} at address ${i}`);
      }

      // Check memory bounds for address operands
      if ([1, 2, 3, 4, 5, 6, 7, 8, 9].includes(opcode) && operand >= 1000) {
        errors.push(`Operand ${operand} exceeds memory bounds at address ${i}`);
      }
    }

    return errors;
  }
}
