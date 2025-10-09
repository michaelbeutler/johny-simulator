#!/usr/bin/env bun
// Johnny C Compiler CLI - Entry point
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname, basename, extname } from 'path';
import { Parser, ParseError } from './parser';
import { IRGenerator } from './ir';
import { MemoryMapper, DEFAULT_LAYOUT } from './memmap';
import { CodeGenerator } from './codegen';
import { Emitter } from './emitter';
import { LexerError } from './lexer';

export interface CompilerOptions {
  outputFile?: string;
  memoryMapFile?: string;
  includeComments: boolean;
  memoryMapJson?: string;
  memoryMapMarkdown?: string;
}

export class JohnnyCompiler {
  private memoryMapper: MemoryMapper;

  constructor() {
    this.memoryMapper = new MemoryMapper(DEFAULT_LAYOUT);
  }

  /**
   * Compile Johnny C source to JOHNNY RAM
   */
  compile(sourceFile: string, options: CompilerOptions): void {
    try {
      console.log(`Compiling ${sourceFile}...`);

      // Read source file
      const source = readFileSync(sourceFile, 'utf-8');

      // Parse
      console.log('Parsing...');
      const parser = new Parser(source);
      const ast = parser.parse();
      console.log(`Parsed ${ast.statements.length} statements`);

      // Generate IR
      console.log('Generating IR...');
      const irGenerator = new IRGenerator();
      const { blocks, symbols } = irGenerator.generate(ast);

      // Create memory map
      console.log('Creating memory map...');
      const memoryMap = this.memoryMapper.createMemoryMap(symbols);

      // Generate code
      console.log('Generating code...');
      const codeGenerator = new CodeGenerator(this.memoryMapper);
      const instructions = codeGenerator.generate(blocks, memoryMap);

      // Emit final program
      console.log('Emitting program...');
      const emitter = new Emitter(this.memoryMapper);
      const emitted = emitter.emit(
        instructions,
        memoryMap,
        options.includeComments
      );

      // Validate
      const errors = emitter.validate(emitted);
      if (errors.length > 0) {
        console.error('Validation errors:');
        for (const error of errors) {
          console.error(`  - ${error}`);
        }
        process.exit(1);
      }

      // Write output file
      const outputFile =
        options.outputFile || this.getDefaultOutputFile(sourceFile);
      const ramLines = emitter.formatAsRamFile(
        emitted,
        options.includeComments
      );
      writeFileSync(outputFile, ramLines.join('\n') + '\n');
      console.log(`Generated ${outputFile}`);

      // Write memory map files if requested
      if (options.memoryMapJson) {
        const memMapJson = this.memoryMapper.generateMemoryMapJson(
          memoryMap,
          symbols
        );
        writeFileSync(options.memoryMapJson, memMapJson);
        console.log(`Generated memory map: ${options.memoryMapJson}`);
      }

      if (options.memoryMapMarkdown) {
        const memMapMd = this.memoryMapper.generateMemoryMapMarkdown(
          memoryMap,
          symbols
        );
        writeFileSync(options.memoryMapMarkdown, memMapMd);
        console.log(`Generated memory map: ${options.memoryMapMarkdown}`);
      }

      console.log('Compilation successful!');
    } catch (error) {
      if (error instanceof LexerError || error instanceof ParseError) {
        console.error(`Compilation failed: ${error.message}`);
        process.exit(1);
      } else if (error instanceof Error) {
        console.error(`Compilation failed: ${error.message}`);
        process.exit(1);
      } else {
        console.error('Compilation failed with unknown error');
        process.exit(1);
      }
    }
  }

  private getDefaultOutputFile(sourceFile: string): string {
    const dir = dirname(sourceFile);
    const name = basename(sourceFile, extname(sourceFile));
    return resolve(dir, `${name}.ram`);
  }
}

// CLI implementation
export function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printUsage();
    process.exit(1);
  }

  const sourceFile = args[0];
  const options: CompilerOptions = {
    includeComments: false,
  };

  // Parse command line arguments
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '-o':
        if (i + 1 >= args.length) {
          console.error('Error: -o flag requires an output file');
          process.exit(1);
        }
        options.outputFile = args[++i];
        break;

      case '--comments':
        options.includeComments = true;
        break;

      case '--memmap': {
        if (i + 1 >= args.length) {
          console.error('Error: --memmap flag requires a filename');
          process.exit(1);
        }
        const memmapFile = args[++i];
        options.memoryMapJson = memmapFile;
        options.memoryMapMarkdown = memmapFile.replace(/\.json$/, '.md');
        break;
      }

      case '--help':
      case '-h':
        printUsage();
        process.exit(0);
        break;

      default:
        console.error(`Error: Unknown flag ${arg}`);
        printUsage();
        process.exit(1);
    }
  }

  // Compile
  const compiler = new JohnnyCompiler();
  compiler.compile(sourceFile, options);
}

function printUsage(): void {
  console.log('Johnny C Compiler');
  console.log('');
  console.log('Usage: bun run compile <input.jcc> [options]');
  console.log('');
  console.log('Options:');
  console.log(
    '  -o <file>       Output file (default: input name with .ram extension)'
  );
  console.log('  --comments      Include comments in output');
  console.log('  --memmap <file> Generate memory map files (.json and .md)');
  console.log('  -h, --help      Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  bun run compile program.jcc');
  console.log('  bun run compile program.jcc -o scripts/program.ram');
  console.log('  bun run compile program.jcc --comments --memmap memmap.json');
}

// Run CLI if this file is executed directly
main();
