// Code generation - Lower IR to JOHNNY RAM opcodes with label management
import {
  IRInstruction,
  IRAssign,
  IRBinary,
  IRUnary,
  IRConstant,
  IRLabel,
  IRJump,
  IRConditionalJump,
  IRHalt,
  BasicBlock,
} from './ir';
import { MemoryMap, MemoryMapper } from './memmap';

// Generated instruction with optional label
export interface GeneratedInstruction {
  opcode: number;
  operand: number;
  label?: string;
  comment?: string;
}

export class CodeGenerator {
  private memoryMapper: MemoryMapper;
  private nextLabelId = 0;
  private nextTempId = 0;
  private tempAllocator = new Map<string, number>(); // Reuse temps per block

  constructor(memoryMapper: MemoryMapper) {
    this.memoryMapper = memoryMapper;
  }

  /**
   * Generate code from IR
   */
  generate(blocks: BasicBlock[], memoryMap: MemoryMap): GeneratedInstruction[] {
    const instructions: GeneratedInstruction[] = [];

    // Generate initialization code
    this.generateInitialization(instructions, memoryMap);

    // Generate code for each block
    for (const block of blocks) {
      // Add block label
      instructions.push({
        opcode: 0, // DATA
        operand: 0,
        label: block.name,
        comment: `Block: ${block.name}`,
      });

      // Reset temp allocator for each block
      this.tempAllocator.clear();

      // Generate instructions for the block
      for (const instr of block.instructions) {
        this.generateInstruction(instr, instructions, memoryMap);
      }
    }

    // Add final halt if not present
    const lastInstr = instructions[instructions.length - 1];
    if (!lastInstr || lastInstr.opcode !== 100) {
      instructions.push({
        opcode: 100, // HLT
        operand: 0,
        comment: 'Program end',
      });
    }

    return instructions;
  }

  private generateInitialization(
    instructions: GeneratedInstruction[],
    memoryMap: MemoryMap
  ): void {
    // Initialize CONST_0 to 0
    instructions.push({
      opcode: 90, // NULL
      operand: this.memoryMapper.getAddress(memoryMap, 'CONST_0'),
      comment: 'Initialize CONST_0 = 0',
    });

    // Initialize CONST_1 to 1
    instructions.push({
      opcode: 90, // NULL
      operand: this.memoryMapper.getAddress(memoryMap, 'CONST_1'),
      comment: 'Initialize CONST_1 = 0',
    });
    instructions.push({
      opcode: 70, // INC
      operand: this.memoryMapper.getAddress(memoryMap, 'CONST_1'),
      comment: 'CONST_1 = 1',
    });
  }

  private generateInstruction(
    instr: IRInstruction,
    instructions: GeneratedInstruction[],
    memoryMap: MemoryMap
  ): void {
    if (instr instanceof IRConstant) {
      this.generateConstant(instr, instructions, memoryMap);
    } else if (instr instanceof IRAssign) {
      this.generateAssign(instr, instructions, memoryMap);
    } else if (instr instanceof IRBinary) {
      this.generateBinary(instr, instructions, memoryMap);
    } else if (instr instanceof IRUnary) {
      this.generateUnary(instr, instructions, memoryMap);
    } else if (instr instanceof IRLabel) {
      this.generateLabel(instr, instructions);
    } else if (instr instanceof IRJump) {
      this.generateJump(instr, instructions);
    } else if (instr instanceof IRConditionalJump) {
      this.generateConditionalJump(instr, instructions);
    } else if (instr instanceof IRHalt) {
      this.generateHalt(instructions);
    }
  }

  private generateConstant(
    instr: IRConstant,
    instructions: GeneratedInstruction[],
    memoryMap: MemoryMap
  ): void {
    const destAddr = this.memoryMapper.getAddress(memoryMap, instr.dest);

    if (instr.value === 0) {
      // Use NULL for zero
      instructions.push({
        opcode: 90, // NULL
        operand: destAddr,
        comment: `${instr.dest} = 0`,
      });
    } else if (instr.value === 1) {
      // Copy CONST_1
      const const1Addr = this.memoryMapper.getAddress(memoryMap, 'CONST_1');
      instructions.push({
        opcode: 10, // TAKE
        operand: const1Addr,
        comment: `Load CONST_1`,
      });
      instructions.push({
        opcode: 40, // SAVE
        operand: destAddr,
        comment: `${instr.dest} = 1`,
      });
    } else {
      // Generate value using NULL + INC loops for small positive values
      if (instr.value > 0 && instr.value <= 10) {
        instructions.push({
          opcode: 90, // NULL
          operand: destAddr,
          comment: `${instr.dest} = 0`,
        });
        for (let i = 0; i < instr.value; i++) {
          instructions.push({
            opcode: 70, // INC
            operand: destAddr,
            comment: `${instr.dest}++`,
          });
        }
      } else {
        throw new Error(
          `Large constants not supported yet: ${instr.value}. Use initialMemory in tests.`
        );
      }
    }
  }

