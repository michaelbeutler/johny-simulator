#!/usr/bin/env node
// Interactive JOHNNY RAM Simulator
import * as fs from 'fs';
import * as readline from 'readline';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const chalk = require('chalk');
import { JohnnySimulator } from '../core/simulator';
import { RamValidator } from '../validation/validator';
import { RamParser } from '../core/parser';
import { ExecutionState } from '../types';
import { getInstructionName } from '../core/opcodes';

class InteractiveSimulator {
  private simulator: JohnnySimulator;
  private validator: RamValidator;
  private parser: RamParser;
  private rl: readline.Interface;
  private currentState?: ExecutionState;
  private originalRam: number[] = [];

  constructor() {
    this.simulator = new JohnnySimulator();
    this.validator = new RamValidator();
    this.parser = new RamParser();

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Start the interactive simulator
   */
  async start(): Promise<void> {
    console.log(chalk.blue('🖥️  JOHNNY RAM Interactive Simulator v2.0'));
    console.log(chalk.blue('='.repeat(50)));

    await this.showHelp();
    await this.mainLoop();

    this.rl.close();
  }

  /**
   * Main interaction loop
   */
  private async mainLoop(): Promise<void> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const command = await this.prompt('\n> ');
        const [cmd, ...args] = command.trim().split(/\\s+/);

        switch (cmd.toLowerCase()) {
          case 'load':
            await this.loadProgram(args[0]);
            break;
          case 'run':
            await this.runProgram();
            break;
          case 'step':
            await this.stepProgram();
            break;
          case 'reset':
            await this.resetProgram();
            break;
          case 'state':
            this.showState();
            break;
          case 'memory':
            this.showMemory(args[0], args[1]);
            break;
          case 'trace':
            this.showTrace();
            break;
          case 'validate':
            await this.validateCurrentProgram();
            break;
          case 'set':
            this.setMemory(args[0], args[1]);
            break;
          case 'help':
            await this.showHelp();
            break;
          case 'quit':
          case 'exit':
            console.log(chalk.blue('Goodbye! 👋'));
            return;
          default:
            if (cmd !== '') {
              console.log(
                chalk.red(
                  `Unknown command: ${cmd}. Type 'help' for available commands.`
                )
              );
            }
        }
      } catch (error) {
        console.log(chalk.red(`Error: ${(error as Error).message}`));
      }
    }
  }

  /**
   * Load a program from file
   */
  private async loadProgram(filename: string): Promise<void> {
    if (!filename) {
      console.log(chalk.red('Usage: load <filename.ram>'));
      return;
    }

    if (!fs.existsSync(filename)) {
      console.log(chalk.red(`File not found: ${filename}`));
      return;
    }

    const parseResult = this.parser.parseFile(filename);

    if (parseResult.errors.length > 0) {
      console.log(chalk.red('Parse errors:'));
      parseResult.errors.forEach(error =>
        console.log(chalk.red(`  • ${error}`))
      );
      return;
    }

    this.originalRam = [...parseResult.ram];
    this.currentState = this.simulator.createInitialState(parseResult.ram);

    console.log(chalk.green(`✅ Loaded ${filename}`));

    if (parseResult.warnings.length > 0) {
      console.log(chalk.yellow('Warnings:'));
      parseResult.warnings.forEach(warning =>
        console.log(chalk.yellow(`  • ${warning}`))
      );
    }

    this.showState();
  }

  /**
   * Run program to completion
   */
  private async runProgram(): Promise<void> {
    if (!this.currentState) {
      console.log(chalk.red('No program loaded. Use "load <filename>" first.'));
      return;
    }

    if (this.currentState.halted) {
      console.log(
        chalk.yellow('Program is already halted. Use "reset" to restart.')
      );
      return;
    }

    console.log(chalk.blue('🚀 Running program...'));

    try {
      const startSteps = this.currentState.steps;

      while (!this.currentState.halted && this.currentState.steps < 10000) {
        this.simulator.step(this.currentState);
      }

      const executedSteps = this.currentState.steps - startSteps;

      if (this.currentState.halted) {
        console.log(
          chalk.green(`✅ Program completed in ${executedSteps} steps`)
        );
      } else {
        console.log(
          chalk.red(
            `⚠️  Program stopped after 10000 steps (possible infinite loop)`
          )
        );
      }

      this.showState();
    } catch (error) {
      console.log(chalk.red(`Execution error: ${(error as Error).message}`));
    }
  }

  /**
   * Execute single step
   */
  private async stepProgram(): Promise<void> {
    if (!this.currentState) {
      console.log(chalk.red('No program loaded. Use "load <filename>" first.'));
      return;
    }

    if (this.currentState.halted) {
      console.log(chalk.yellow('Program is halted. Use "reset" to restart.'));
      return;
    }

    try {
      const canContinue = this.simulator.step(this.currentState);
      this.showCurrentInstruction();

      if (!canContinue) {
        console.log(chalk.green('Program halted.'));
      }
    } catch (error) {
      console.log(chalk.red(`Step error: ${(error as Error).message}`));
    }
  }

  /**
   * Reset program to initial state
   */
  private async resetProgram(): Promise<void> {
    if (!this.originalRam.length) {
      console.log(chalk.red('No program loaded to reset.'));
      return;
    }

    this.currentState = this.simulator.createInitialState(this.originalRam);
    console.log(chalk.green('✅ Program reset to initial state'));
    this.showState();
  }

  /**
   * Show current execution state
   */
  private showState(): void {
    if (!this.currentState) {
      console.log(chalk.red('No program loaded.'));
      return;
    }

    console.log(chalk.cyan('📊 Current State:'));
    console.log(`   PC: ${this.currentState.pc.toString().padStart(3, '0')}`);
    console.log(`   ACC: ${this.currentState.acc}`);
    console.log(`   Steps: ${this.currentState.steps}`);
    console.log(`   Halted: ${this.currentState.halted ? 'Yes' : 'No'}`);

    if (!this.currentState.halted) {
      this.showCurrentInstruction();
    }
  }

  /**
   * Show current instruction
   */
  private showCurrentInstruction(): void {
    if (!this.currentState || this.currentState.pc >= 1000) return;

    const instruction = this.currentState.ram[this.currentState.pc];
    const opcode = Math.floor(instruction / 1000);
    const operand = instruction % 1000;
    const name = getInstructionName(opcode);

    console.log(
      chalk.blue(
        `   Next: [${this.currentState.pc.toString().padStart(3, '0')}] ${instruction.toString().padStart(5, '0')} (${name} ${operand.toString().padStart(3, '0')})`
      )
    );
  }

  /**
   * Show memory contents
   */
  private showMemory(startStr?: string, endStr?: string): void {
    if (!this.currentState) {
      console.log(chalk.red('No program loaded.'));
      return;
    }

    const start = startStr ? Number.parseInt(startStr) : 0;
    const end = endStr ? Number.parseInt(endStr) : Math.min(start + 20, 999);

    console.log(chalk.cyan(`📋 Memory [${start}-${end}]:`));
    console.log('Addr | Value | Instruction');
    console.log('-----|-------|------------');

    for (let addr = start; addr <= end; addr++) {
      const value = this.currentState.ram[addr];
      if (value !== 0 || addr <= end - start + 10) {
        const opcode = Math.floor(value / 1000);
        const operand = value % 1000;
        const instruction =
          opcode === 0
            ? 'DATA'
            : `${getInstructionName(opcode)} ${operand.toString().padStart(3, '0')}`;

        const marker = addr === this.currentState.pc ? '>' : ' ';
        console.log(
          `${marker}${addr.toString().padStart(3, '0')} | ${value.toString().padStart(5, '0')} | ${instruction}`
        );
      }
    }
  }

  /**
   * Show execution trace
   */
  private showTrace(): void {
    if (!this.currentState || this.currentState.trace.length === 0) {
      console.log(chalk.yellow('No trace available.'));
      return;
    }

    console.log(chalk.cyan('📜 Execution Trace (last 10 steps):'));
    console.log('Step | PC  | Instr | Opcode | ACC');
    console.log('-----|-----|-------|--------|----');

    const trace = this.currentState.trace.slice(-10);
    trace.forEach(entry => {
      const name = getInstructionName(entry.opcode);
      console.log(
        `${entry.step.toString().padStart(4)} | ${entry.pc.toString().padStart(3, '0')} | ${entry.instruction.toString().padStart(5, '0')} | ${name.padEnd(6)} | ${entry.acc}`
      );
    });
  }

  /**
   * Validate current program
   */
  private async validateCurrentProgram(): Promise<void> {
    if (!this.currentState) {
      console.log(chalk.red('No program loaded.'));
      return;
    }

    const result = this.validator.validateProgram(this.currentState.ram);

    if (result.errors.length > 0) {
      console.log(chalk.red(`❌ ${result.errors.length} error(s):`));
      result.errors.forEach(error =>
        console.log(chalk.red(`  • ${error.message}`))
      );
    }

    if (result.warnings.length > 0) {
      console.log(chalk.yellow(`⚠️  ${result.warnings.length} warning(s):`));
      result.warnings.forEach(warning =>
        console.log(chalk.yellow(`  • ${warning.message}`))
      );
    }

    if (result.isValid && result.warnings.length === 0) {
      console.log(chalk.green('✅ Program is valid!'));
    }
  }

  /**
   * Set memory value
   */
  private setMemory(addrStr?: string, valueStr?: string): void {
    if (!this.currentState) {
      console.log(chalk.red('No program loaded.'));
      return;
    }

    if (!addrStr || !valueStr) {
      console.log(chalk.red('Usage: set <address> <value>'));
      return;
    }

    const addr = Number.parseInt(addrStr);
    const value = Number.parseInt(valueStr);

    if (isNaN(addr) || addr < 0 || addr >= 1000) {
      console.log(chalk.red('Invalid address. Must be 0-999.'));
      return;
    }

    if (isNaN(value) || value < 0 || value > 19999) {
      console.log(chalk.red('Invalid value. Must be 0-19999.'));
      return;
    }

    this.currentState.ram[addr] = value;
    console.log(chalk.green(`✅ Set memory[${addr}] = ${value}`));
  }

  /**
   * Show help
   */
  private async showHelp(): Promise<void> {
    console.log(chalk.cyan('📖 Available Commands:'));
    console.log('  load <file>     - Load a .ram program');
    console.log('  run             - Run program to completion');
    console.log('  step            - Execute single instruction');
    console.log('  reset           - Reset program to initial state');
    console.log('  state           - Show current execution state');
    console.log('  memory [s] [e]  - Show memory contents (start, end)');
    console.log('  trace           - Show execution trace');
    console.log('  validate        - Validate current program');
    console.log('  set <addr> <val>- Set memory value');
    console.log('  help            - Show this help');
    console.log('  quit/exit       - Exit simulator');
  }

  /**
   * Prompt helper
   */
  private prompt(question: string): Promise<string> {
    return new Promise(resolve => {
      this.rl.question(question, answer => resolve(answer));
    });
  }
}

// Main execution
if (require.main === module) {
  const simulator = new InteractiveSimulator();
  simulator.start().catch(error => {
    console.error(chalk.red(`Simulator failed: ${error.message}`));
    process.exit(1);
  });
}
