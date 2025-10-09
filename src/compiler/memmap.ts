// Memory mapping - Assigns RAM addresses to variables, temps, flags, and constants
import { Symbol } from './ir';

export interface MemoryMap {
  variables: Map<string, number>;
  temps: Map<string, number>;
  flags: Map<string, number>;
  constants: Map<number, number>;
  codeStart: number;
  nextFreeAddress: number;
}

export interface MemoryLayout {
  CODE_START: number;
  VARIABLES_START: number;
  VARIABLES_END: number;
  TEMPS_START: number;
  TEMPS_END: number;
  FLAGS_START: number;
  FLAGS_END: number;
  CONST_0: number;
  CONST_1: number;
}

export const DEFAULT_LAYOUT: MemoryLayout = {
  CODE_START: 0,
  VARIABLES_START: 900,
  VARIABLES_END: 949,
  TEMPS_START: 960,
  TEMPS_END: 989,
  FLAGS_START: 990,
  FLAGS_END: 995,
  CONST_0: 150,
  CONST_1: 151,
};

export class MemoryMapper {
  private layout: MemoryLayout;
  private variableCounter = 0;
  private tempCounter = 0;
  private flagCounter = 0;

  constructor(layout: MemoryLayout = DEFAULT_LAYOUT) {
    this.layout = layout;
  }

  /**
   * Create memory map from symbols
   */
  createMemoryMap(symbols: Map<string, Symbol>): MemoryMap {
    const memoryMap: MemoryMap = {
      variables: new Map(),
      temps: new Map(),
      flags: new Map(),
      constants: new Map(),
      codeStart: this.layout.CODE_START,
      nextFreeAddress: this.layout.CODE_START,
    };

    // Map constants
    memoryMap.constants.set(0, this.layout.CONST_0);
    memoryMap.constants.set(1, this.layout.CONST_1);

    // Reset counters
    this.variableCounter = 0;
    this.tempCounter = 0;
    this.flagCounter = 0;

    // Sort symbols to ensure consistent mapping
    const sortedSymbols = Array.from(symbols.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    );

    for (const [name, symbol] of sortedSymbols) {
      if (symbol.isTemp) {
        this.mapTemp(memoryMap, name);
      } else if (symbol.type === 'bool') {
        this.mapFlag(memoryMap, name);
      } else {
        this.mapVariable(memoryMap, name);
      }
    }

    return memoryMap;
  }

  /**
   * Generate memory map JSON for debugging
   */
  generateMemoryMapJson(
    memoryMap: MemoryMap,
    symbols: Map<string, Symbol>
  ): string {
    const mapData = {
      layout: this.layout,
      memory: {
        code: {
          start: memoryMap.codeStart,
          description: 'Program instructions',
        },
        constants: {
          CONST_0: {
            address: this.layout.CONST_0,
            value: 0,
            description: 'Constant 0',
          },
          CONST_1: {
            address: this.layout.CONST_1,
            value: 1,
            description: 'Constant 1',
          },
        },
        variables: {} as Record<string, Record<string, unknown>>,
        temps: {} as Record<string, Record<string, unknown>>,
        flags: {} as Record<string, Record<string, unknown>>,
      },
      statistics: {
        totalVariables: memoryMap.variables.size,
        totalTemps: memoryMap.temps.size,
        totalFlags: memoryMap.flags.size,
        memoryUsage: {
          variables: `${memoryMap.variables.size}/${this.layout.VARIABLES_END - this.layout.VARIABLES_START + 1}`,
          temps: `${memoryMap.temps.size}/${this.layout.TEMPS_END - this.layout.TEMPS_START + 1}`,
          flags: `${memoryMap.flags.size}/${this.layout.FLAGS_END - this.layout.FLAGS_START + 1}`,
        },
      },
    };

    // Add variable details
    for (const [name, address] of memoryMap.variables) {
      const symbol = symbols.get(name);
      mapData.memory.variables[name] = {
        address,
        type: symbol?.type || 'unknown',
        description: `Variable '${name}' of type ${symbol?.type || 'unknown'}`,
      };
    }

    // Add temp details
    for (const [name, address] of memoryMap.temps) {
      mapData.memory.temps[name] = {
        address,
        type: 'int',
        description: `Temporary variable '${name}'`,
      };
    }

    // Add flag details
    for (const [name, address] of memoryMap.flags) {
      const symbol = symbols.get(name);
      mapData.memory.flags[name] = {
        address,
        type: symbol?.type || 'bool',
        description: `Flag variable '${name}' of type ${symbol?.type || 'bool'}`,
      };
    }

    return JSON.stringify(mapData, null, 2);
  }