  private generateAssign(
    instr: IRAssign,
    instructions: GeneratedInstruction[],
    memoryMap: MemoryMap
  ): void {
    const srcAddr = this.memoryMapper.getAddress(memoryMap, instr.src);
    const destAddr = this.memoryMapper.getAddress(memoryMap, instr.dest);

    // MOVE src → dest: TAKE src; SAVE dest
    instructions.push({
      opcode: 10, // TAKE
      operand: srcAddr,
      comment: `Load ${instr.src}`,
    });
    instructions.push({
      opcode: 40, // SAVE
      operand: destAddr,
      comment: `${instr.dest} = ${instr.src}`,
    });
  }

  private generateBinary(
    instr: IRBinary,
    instructions: GeneratedInstruction[],
    memoryMap: MemoryMap
  ): void {
    const leftAddr = this.memoryMapper.getAddress(memoryMap, instr.left);
    const rightAddr = this.memoryMapper.getAddress(memoryMap, instr.right);
    const destAddr = this.memoryMapper.getAddress(memoryMap, instr.dest);

    switch (instr.op) {
      case '+':
        // ADD: TAKE left; ADD right; SAVE dest
        instructions.push({
          opcode: 10, // TAKE
          operand: leftAddr,
          comment: `Load ${instr.left}`,
        });
        instructions.push({
          opcode: 20, // ADD
          operand: rightAddr,
          comment: `Add ${instr.right}`,
        });
        instructions.push({
          opcode: 40, // SAVE
          operand: destAddr,
          comment: `${instr.dest} = ${instr.left} + ${instr.right}`,
        });
        break;

      case '-':
        // SUB: TAKE left; SUB right; SAVE dest
        instructions.push({
          opcode: 10, // TAKE
          operand: leftAddr,
          comment: `Load ${instr.left}`,
        });
        instructions.push({
          opcode: 30, // SUB
          operand: rightAddr,
          comment: `Subtract ${instr.right}`,
        });
        instructions.push({
          opcode: 40, // SAVE
          operand: destAddr,
          comment: `${instr.dest} = ${instr.left} - ${instr.right}`,
        });
        break;

      case '*':
        this.generateMultiply(instr, instructions, memoryMap);
        break;

      case '/':
        this.generateDivide(instr, instructions, memoryMap);
        break;

      case '==':
        this.generateEquals(instr, instructions, memoryMap);
        break;

      case '!=':
        this.generateNotEquals(instr, instructions, memoryMap);
        break;

      case '>':
        this.generateGreaterThan(instr, instructions, memoryMap);
        break;

      case '<':
        this.generateLessThan(instr, instructions, memoryMap);
        break;

      case '>=':
        this.generateGreaterEqual(instr, instructions, memoryMap);
        break;

      case '<=':
        this.generateLessEqual(instr, instructions, memoryMap);
        break;

      default:
        throw new Error(`Unsupported binary operator: ${instr.op}`);
    }
  }

