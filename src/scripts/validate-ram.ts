#!/usr/bin/env node
// Enhanced JOHNNY RAM Validator with TypeScript and improved syntax handling
import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const chalk = require('chalk');
import { RamValidator } from '../validation/validator';
import { RamParser } from '../core/parser';
import {
  getInstructionName,
  DEFAULT_OPCODE_MAPPING,
  OPCODES,
} from '../core/opcodes';

class ValidatorCLI {
  private validator: RamValidator;
  private parser: RamParser;

  constructor() {
    this.validator = new RamValidator();
    this.parser = new RamParser();
  }

  /**
   * Main CLI entry point
   */
  run(): void {
    const args = process.argv.slice(2);

    if (args.length === 0) {
      this.showUsage();
      this.validateAllFiles();
    } else {
      const filePath = args[0];
      const shouldDisassemble =
        args.includes('--disassemble') || args.includes('-d');
      const verbose = args.includes('--verbose') || args.includes('-v');

      if (!fs.existsSync(filePath)) {
        console.log(chalk.red(`❌ File not found: ${filePath}`));
        process.exit(1);
      }

      const isValid = this.validateSingleFile(
        filePath,
        shouldDisassemble,
        verbose
      );
      process.exit(isValid ? 0 : 1);
    }
  }

  /**
   * Show usage information
   */
  private showUsage(): void {
    console.log(chalk.blue('🔍 JOHNNY RAM Validator v2.0 (TypeScript)'));
    console.log(chalk.gray('Usage: npm run validate <file.ram> [options]'));
    console.log(chalk.gray('Options:'));
    console.log(chalk.gray('  -d, --disassemble  Show program disassembly'));
    console.log(
      chalk.gray('  -v, --verbose      Show detailed validation info')
    );
    console.log();
  }

  /**
   * Validate all .ram files in current directory
   */
  private validateAllFiles(): void {
    const ramFiles = fs.readdirSync('.').filter(file => file.endsWith('.ram'));

    if (ramFiles.length === 0) {
      console.log(chalk.yellow('No .ram files found in current directory'));
      return;
    }

    console.log(
      chalk.blue(`Found ${ramFiles.length} .ram files, validating all...\n`)
    );

    let allValid = true;

    ramFiles.forEach(file => {
      const result = this.validateSingleFile(file, false, false);
      if (!result) allValid = false;
    });

    console.log(chalk.blue('\n' + '='.repeat(50)));
    if (allValid) {
      console.log(chalk.green('🎉 All files are valid!'));
    } else {
      console.log(chalk.red('❌ Some files have errors'));
    }
  }

  /**
   * Validate a single file
   */
  private validateSingleFile(
    filePath: string,
    shouldDisassemble: boolean,
    verbose: boolean
  ): boolean {
    console.log(chalk.blue(`\n🔍 Validating ${path.basename(filePath)}...`));

    try {
      const validationResult = this.validator.validateFile(filePath);

      // Show statistics
      if (verbose) {
        console.log(chalk.cyan(`📊 Program Statistics:`));
        console.log(
          `   Instructions: ${validationResult.statistics.totalInstructions}`
        );
        console.log(`   Data words: ${validationResult.statistics.dataWords}`);
        console.log(
          `   Max address: ${validationResult.statistics.maxAddress}`
        );
        console.log(
          `   Has HALT: ${validationResult.statistics.hasHalt ? 'Yes' : 'No'}`
        );

        if (
          Object.keys(validationResult.statistics.instructionCount).length > 0
        ) {
          console.log(`   Instruction breakdown:`);
          Object.entries(validationResult.statistics.instructionCount).forEach(
            ([opcode, count]) => {
              const name = getInstructionName(Number.parseInt(opcode));
              console.log(`     ${name}: ${count}`);
            }
          );
        }
      }

      // Show errors
      if (validationResult.errors.length > 0) {
        console.log(
          chalk.red(`\n❌ ${validationResult.errors.length} error(s) found:`)
        );
        validationResult.errors.forEach(error => {
          const location =
            error.address >= 0 ? ` at address ${error.address}` : '';
          console.log(chalk.red(`   • ${error.message}${location}`));
        });
      }

      // Show warnings
      if (validationResult.warnings.length > 0) {
        console.log(
          chalk.yellow(
            `\n⚠️  ${validationResult.warnings.length} warning(s) found:`
          )
        );
        validationResult.warnings.forEach(warning => {
          const location =
            warning.address >= 0 ? ` at address ${warning.address}` : '';
          console.log(chalk.yellow(`   • ${warning.message}${location}`));
        });
      }

      // Show disassembly if requested
      if (shouldDisassemble && validationResult.isValid) {
        const parseResult = this.parser.parseFile(filePath);
        if (parseResult.errors.length === 0) {
          this.disassemble(parseResult.ram);
        }
      }

      // Summary
      if (validationResult.isValid && validationResult.warnings.length === 0) {
        console.log(chalk.green(`✅ Program is valid!`));
      } else if (validationResult.isValid) {
        console.log(chalk.green(`✅ Program is valid (with warnings)`));
      } else {
        console.log(chalk.red(`❌ Program has errors`));
      }

      return validationResult.isValid;
    } catch (error) {
      console.log(
        chalk.red(`❌ Error validating file: ${(error as Error).message}`)
      );
      return false;
    }
  }

