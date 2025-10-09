// JOHNNY RAM Program Validator with improved syntax checking
import {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ProgramStatistics,
  OpcodeMapping,
} from '../types';
import {
  DEFAULT_OPCODE_MAPPING,
  JOHNNY_CONFIG,
  isValidOpcode,
  OPCODES,
} from '../core/opcodes';
import { RamParser } from '../core/parser';

export class RamValidator {
  private opcodeMapping: OpcodeMapping;
  private parser: RamParser;

  constructor(opcodeMapping?: OpcodeMapping) {
    this.opcodeMapping = opcodeMapping || DEFAULT_OPCODE_MAPPING;
    this.parser = new RamParser();
  }

  /**
   * Validate a RAM program from file
   */
  validateFile(filePath: string): ValidationResult {
    const parseResult = this.parser.parseFile(filePath);

    if (parseResult.errors.length > 0) {
      return {
        isValid: false,
        errors: parseResult.errors.map(msg => ({
          type: 'SYNTAX' as const,
          address: -1,
          message: msg,
        })),
        warnings: parseResult.warnings.map(msg => ({
          type: 'STYLE' as const,
          address: -1,
          message: msg,
        })),
        statistics: this.createEmptyStatistics(),
      };
    }

    return this.validate(parseResult.ram, parseResult.lineMapping);
  }

  /**
   * Validate a RAM program from memory array
   */
  validate(
    ram: number[],
    _lineMapping?: Map<number, number>
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const statistics = this.calculateStatistics(ram);

    // Validate each instruction
    for (let addr = 0; addr < JOHNNY_CONFIG.MEMORY_SIZE; addr++) {
      const value = ram[addr];
      if (value === 0) continue; // Skip empty memory

      // Extract opcode from instruction format (OOXXX)
      const opcode = Math.floor(value / 1000);
      const operand = value % 1000;

      // Validate value range
      if (value < 0 || value > JOHNNY_CONFIG.MAX_VALUE) {
        errors.push({
          type: 'SYNTAX',
          address: addr,
          message: `Value ${value} outside valid range 0..${JOHNNY_CONFIG.MAX_VALUE}`,
          instruction: value,
        });
        continue;
      }

      // Skip validation for data words (opcode 0)
      if (opcode === OPCODES.DATA) continue;

      // Validate opcode
      if (!isValidOpcode(opcode, this.opcodeMapping)) {
        console.log(
          `DEBUG: Invalid opcode ${opcode} from instruction ${value} at address ${addr}`
        );
        console.log(
          `DEBUG: Available opcodes:`,
          Object.keys(this.opcodeMapping)
        );
        errors.push({
          type: 'SYNTAX',
          address: addr,
          message: `Invalid opcode ${opcode.toString().padStart(2, '0')}`,
          instruction: value,
        });
        continue;
      }

      // Validate operands based on instruction type
      this.validateOperand(opcode, operand, addr, value, errors, warnings);

      // Check for potential logic issues
      this.checkLogicIssues(opcode, operand, addr, ram, warnings);
    }

    // Perform program-level validations
    this.validateProgramStructure(ram, statistics, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      statistics,
    };
  }

  /**
   * Validate instruction operand
   */
  private validateOperand(
    opcode: number,
    operand: number,
    address: number,
    instruction: number,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const opcodeInfo = this.opcodeMapping[opcode];

    if (!opcodeInfo) return;

    // Instructions 10-90 require valid address operands (000-999)
    if (opcode >= OPCODES.TAKE && opcode <= OPCODES.NULL) {
      if (operand < 0 || operand >= JOHNNY_CONFIG.MEMORY_SIZE) {
        errors.push({
          type: 'SYNTAX',
          address: address,
          message: `Invalid address operand ${operand.toString().padStart(3, '0')} for ${opcodeInfo.name}`,
          instruction: instruction,
        });
      }
    }

    // HLT should have operand 000
    if (opcode === OPCODES.HLT && operand !== 0) {
      warnings.push({
        type: 'STYLE',
        address: address,
        message: `HLT instruction ignores operand; received ${operand.toString().padStart(3, '0')}`,
        instruction: parseInt(
          `${opcode.toString().padStart(2, '0')}${operand.toString().padStart(3, '0')}`
        ),
      });
    }
  }

  /**
   * Calculate program statistics
   */
  private calculateStatistics(ram: number[]): ProgramStatistics {
    const instructionCount: Record<number, number> = {};
    let totalInstructions = 0;
    let hasHalt = false;
    let maxAddress = 0;
    let dataWords = 0;
    let potentialInfiniteLoops = 0;

    for (let addr = 0; addr < JOHNNY_CONFIG.MEMORY_SIZE; addr++) {
      const value = ram[addr];
      if (value === 0) continue;

      // Extract opcode from instruction format (OOXXX)
      const opcode = Math.floor(value / 1000);
      const operand = value % 1000;

      if (opcode === OPCODES.DATA) {
        dataWords++;
      } else {
        totalInstructions++;
        instructionCount[opcode] = (instructionCount[opcode] || 0) + 1;

        if (opcode === OPCODES.HLT) {
          hasHalt = true;
        }

        if (opcode === OPCODES.JMP && operand === addr) {
          potentialInfiniteLoops++;
        }
      }

      maxAddress = addr;
    }

    return {
      totalInstructions,
      instructionCount,
      hasHalt,
      maxAddress,
      dataWords,
      potentialInfiniteLoops,
    };
  }

  /**
   * Check for potential logic issues
   */
  private checkLogicIssues(
    opcode: number,
    operand: number,
    address: number,
    ram: number[],
    warnings: ValidationWarning[]
  ): void {
    // Check for JMP to same address (only warn if no HLT in program)
    if (opcode === OPCODES.JMP && operand === address) {
      const hasHalt = this.programHasHalt(ram);
      if (!hasHalt) {
        warnings.push({
          type: 'SAFETY',
          address: address,
          message: `JMP to same address ${address} without HALT instruction - potential infinite loop`,
          instruction: parseInt(
            `${opcode.toString().padStart(2, '0')}${operand.toString().padStart(3, '0')}`
          ),
        });
      } else {
        warnings.push({
          type: 'PERFORMANCE',
          address: address,
          message: `JMP to same address ${address} - active waiting loop`,
          instruction: parseInt(
            `${opcode.toString().padStart(2, '0')}${operand.toString().padStart(3, '0')}`
          ),
        });
      }
    }
  }

  /**
   * Validate overall program structure
   */
  private validateProgramStructure(
    ram: number[],
    statistics: ProgramStatistics,
    warnings: ValidationWarning[]
  ): void {
    // Check for HALT instruction
    if (!statistics.hasHalt) {
      warnings.push({
        type: 'SAFETY',
        address: -1,
        message:
          'Program does not contain a HALT instruction - may run indefinitely',
      });
    }
  }

  /**
   * Check if program has HALT instruction
   */
  private programHasHalt(ram: number[]): boolean {
    return ram.some(value => {
      // Extract opcode from instruction format (OOXXX)
      const opcode = Math.floor(value / 1000);
      return opcode === OPCODES.HLT;
    });
  }

  /**
   * Create empty statistics object
   */
  private createEmptyStatistics(): ProgramStatistics {
    return {
      totalInstructions: 0,
      instructionCount: {},
      hasHalt: false,
      maxAddress: 0,
      dataWords: 0,
      potentialInfiniteLoops: 0,
    };
  }
}