  private generateMultiply(
    instr: IRBinary,
    instructions: GeneratedInstruction[],
    memoryMap: MemoryMap
  ): void {
    const leftAddr = this.memoryMapper.getAddress(memoryMap, instr.left);
    const rightAddr = this.memoryMapper.getAddress(memoryMap, instr.right);
    const destAddr = this.memoryMapper.getAddress(memoryMap, instr.dest);

    // Get temp addresses for multiplication
    const prodTemp = this.getTempAddress(memoryMap, '_mul_prod');
    const cntTemp = this.getTempAddress(memoryMap, '_mul_cnt');
    const flagTemp = this.getTempAddress(memoryMap, '_mul_flag');

    const loopLabel = `mul_loop_${this.nextLabelId}`;
    const addLabel = `mul_add_${this.nextLabelId}`;
    const endLabel = `mul_end_${this.nextLabelId++}`;

    // Initialize: PROD = 0, CNT = right
    instructions.push({
      opcode: 90, // NULL
      operand: prodTemp,
      comment: 'PROD = 0',
    });
    instructions.push({
      opcode: 10, // TAKE
      operand: rightAddr,
      comment: `Load ${instr.right}`,
    });
    instructions.push({
      opcode: 40, // SAVE
      operand: cntTemp,
      comment: 'CNT = right operand',
    });

    // Loop start
    instructions.push({
      opcode: 0, // DATA
      operand: 0,
      label: loopLabel,
      comment: 'Multiplication loop',
    });

    // Check if CNT == 0: FLAG = (CNT != 0)
    instructions.push({
      opcode: 90, // NULL
      operand: flagTemp,
      comment: 'FLAG = 0',
    });
    instructions.push({
      opcode: 60, // TST
      operand: cntTemp,
      comment: 'Test CNT',
    });
    instructions.push({
      opcode: 70, // INC
      operand: flagTemp,
      comment: 'FLAG = (CNT != 0)',
    });

    // If FLAG != 0, continue; else exit
    instructions.push({
      opcode: 60, // TST
      operand: flagTemp,
      comment: 'Test FLAG',
    });
    instructions.push({
      opcode: 50, // JMP
      operand: 0, // Will be resolved by emitter
      comment: `Jump to ${addLabel}`,
      label: addLabel,
    });
    instructions.push({
      opcode: 50, // JMP
      operand: 0, // Will be resolved by emitter
      comment: `Jump to ${endLabel}`,
      label: endLabel,
    });

    // Add block: PROD += left, CNT--
    instructions.push({
      opcode: 0, // DATA
      operand: 0,
      label: addLabel,
      comment: 'Add block',
    });
    instructions.push({
      opcode: 10, // TAKE
      operand: prodTemp,
      comment: 'Load PROD',
    });
    instructions.push({
      opcode: 20, // ADD
      operand: leftAddr,
      comment: `Add ${instr.left}`,
    });
    instructions.push({
      opcode: 40, // SAVE
      operand: prodTemp,
      comment: 'PROD += left',
    });
    instructions.push({
      opcode: 80, // DEC
      operand: cntTemp,
      comment: 'CNT--',
    });
    instructions.push({
      opcode: 50, // JMP
      operand: 0, // Will be resolved by emitter
      comment: `Jump to ${loopLabel}`,
      label: loopLabel,
    });

    // End: move result
    instructions.push({
      opcode: 0, // DATA
      operand: 0,
      label: endLabel,
      comment: 'End multiplication',
    });
    instructions.push({
      opcode: 10, // TAKE
      operand: prodTemp,
      comment: 'Load result',
    });
    instructions.push({
      opcode: 40, // SAVE
      operand: destAddr,
      comment: `${instr.dest} = ${instr.left} * ${instr.right}`,
    });
  }

  private generateDivide(
    _instr: IRBinary,
    _instructions: GeneratedInstruction[],
    _memoryMap: MemoryMap
  ): void {
    // TODO: Implement division with error checking
    throw new Error('Division not implemented yet');
  }

  private generateEquals(
    instr: IRBinary,
    instructions: GeneratedInstruction[],
    memoryMap: MemoryMap
  ): void {
    const leftAddr = this.memoryMapper.getAddress(memoryMap, instr.left);
    const rightAddr = this.memoryMapper.getAddress(memoryMap, instr.right);
    const destAddr = this.memoryMapper.getAddress(memoryMap, instr.dest);
    const tempAddr = this.getTempAddress(memoryMap, '_eq_temp');
    const const1Addr = this.memoryMapper.getAddress(memoryMap, 'CONST_1');

    // EQ(A,B): TAKE A; SUB B; SAVE T; NULL FLAG; TST T; INC FLAG; TAKE CONST_1; SUB FLAG; SAVE FLAG
    instructions.push({
      opcode: 10, // TAKE
      operand: leftAddr,
      comment: `Load ${instr.left}`,
    });
    instructions.push({
      opcode: 30, // SUB
      operand: rightAddr,
      comment: `Subtract ${instr.right}`,
    });
    instructions.push({
      opcode: 40, // SAVE
      operand: tempAddr,
      comment: 'Save difference',
    });
    instructions.push({
      opcode: 90, // NULL
      operand: destAddr,
      comment: `${instr.dest} = 0`,
    });
    instructions.push({
      opcode: 60, // TST
      operand: tempAddr,
      comment: 'Test difference',
    });
    instructions.push({
      opcode: 70, // INC
      operand: destAddr,
      comment: `${instr.dest} = (diff != 0)`,
    });
    // Invert the result: FLAG = 1 - FLAG
    instructions.push({
      opcode: 10, // TAKE
      operand: const1Addr,
      comment: 'Load 1',
    });
    instructions.push({
      opcode: 30, // SUB
      operand: destAddr,
      comment: 'Subtract flag',
    });
    instructions.push({
      opcode: 40, // SAVE
      operand: destAddr,
      comment: `${instr.dest} = ${instr.left} == ${instr.right}`,
    });
  }