  /**
   * Disassemble program with enhanced formatting
   */
  private disassemble(ram: number[]): void {
    console.log(chalk.blue('\n📋 Program Disassembly:'));
    console.log(chalk.gray('Addr | Value | Instruction | Comment'));
    console.log(chalk.gray('-----|-------|-------------|--------'));

    let lastNonZero = 0;
    for (let addr = 0; addr < 1000; addr++) {
      if (ram[addr] !== 0) {
        lastNonZero = addr;
      }
    }

    // Show up to lastNonZero + 10 or max 100
    const maxAddr = Math.min(Math.max(lastNonZero + 10, 50), 1000);

    for (let addr = 0; addr < maxAddr; addr++) {
      const value = ram[addr];
      if (value !== 0 || addr <= lastNonZero) {
        const opcode = Math.floor(value / 1000) * 10;
        const operand = value % 1000;

        let instruction = '';
        let comment = '';

        if (opcode === OPCODES.DATA) {
          instruction = 'DATA';
          comment = `Value: ${value}`;
        } else if (DEFAULT_OPCODE_MAPPING[opcode]) {
          const opcodeInfo = DEFAULT_OPCODE_MAPPING[opcode];
          instruction = `${opcodeInfo.name} ${operand.toString().padStart(3, '0')}`;

          switch (opcode) {
            case OPCODES.TAKE:
              comment = `Load mem[${operand}] into ACC`;
              break;
            case OPCODES.ADD:
              comment = `ACC = ACC + mem[${operand}]`;
              break;
            case OPCODES.SUB:
              comment = `ACC = ACC - mem[${operand}]`;
              break;
            case OPCODES.SAVE:
              comment = `mem[${operand}] = ACC`;
              break;
            case OPCODES.JMP:
              comment = `Jump to address ${operand}`;
              break;
            case OPCODES.TST:
              comment = `Skip next if mem[${operand}] = 0`;
              break;
            case OPCODES.INC:
              comment = `mem[${operand}] = mem[${operand}] + 1`;
              break;
            case OPCODES.DEC:
              comment = `mem[${operand}] = mem[${operand}] - 1`;
              break;
            case OPCODES.NULL:
              comment = `mem[${operand}] = 0`;
              break;
            case OPCODES.HLT:
              comment = `Halt program`;
              break;
          }
        } else {
          instruction = `INVALID`;
          comment = `Unknown opcode ${opcode}`;
        }

        const addrStr = addr.toString().padStart(3, '0');
        const valueStr = value.toString().padStart(5, '0');
        const instrStr = instruction.padEnd(11);

        if (value === 0) {
          console.log(
            chalk.gray(`${addrStr}  | ${valueStr} | ${instrStr} | ${comment}`)
          );
        } else if (opcode === 0) {
          console.log(
            chalk.cyan(`${addrStr}  | ${valueStr} | ${instrStr} | ${comment}`)
          );
        } else {
          console.log(`${addrStr}  | ${valueStr} | ${instrStr} | ${comment}`);
        }
      }
    }

    if (lastNonZero >= maxAddr) {
      console.log(
        chalk.gray(
          `... (${lastNonZero - maxAddr + 1} more addresses with data)`
        )
      );
    }
  }
}

// CLI execution
if (require.main === module) {
  const cli = new ValidatorCLI();
  cli.run();
}