  /**
   * Generate MEMMAP.md documentation
   */
  generateMemoryMapMarkdown(
    memoryMap: MemoryMap,
    symbols: Map<string, Symbol>
  ): string {
    let md = '# Memory Map\n\n';
    md +=
      'This document describes the memory layout of the compiled Johnny C program.\n\n';

    // Layout overview
    md += '## Memory Layout\n\n';
    md += '| Region | Start | End | Description |\n';
    md += '|--------|-------|-----|-------------|\n';
    md += `| Code | ${this.layout.CODE_START} | Variable | Program instructions |\n`;
    md += `| Variables | ${this.layout.VARIABLES_START} | ${this.layout.VARIABLES_END} | User-defined variables |\n`;
    md += `| Temps | ${this.layout.TEMPS_START} | ${this.layout.TEMPS_END} | Temporary variables |\n`;
    md += `| Flags | ${this.layout.FLAGS_START} | ${this.layout.FLAGS_END} | Boolean flags |\n`;
    md += `| Constants | ${this.layout.CONST_0}, ${this.layout.CONST_1} | - | Predefined constants |\n\n`;

    // Constants
    md += '## Constants\n\n';
    md += '| Name | Address | Value | Description |\n';
    md += '|------|---------|-------|-------------|\n';
    md += `| CONST_0 | ${this.layout.CONST_0} | 0 | Constant zero |\n`;
    md += `| CONST_1 | ${this.layout.CONST_1} | 1 | Constant one |\n\n`;

    // Variables
    if (memoryMap.variables.size > 0) {
      md += '## Variables\n\n';
      md += '| Name | Address | Type | Description |\n';
      md += '|------|---------|------|-------------|\n';

      const sortedVars = Array.from(memoryMap.variables.entries()).sort(
        ([, a], [, b]) => a - b
      );
      for (const [name, address] of sortedVars) {
        const symbol = symbols.get(name);
        md += `| ${name} | ${address} | ${symbol?.type || 'unknown'} | User variable |\n`;
      }
      md += '\n';
    }

    // Temporaries
    if (memoryMap.temps.size > 0) {
      md += '## Temporary Variables\n\n';
      md += '| Name | Address | Type | Description |\n';
      md += '|------|---------|------|-------------|\n';

      const sortedTemps = Array.from(memoryMap.temps.entries()).sort(
        ([, a], [, b]) => a - b
      );
      for (const [name, address] of sortedTemps) {
        md += `| ${name} | ${address} | int | Temporary for expression evaluation |\n`;
      }
      md += '\n';
    }

    // Flags
    if (memoryMap.flags.size > 0) {
      md += '## Boolean Flags\n\n';
      md += '| Name | Address | Type | Description |\n';
      md += '|------|---------|------|-------------|\n';

      const sortedFlags = Array.from(memoryMap.flags.entries()).sort(
        ([, a], [, b]) => a - b
      );
      for (const [name, address] of sortedFlags) {
        const symbol = symbols.get(name);
        md += `| ${name} | ${address} | ${symbol?.type || 'bool'} | Boolean flag |\n`;
      }
      md += '\n';
    }

    // Statistics
    md += '## Memory Statistics\n\n';
    md += `- **Variables**: ${memoryMap.variables.size}/${this.layout.VARIABLES_END - this.layout.VARIABLES_START + 1} used\n`;
    md += `- **Temporaries**: ${memoryMap.temps.size}/${this.layout.TEMPS_END - this.layout.TEMPS_START + 1} used\n`;
    md += `- **Flags**: ${memoryMap.flags.size}/${this.layout.FLAGS_END - this.layout.FLAGS_START + 1} used\n`;

    return md;
  }

  private mapVariable(memoryMap: MemoryMap, name: string): void {
    const address = this.layout.VARIABLES_START + this.variableCounter;
    if (address > this.layout.VARIABLES_END) {
      throw new Error(
        `Too many variables. Maximum ${this.layout.VARIABLES_END - this.layout.VARIABLES_START + 1} allowed.`
      );
    }
    memoryMap.variables.set(name, address);
    this.variableCounter++;
  }

  private mapTemp(memoryMap: MemoryMap, name: string): void {
    const address = this.layout.TEMPS_START + this.tempCounter;
    if (address > this.layout.TEMPS_END) {
      throw new Error(
        `Too many temporary variables. Maximum ${this.layout.TEMPS_END - this.layout.TEMPS_START + 1} allowed.`
      );
    }
    memoryMap.temps.set(name, address);
    this.tempCounter++;
  }

  private mapFlag(memoryMap: MemoryMap, name: string): void {
    const address = this.layout.FLAGS_START + this.flagCounter;
    if (address > this.layout.FLAGS_END) {
      throw new Error(
        `Too many flag variables. Maximum ${this.layout.FLAGS_END - this.layout.FLAGS_START + 1} allowed.`
      );
    }
    memoryMap.flags.set(name, address);
    this.flagCounter++;
  }

  /**
   * Get address for a symbol
   */
  getAddress(memoryMap: MemoryMap, name: string): number {
    // Check variables first
    const varAddr = memoryMap.variables.get(name);
    if (varAddr !== undefined) return varAddr;

    // Check temps
    const tempAddr = memoryMap.temps.get(name);
    if (tempAddr !== undefined) return tempAddr;

    // Check flags
    const flagAddr = memoryMap.flags.get(name);
    if (flagAddr !== undefined) return flagAddr;

    // Check if it's a constant
    if (name === 'CONST_0') return this.layout.CONST_0;
    if (name === 'CONST_1') return this.layout.CONST_1;

    throw new Error(`Symbol '${name}' not found in memory map`);
  }
}