  private generateNotEquals(
    instr: IRBinary,
    instructions: GeneratedInstruction[],
    memoryMap: MemoryMap
  ): void {
    const leftAddr = this.memoryMapper.getAddress(memoryMap, instr.left);
    const rightAddr = this.memoryMapper.getAddress(memoryMap, instr.right);
    const destAddr = this.memoryMapper.getAddress(memoryMap, instr.dest);
    const tempAddr = this.getTempAddress(memoryMap, '_neq_temp');

    // NEQ(A,B): TAKE A; SUB B; SAVE T; NULL FLAG; TST T; INC FLAG
    instructions.push({
      opcode: 10, // TAKE
      operand: leftAddr,
      comment: `Load ${instr.left}`,
    });
    instructions.push({
      opcode: 30, // SUB
      operand: rightAddr,
      comment: `Subtract ${instr.right}`,
    });
    instructions.push({
      opcode: 40, // SAVE
      operand: tempAddr,
      comment: 'Save difference',
    });
    instructions.push({
      opcode: 90, // NULL
      operand: destAddr,
      comment: `${instr.dest} = 0`,
    });
    instructions.push({
      opcode: 60, // TST
      operand: tempAddr,
      comment: 'Test difference',
    });
    instructions.push({
      opcode: 70, // INC
      operand: destAddr,
      comment: `${instr.dest} = ${instr.left} != ${instr.right}`,
    });
  }

  private generateUnary(
    instr: IRUnary,
    instructions: GeneratedInstruction[],
    memoryMap: MemoryMap
  ): void {
    const operandAddr = this.memoryMapper.getAddress(memoryMap, instr.operand);
    const destAddr = this.memoryMapper.getAddress(memoryMap, instr.dest);

    switch (instr.op) {
      case '-': {
        // Negate: dest = 0 - operand
        const const0Addr = this.memoryMapper.getAddress(memoryMap, 'CONST_0');
        instructions.push({
          opcode: 10, // TAKE
          operand: const0Addr,
          comment: 'Load 0',
        });
        instructions.push({
          opcode: 30, // SUB
          operand: operandAddr,
          comment: `Subtract ${instr.operand}`,
        });
        instructions.push({
          opcode: 40, // SAVE
          operand: destAddr,
          comment: `${instr.dest} = -${instr.operand}`,
        });
        break;
      }

      default:
        throw new Error(`Unsupported unary operator: ${instr.op}`);
    }
  }

  private generateLabel(
    instr: IRLabel,
    instructions: GeneratedInstruction[]
  ): void {
    instructions.push({
      opcode: 0, // DATA
      operand: 0,
      label: instr.name,
      comment: `Label: ${instr.name}`,
    });
  }

  private generateJump(
    instr: IRJump,
    instructions: GeneratedInstruction[]
  ): void {
    instructions.push({
      opcode: 50, // JMP
      operand: 0, // Will be resolved by emitter
      comment: `Jump to ${instr.target}`,
      label: instr.target,
    });
  }

  private generateConditionalJump(
    instr: IRConditionalJump,
    instructions: GeneratedInstruction[]
  ): void {
    // We need the condition address to test
    // This is handled by the emitter which will resolve the condition symbol
    instructions.push({
      opcode: 60, // TST
      operand: 0, // Will be resolved by emitter to condition address
      comment: `Test ${instr.condition}`,
    });
    instructions.push({
      opcode: 50, // JMP
      operand: 0, // Will be resolved by emitter
      comment: `Jump to ${instr.target} if ${instr.condition} != 0`,
      label: instr.target,
    });
  }

