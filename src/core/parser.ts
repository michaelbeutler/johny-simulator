// JOHNNY RAM Program Parser with improved syntax handling
import { JOHNNY_CONFIG, OPCODES } from './opcodes';

export interface ParseResult {
  ram: number[];
  errors: string[];
  warnings: string[];
  lineMapping: Map<number, number>; // Maps RAM address to source line number
}

export class RamParser {
  private errors: string[] = [];
  private warnings: string[] = [];
  private lineMapping: Map<number, number> = new Map();

  /**
   * Parse a .ram file content into memory array
   */
  parse(content: string): ParseResult {
    this.errors = [];
    this.warnings = [];
    this.lineMapping.clear();

    const ram: number[] = new Array(JOHNNY_CONFIG.MEMORY_SIZE).fill(0);
    const lines = content.split('\n');

    lines.forEach((line, lineIndex) => {
      const processedLine = this.preprocessLine(line);
      if (processedLine.value !== null) {
        this.processInstruction(
          processedLine.value,
          processedLine.address,
          lineIndex + 1,
          ram
        );
      }
    });

    return {
      ram,
      errors: [...this.errors],
      warnings: [...this.warnings],
      lineMapping: new Map(this.lineMapping),
    };
  }

  /**
   * Preprocess a line to handle comments and extract instruction
   */
  private preprocessLine(line: string): {
    value: number | null;
    address: number;
  } {
    // Remove comments (support //, ;, #)
    const commentStripped = line.split(/(;|#|\/\/)/)[0].trim();

    if (commentStripped === '') {
      return { value: null, address: -1 };
    }

    // Check for explicit address syntax: @address:value
    const addressMatch = commentStripped.match(/^\s*@(\d+):(\d+)/);
    if (addressMatch) {
      const address = Number.parseInt(addressMatch[1], 10);
      const value = Number.parseInt(addressMatch[2], 10);
      return { value, address };
    }

    // Extract the first integer from the line (sequential addressing)
    const match = commentStripped.match(/^\s*(\d+)/);
    if (!match) {
      return { value: null, address: -1 };
    }

    const value = Number.parseInt(match[1], 10);

    // Use sequential addressing (line number = address)
    return { value, address: -1 }; // -1 means use line index
  }

  /**
   * Process a single instruction and place it in RAM
   */
  private processInstruction(
    value: number,
    explicitAddress: number,
    lineNumber: number,
    ram: number[]
  ): void {
    // Determine the RAM address
    const address = explicitAddress >= 0 ? explicitAddress : lineNumber - 1;

    // Validate address bounds
    if (address >= JOHNNY_CONFIG.MEMORY_SIZE) {
      this.warnings.push(
        `Line ${lineNumber}: Address ${address} >= ${JOHNNY_CONFIG.MEMORY_SIZE}, instruction ignored`
      );
      return;
    }

    // Validate value range
    if (value < 0 || value > JOHNNY_CONFIG.MAX_VALUE) {
      this.errors.push(
        `Line ${lineNumber}: Value ${value} outside valid range 0..${JOHNNY_CONFIG.MAX_VALUE}`
      );
      return;
    }

    // Store in RAM and track line mapping
    ram[address] = value;
    this.lineMapping.set(address, lineNumber);

    // Validate instruction format
    this.validateInstructionFormat(value, address, lineNumber);
  }

  /**
   * Validate instruction format and operand constraints
   */
  private validateInstructionFormat(
    value: number,
    address: number,
    lineNumber: number
  ): void {
    // Extract opcode: Math.floor(instruction / 1000)
    const opcode = Math.floor(value / 1000);
    const operand = value % 1000; // Last 3 digits

    // Validate opcode range (0, 1, 2, ..., 10)
    if (opcode < 0 || opcode > OPCODES.HLT) {
      this.errors.push(
        `Line ${lineNumber}: Invalid opcode ${opcode} at address ${address}`
      );
      return;
    }

    // Validate operands based on instruction type
    this.validateOperand(opcode, operand, address, lineNumber);
  }

  /**
   * Validate operand based on opcode requirements
   */
  private validateOperand(
    opcode: number,
    operand: number,
    address: number,
    lineNumber: number
  ): void {
    // Instructions 1-9 require valid address operands (000-999)
    if (opcode >= OPCODES.TAKE && opcode <= OPCODES.NULL) {
      if (operand < 0 || operand >= JOHNNY_CONFIG.MEMORY_SIZE) {
        this.errors.push(
          `Line ${lineNumber}: Invalid address operand ${operand.toString().padStart(3, '0')} for opcode ${opcode} at address ${address}`
        );
      }
    }

    // HLT (opcode 100) should ideally have operand 000
    if (opcode === OPCODES.HLT && operand !== 0) {
      this.warnings.push(
        `Line ${lineNumber}: HLT instruction ignores operand; received ${operand.toString().padStart(3, '0')} at address ${address}`
      );
    }
  }

  /**
   * Parse from file path
   */
  parseFile(filePath: string): ParseResult {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return this.parse(content);
    } catch (error) {
      return {
        ram: new Array(JOHNNY_CONFIG.MEMORY_SIZE).fill(0),
        errors: [
          `Failed to read file ${filePath}: ${(error as Error).message}`,
        ],
        warnings: [],
        lineMapping: new Map(),
      };
    }
  }
}