  private generateHalt(instructions: GeneratedInstruction[]): void {
    instructions.push({
      opcode: 100, // HLT
      operand: 0,
      comment: 'Halt program',
    });
  }

  private generateGreaterThan(
    instr: IRBinary,
    instructions: GeneratedInstruction[],
    memoryMap: MemoryMap
  ): void {
    // a > b  =>  a - b > 0 (positive test)
    const leftAddr = this.memoryMapper.getAddress(memoryMap, instr.left);
    const rightAddr = this.memoryMapper.getAddress(memoryMap, instr.right);
    const destAddr = this.memoryMapper.getAddress(memoryMap, instr.dest);
    const tempAddr = this.getTempAddress(memoryMap, '_cmp_temp');

    // Load left value
    instructions.push({
      opcode: 10, // TAKE
      operand: leftAddr,
      comment: `Load ${instr.left}`,
    });

    // Subtract right value
    instructions.push({
      opcode: 30, // SUB
      operand: rightAddr,
      comment: `Subtract ${instr.right}`,
    });

    // Save difference
    instructions.push({
      opcode: 40, // SAVE
      operand: tempAddr,
      comment: 'Save difference',
    });

    // Test if positive (greater than 0)
    instructions.push({
      opcode: 60, // TST
      operand: tempAddr,
      comment: `Test if ${instr.left} > ${instr.right}`,
    });

    // Store 1 in dest (will be overwritten if false)
    instructions.push({
      opcode: 10, // TAKE
      operand: 151, // CONST_1
      comment: 'Load 1 (true)',
    });

    instructions.push({
      opcode: 40, // SAVE
      operand: destAddr,
      comment: `${instr.dest} = true`,
    });

    // Skip next instruction if test was true (positive)
    const skipLabel = `gt_skip_${this.nextLabelId++}`;
    instructions.push({
      opcode: 50, // JMP
      operand: 0, // Will be resolved by emitter
      label: skipLabel,
      comment: 'Jump if positive',
    });

    // Store 0 in dest (false case)
    instructions.push({
      opcode: 10, // TAKE
      operand: 150, // CONST_0
      comment: 'Load 0 (false)',
    });

    instructions.push({
      opcode: 40, // SAVE
      operand: destAddr,
      comment: `${instr.dest} = false`,
    });

    // Skip target
    instructions.push({
      opcode: 90, // NULL (no-op)
      operand: 0,
      comment: skipLabel,
    });
  }

  private generateLessThan(
    instr: IRBinary,
    instructions: GeneratedInstruction[],
    memoryMap: MemoryMap
  ): void {
    // a < b  =>  b > a (swap operands)
    const swappedInstr: IRBinary = {
      ...instr,
      left: instr.right,
      right: instr.left,
    };
    this.generateGreaterThan(swappedInstr, instructions, memoryMap);
  }

  private generateGreaterEqual(
    instr: IRBinary,
    instructions: GeneratedInstruction[],
    memoryMap: MemoryMap
  ): void {
    // a >= b  =>  !(b > a)
    const leftAddr = this.memoryMapper.getAddress(memoryMap, instr.right);
    const rightAddr = this.memoryMapper.getAddress(memoryMap, instr.left);
    const destAddr = this.memoryMapper.getAddress(memoryMap, instr.dest);
    const tempAddr = this.getTempAddress(memoryMap, '_cmp_temp');

    // Load right value (instr.right)
    instructions.push({
      opcode: 10, // TAKE
      operand: leftAddr,
      comment: `Load ${instr.right}`,
    });

    // Subtract left value (instr.left)
    instructions.push({
      opcode: 30, // SUB
      operand: rightAddr,
      comment: `Subtract ${instr.left}`,
    });

    // Save difference
    instructions.push({
      opcode: 40, // SAVE
      operand: tempAddr,
      comment: 'Save difference',
    });

    // Test if positive (right > left, i.e., left < right)
    instructions.push({
      opcode: 60, // TST
      operand: tempAddr,
      comment: `Test if ${instr.right} > ${instr.left}`,
    });

    // Store 0 in dest (will be overwritten with 1 if false - inverted logic)
    instructions.push({
      opcode: 10, // TAKE
      operand: 150, // CONST_0
      comment: 'Load 0 (false)',
    });

    instructions.push({
      opcode: 40, // SAVE
      operand: destAddr,
      comment: `${instr.dest} = false`,
    });

    // Skip next instruction if test was true (right > left, so left NOT >= right)
    const skipLabel = `ge_skip_${this.nextLabelId++}`;
    instructions.push({
      opcode: 50, // JMP
      operand: 0, // Will be resolved by emitter
      label: skipLabel,
      comment: 'Jump if right > left',
    });

    // Store 1 in dest (true case - left >= right)
    instructions.push({
      opcode: 10, // TAKE
      operand: 151, // CONST_1
      comment: 'Load 1 (true)',
    });

    instructions.push({
      opcode: 40, // SAVE
      operand: destAddr,
      comment: `${instr.dest} = true`,
    });

    // Skip target
    instructions.push({
      opcode: 90, // NULL (no-op)
      operand: 0,
      comment: skipLabel,
    });
  }

  private generateLessEqual(
    instr: IRBinary,
    instructions: GeneratedInstruction[],
    memoryMap: MemoryMap
  ): void {
    // a <= b  =>  !(a > b)
    // Use the same approach as greater than, but with inverted logic
    const leftAddr = this.memoryMapper.getAddress(memoryMap, instr.left);
    const rightAddr = this.memoryMapper.getAddress(memoryMap, instr.right);
    const destAddr = this.memoryMapper.getAddress(memoryMap, instr.dest);
    const tempAddr = this.getTempAddress(memoryMap, '_cmp_temp');

    // Load left value
    instructions.push({
      opcode: 10, // TAKE
      operand: leftAddr,
      comment: `Load ${instr.left}`,
    });

    // Subtract right value
    instructions.push({
      opcode: 30, // SUB
      operand: rightAddr,
      comment: `Subtract ${instr.right}`,
    });

    // Save difference
    instructions.push({
      opcode: 40, // SAVE
      operand: tempAddr,
      comment: 'Save difference',
    });

    // Test if positive (left > right)
    instructions.push({
      opcode: 60, // TST
      operand: tempAddr,
      comment: `Test if ${instr.left} > ${instr.right}`,
    });

    // Store 0 in dest (will be overwritten with 1 if false - inverted logic)
    instructions.push({
      opcode: 10, // TAKE
      operand: 150, // CONST_0
      comment: 'Load 0 (false)',
    });

    instructions.push({
      opcode: 40, // SAVE
      operand: destAddr,
      comment: `${instr.dest} = false`,
    });

    // Skip next instruction if test was true (left > right, so left NOT <= right)
    const skipLabel = `le_skip_${this.nextLabelId++}`;
    instructions.push({
      opcode: 50, // JMP
      operand: 0, // Will be resolved by emitter
      label: skipLabel,
      comment: 'Jump if left > right',
    });

    // Store 1 in dest (true case - left <= right)
    instructions.push({
      opcode: 10, // TAKE
      operand: 151, // CONST_1
      comment: 'Load 1 (true)',
    });

    instructions.push({
      opcode: 40, // SAVE
      operand: destAddr,
      comment: `${instr.dest} = true`,
    });

    // Skip target
    instructions.push({
      opcode: 90, // NULL (no-op)
      operand: 0,
      comment: skipLabel,
    });
  }

  private getTempAddress(memoryMap: MemoryMap, baseName: string): number {
    // Reuse temp addresses within a block
    if (this.tempAllocator.has(baseName)) {
      const addr = this.tempAllocator.get(baseName);
      if (addr === undefined) {
        throw new Error(`Temp address not found: ${baseName}`);
      }
      return addr;
    }

    // Find a free temp slot
    const tempStart = 960;
    const tempEnd = 989;
    for (let addr = tempStart; addr <= tempEnd; addr++) {
      if (!this.isTempAddressUsed(addr)) {
        this.tempAllocator.set(baseName, addr);
        return addr;
      }
    }

    throw new Error(`No free temporary address for ${baseName}`);
  }

  private isTempAddressUsed(addr: number): boolean {
    for (const usedAddr of this.tempAllocator.values()) {
      if (usedAddr === addr) {
        return true;
      }
    }
    return false;
  }
}
