// Mermaid Flowchart Generator for JOHNNY RAM programs
import { getInstructionName } from './opcodes';

export interface FlowNode {
  address: number;
  instruction: number;
  opcode: number;
  operand: number;
  type: 'sequential' | 'conditional' | 'jump' | 'terminal' | 'data';
  instructionName: string;
}

export interface FlowEdge {
  from: number;
  to: number;
  type: 'sequential' | 'jump' | 'conditional' | 'skip';
  label?: string;
}

export interface FlowGraph {
  nodes: FlowNode[];
  edges: FlowEdge[];
  entryPoint: number;
  exitPoints: number[];
  unreachableNodes: number[];
}

export interface AlgorithmicBlock {
  id: number;
  type: 'start' | 'end' | 'process' | 'decision' | 'loop';
  description: string;
  addresses: number[];
  edges: Array<{
    from: number;
    to: number;
    condition?: string;
  }>;
}

export class ControlFlowAnalyzer {
  /**
   * Analyze control flow of a RAM program
   */
  analyzeFlow(ram: number[]): FlowGraph {
    const nodes: FlowNode[] = [];
    const edges: FlowEdge[] = [];
    const reachableAddresses = new Set<number>();

    // First pass: create nodes
    for (let addr = 0; addr < ram.length; addr++) {
      const instruction = ram[addr];
      if (instruction === 0) continue; // Skip empty memory

      // Handle JOHNNY's compressed opcode format (01xxx -> 10, 02xxx -> 20, etc.)
      const valueStr = instruction.toString().padStart(5, '0');
      const opcodeDigits = Number.parseInt(valueStr.slice(0, 2), 10);
      const opcode = opcodeDigits * 10; // Convert to actual opcode (01 -> 10, 02 -> 20, etc.)
      const operand = Number.parseInt(valueStr.slice(2), 10);
      const instructionName = getInstructionName(opcode);

      let nodeType: FlowNode['type'] = 'sequential';

      switch (opcode) {
        case 50: // JMP
          nodeType = 'jump';
          break;
        case 60: // TST
          nodeType = 'conditional';
          break;
        case 100: // HLT
          nodeType = 'terminal';
          break;
        case 0: // DATA
          nodeType = 'data';
          break;
        default:
          nodeType = 'sequential';
      }

      nodes.push({
        address: addr,
        instruction,
        opcode,
        operand,
        type: nodeType,
        instructionName,
      });
    }

    // Second pass: create edges and track reachability
    const entryPoint = 0;
    const exitPoints: number[] = [];
    this.traceReachability(
      nodes,
      edges,
      entryPoint,
      reachableAddresses,
      exitPoints
    );

    // Find unreachable nodes
    const unreachableNodes = nodes
      .map(node => node.address)
      .filter(addr => !reachableAddresses.has(addr));

    return {
      nodes,
      edges,
      entryPoint,
      exitPoints,
      unreachableNodes,
    };
  }

  private traceReachability(
    nodes: FlowNode[],
    edges: FlowEdge[],
    startAddr: number,
    reachable: Set<number>,
    exitPoints: number[]
  ): void {
    const visited = new Set<number>();
    const queue = [startAddr];

    while (queue.length > 0) {
      const addr = queue.shift();
      if (addr === undefined) continue;

      if (visited.has(addr)) continue;
      visited.add(addr);
      reachable.add(addr);

      const node = nodes.find(n => n.address === addr);
      if (!node) continue;

      switch (node.opcode) {
        case 50: {
          // JMP
          const jumpTarget = node.operand;
          edges.push({ from: addr, to: jumpTarget, type: 'jump' });
          queue.push(jumpTarget);
          break;
        }
        case 60: {
          // TST skips next instruction if memory[operand] == 0
          const nextAddr = addr + 1;
          const skipAddr = addr + 2;

          edges.push({
            from: addr,
            to: nextAddr,
            type: 'sequential',
            label: 'not zero',
          });
          edges.push({
            from: addr,
            to: skipAddr,
            type: 'conditional',
            label: 'zero (skip)',
          });

          queue.push(nextAddr);
          queue.push(skipAddr);
          break;
        }
        case 100: {
          // HLT
          exitPoints.push(addr);
          break;
        }
        default: {
          // Sequential instructions
          const sequential = addr + 1;
          if (
            sequential < nodes.length &&
            nodes.some(n => n.address === sequential)
          ) {
            edges.push({ from: addr, to: sequential, type: 'sequential' });
            queue.push(sequential);
          }
          break;
        }
      }
    }
  }
}

export class MermaidFlowchartGenerator {
  /**
   * Generate Mermaid flowchart from flow graph
   */
  generateFlowchart(
    flowGraph: FlowGraph,
    options?: {
      includeAddresses?: boolean;
      includeOperands?: boolean;
      useColors?: boolean;
      compactMode?: boolean;
    }
  ): string {
    const opts = {
      includeAddresses: true,
      includeOperands: true,
      useColors: true,
      compactMode: false,
      ...options,
    };

    let mermaid = 'flowchart TD\n';

    // Generate nodes
    for (const node of flowGraph.nodes) {
      const nodeId = `n${node.address}`;
      const label = this.generateNodeLabel(node, opts);
      const shape = this.getNodeShape(node);

      mermaid += `    ${nodeId}${shape.open}"${label}"${shape.close}\n`;
    }

    // Generate edges
    for (const edge of flowGraph.edges) {
      const fromId = `n${edge.from}`;
      const toId = `n${edge.to}`;
      const edgeStyle = this.getEdgeStyle(edge);

      mermaid += `    ${fromId} ${edgeStyle} ${toId}\n`;
    }

    // Add styling if enabled
    if (opts.useColors) {
      mermaid += this.generateStyling(flowGraph);
    }

    // Add unreachable nodes warning
    if (flowGraph.unreachableNodes.length > 0) {
      mermaid += '\n    %% Unreachable code detected:\n';
      for (const addr of flowGraph.unreachableNodes) {
        mermaid += `    %% Address ${addr}\n`;
      }
    }

    return mermaid;
  }

  private generateNodeLabel(
    node: FlowNode,
    options: {
      includeAddresses: boolean;
      includeOperands: boolean;
      useColors: boolean;
      compactMode: boolean;
    }
  ): string {
    let label = '';

    if (options.includeAddresses) {
      label += `${node.address}: `;
    }

    label += node.instructionName;

    if (options.includeOperands && node.opcode !== 100 && node.opcode !== 0) {
      label += ` ${node.operand}`;
    }

    return label;
  }

  private getNodeShape(node: FlowNode): { open: string; close: string } {
    switch (node.type) {
      case 'conditional':
        return { open: '{', close: '}' };
      case 'terminal':
        return { open: '[[', close: ']]' };
      case 'jump':
        return { open: '(', close: ')' };
      default:
        return { open: '[', close: ']' };
    }
  }

  private getEdgeStyle(edge: FlowEdge): string {
    switch (edge.type) {
      case 'conditional':
        return `-.->|"${edge.label || 'zero'}"|`;
      case 'jump':
        return `==>`;
      case 'skip':
        return `-.->|"${edge.label || 'skip'}"|`;
      default:
        return `-->`;
    }
  }

  private generateStyling(flowGraph: FlowGraph): string {
    let styling = '\n    %% Styling\n';

    // Define CSS classes
    styling += `    classDef arithmetic fill:#e1f5fe,stroke:#01579b,stroke-width:2px\n`;
    styling += `    classDef memory fill:#f3e5f5,stroke:#4a148c,stroke-width:2px\n`;
    styling += `    classDef control fill:#fff3e0,stroke:#e65100,stroke-width:2px\n`;
    styling += `    classDef terminal fill:#ffebee,stroke:#b71c1c,stroke-width:3px\n`;
    styling += `    classDef unreachable fill:#f5f5f5,stroke:#9e9e9e,stroke-width:1px,stroke-dasharray: 5 5\n`;

    // Categorize nodes
    const categories = {
      arithmetic: [] as number[],
      memory: [] as number[],
      control: [] as number[],
      terminal: [] as number[],
      unreachable: flowGraph.unreachableNodes,
    };

    for (const node of flowGraph.nodes) {
      switch (node.opcode) {
        case 20: // ADD
        case 30: // SUB
        case 7: // INC
        case 80: // DEC
          categories.arithmetic.push(node.address);
          break;
        case 10: // TAKE
        case 4: // SAVE
        case 9: // NULL
          categories.memory.push(node.address);
          break;
        case 50: // JMP
        case 60: // TST
          categories.control.push(node.address);
          break;
        case 100: // HLT
          categories.terminal.push(node.address);
          break;
      }
    }

    // Apply classes
    for (const [className, addresses] of Object.entries(categories)) {
      if (addresses.length > 0) {
        const nodeIds = addresses.map(addr => `n${addr}`).join(',');
        styling += `    class ${nodeIds} ${className}\n`;
      }
    }

    return styling;
  }

  /**
   * Generate a compact flowchart suitable for inline documentation
   */
  generateCompactFlowchart(flowGraph: FlowGraph): string {
    return this.generateFlowchart(flowGraph, {
      includeAddresses: false,
      includeOperands: false,
      useColors: false,
      compactMode: true,
    });
  }

  /**
   * Generate algorithmic flowchart showing high-level program logic
   */
  generateAlgorithmicFlowchart(flowGraph: FlowGraph): string {
    const algorithmicBlocks = this.identifyAlgorithmicBlocks(flowGraph);

    let mermaid = 'flowchart TD\n';

    // Generate nodes with meaningful descriptions
    for (const block of algorithmicBlocks) {
      const nodeId = `block${block.id}`;
      const shape = this.getAlgorithmicNodeShape(block);
      const label = block.description.replace(/\n/g, '<br/>');

      mermaid += `    ${nodeId}${shape.open}"${label}"${shape.close}\n`;
    }

    // Generate edges with labels
    for (const edge of algorithmicBlocks.flatMap(b => b.edges)) {
      const fromId = `block${edge.from}`;
      const toId = `block${edge.to}`;
      const edgeStyle = edge.condition ? `-->|"${edge.condition}"|` : '-->';

      mermaid += `    ${fromId} ${edgeStyle} ${toId}\n`;
    }

    // Add styling
    mermaid += `\n    %% Styling\n`;
    mermaid += `    classDef startEnd fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000\n`;
    mermaid += `    classDef process fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#000\n`;
    mermaid += `    classDef decision fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000\n`;
    mermaid += `    classDef loop fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px,color:#000\n`;

    // Apply classes
    const startEndBlocks = algorithmicBlocks.filter(
      b => b.type === 'start' || b.type === 'end'
    );
    const processBlocks = algorithmicBlocks.filter(b => b.type === 'process');
    const decisionBlocks = algorithmicBlocks.filter(b => b.type === 'decision');
    const loopBlocks = algorithmicBlocks.filter(b => b.type === 'loop');

    if (startEndBlocks.length > 0) {
      const ids = startEndBlocks.map(b => `block${b.id}`).join(',');
      mermaid += `    class ${ids} startEnd\n`;
    }
    if (processBlocks.length > 0) {
      const ids = processBlocks.map(b => `block${b.id}`).join(',');
      mermaid += `    class ${ids} process\n`;
    }
    if (decisionBlocks.length > 0) {
      const ids = decisionBlocks.map(b => `block${b.id}`).join(',');
      mermaid += `    class ${ids} decision\n`;
    }
    if (loopBlocks.length > 0) {
      const ids = loopBlocks.map(b => `block${b.id}`).join(',');
      mermaid += `    class ${ids} loop\n`;
    }

    return mermaid;
  }

  /**
   * Generate basic block diagram showing program structure
   */
  generateBasicBlockDiagram(flowGraph: FlowGraph): string {
    // Group sequential instructions into basic blocks
    const basicBlocks = this.identifyBasicBlocks(flowGraph);

    let mermaid = 'flowchart TD\n';

    for (const block of basicBlocks) {
      const blockId = `bb${block.id}`;
      const startAddr = block.instructions[0].address;
      const endAddr = block.instructions[block.instructions.length - 1].address;
      const label = `Block ${block.id}\\n(${startAddr}-${endAddr})`;

      mermaid += `    ${blockId}["${label}"]\n`;
    }

    // Add edges between basic blocks
    for (const edge of flowGraph.edges) {
      const fromBlock = basicBlocks.find(bb =>
        bb.instructions.some(instr => instr.address === edge.from)
      );
      const toBlock = basicBlocks.find(bb =>
        bb.instructions.some(instr => instr.address === edge.to)
      );

      if (fromBlock && toBlock && fromBlock.id !== toBlock.id) {
        const edgeStyle =
          edge.type === 'conditional' ? '-.->|conditional|' : '-->';
        mermaid += `    bb${fromBlock.id} ${edgeStyle} bb${toBlock.id}\n`;
      }
    }

    return mermaid;
  }

  private identifyBasicBlocks(flowGraph: FlowGraph): Array<{
    id: number;
    instructions: FlowNode[];
  }> {
    // Simplified basic block identification
    const blocks: Array<{ id: number; instructions: FlowNode[] }> = [];
    let blockId = 0;
    let currentBlock: FlowNode[] = [];

    const sortedNodes = flowGraph.nodes.sort((a, b) => a.address - b.address);

    for (const node of sortedNodes) {
      currentBlock.push(node);

      // End block on control flow instruction or if next instruction is a jump target
      if (
        node.type === 'jump' ||
        node.type === 'conditional' ||
        node.type === 'terminal'
      ) {
        blocks.push({ id: blockId++, instructions: [...currentBlock] });
        currentBlock = [];
      }
    }

    // Add remaining instructions as final block
    if (currentBlock.length > 0) {
      blocks.push({ id: blockId, instructions: currentBlock });
    }

    return blocks;
  }

  private identifyAlgorithmicBlocks(flowGraph: FlowGraph): AlgorithmicBlock[] {
    const blocks: AlgorithmicBlock[] = [];
    let blockId = 0;

    // Analyze the flow graph to identify meaningful algorithmic patterns
    const sortedNodes = flowGraph.nodes
      .filter(n => flowGraph.nodes.some(node => node.address === n.address))
      .sort((a, b) => a.address - b.address);

    // Start block
    blocks.push({
      id: blockId++,
      type: 'start',
      description: 'Start Program',
      addresses: [0],
      edges: [{ from: 0, to: 1 }],
    });

    // Analyze instruction patterns to create meaningful blocks
    let currentAddr = 0;
    while (currentAddr < sortedNodes.length) {
      const node = sortedNodes.find(n => n.address === currentAddr);
      if (!node) {
        currentAddr++;
        continue;
      }

      // Pattern: Variable initialization (TAKE + SAVE sequences)
      if (this.isInitializationPattern(sortedNodes, currentAddr)) {
        const initBlock = this.createInitializationBlock(
          sortedNodes,
          currentAddr,
          blockId++
        );
        blocks.push(initBlock);
        currentAddr = initBlock.addresses[initBlock.addresses.length - 1] + 1;
        continue;
      }

      // Pattern: Array clearing (sequence of NULL instructions)
      if (this.isArrayClearingPattern(sortedNodes, currentAddr)) {
        const clearBlock = this.createArrayClearingBlock(
          sortedNodes,
          currentAddr,
          blockId++
        );
        blocks.push(clearBlock);
        currentAddr = clearBlock.addresses[clearBlock.addresses.length - 1] + 1;
        continue;
      }

      // Pattern: Loop (TST + JMP back)
      if (this.isLoopPattern(flowGraph, currentAddr)) {
        const loopBlock = this.createLoopBlock(
          flowGraph,
          sortedNodes,
          currentAddr,
          blockId++
        );
        blocks.push(loopBlock);
        currentAddr = loopBlock.addresses[loopBlock.addresses.length - 1] + 1;
        continue;
      }

      // Pattern: Conditional (TST + JMP forward)
      if (node.opcode === 60) {
        // TST
        const condBlock = this.createConditionalBlock(
          flowGraph,
          sortedNodes,
          currentAddr,
          blockId++
        );
        blocks.push(condBlock);
        currentAddr = condBlock.addresses[condBlock.addresses.length - 1] + 1;
        continue;
      }

      // Pattern: Termination (HLT)
      if (node.opcode === 100) {
        // HLT
        blocks.push({
          id: blockId++,
          type: 'end',
          description: 'End Program',
          addresses: [currentAddr],
          edges: [],
        });
        break;
      }

      // Default: single instruction block
      blocks.push({
        id: blockId++,
        type: 'process',
        description: `${node.instructionName} ${node.operand}`,
        addresses: [currentAddr],
        edges: [{ from: blockId - 1, to: blockId }],
      });

      currentAddr++;
    }

    // Connect blocks based on control flow
    this.connectAlgorithmicBlocks(blocks);

    return blocks;
  }

  private isInitializationPattern(
    nodes: FlowNode[],
    startAddr: number
  ): boolean {
    const node = nodes.find(n => n.address === startAddr);
    const nextNode = nodes.find(n => n.address === startAddr + 1);

    return node?.opcode === 1 && nextNode?.opcode === 4; // TAKE + SAVE
  }

  private createInitializationBlock(
    nodes: FlowNode[],
    startAddr: number,
    id: number
  ): AlgorithmicBlock {
    const addresses = [];
    let addr = startAddr;

    // Collect TAKE + SAVE pairs
    while (addr < nodes.length) {
      const takeNode = nodes.find(n => n.address === addr);
      const saveNode = nodes.find(n => n.address === addr + 1);

      if (takeNode?.opcode === 1 && saveNode?.opcode === 4) {
        addresses.push(addr, addr + 1);
        addr += 2;
      } else {
        break;
      }
    }

    return {
      id,
      type: 'process',
      description: `Initialize Variables\nLoad constants and setup memory`,
      addresses,
      edges: [{ from: id, to: id + 1 }],
    };
  }

  private isArrayClearingPattern(
    nodes: FlowNode[],
    startAddr: number
  ): boolean {
    const node = nodes.find(n => n.address === startAddr);
    const nextNode = nodes.find(n => n.address === startAddr + 1);

    return node?.opcode === 9 && nextNode?.opcode === 9; // NULL + NULL
  }

  private createArrayClearingBlock(
    nodes: FlowNode[],
    startAddr: number,
    id: number
  ): AlgorithmicBlock {
    const addresses = [];
    let addr = startAddr;

    // Collect consecutive NULL instructions
    while (addr < nodes.length) {
      const node = nodes.find(n => n.address === addr);
      if (node?.opcode === 9) {
        // NULL
        addresses.push(addr);
        addr++;
      } else {
        break;
      }
    }

    const firstAddr = addresses[0];
    const lastAddr = addresses[addresses.length - 1];
    const firstNode = nodes.find(n => n.address === firstAddr);
    const lastNode = nodes.find(n => n.address === lastAddr);

    return {
      id,
      type: 'process',
      description: `Clear Array\nNULL ${firstNode?.operand}-${lastNode?.operand}`,
      addresses,
      edges: [{ from: id, to: id + 1 }],
    };
  }

  private isLoopPattern(flowGraph: FlowGraph, addr: number): boolean {
    // Check if there's a TST instruction that eventually leads to a JMP back
    const edges = flowGraph.edges.filter(e => e.from >= addr);
    return edges.some(e => e.type === 'jump' && e.to < e.from);
  }

  private createLoopBlock(
    flowGraph: FlowGraph,
    nodes: FlowNode[],
    startAddr: number,
    id: number
  ): AlgorithmicBlock {
    // Find the loop body by following edges until we find the back-jump
    const addresses = [];
    let addr = startAddr;

    // Simple heuristic: collect instructions until we find a jump back
    while (addr < nodes.length) {
      addresses.push(addr);
      const node = nodes.find(n => n.address === addr);

      if (node?.opcode === 50) {
        // JMP
        const jumpTarget = node.operand;
        if (jumpTarget <= startAddr) {
          // Jump back - end of loop
          break;
        }
      }

      addr++;
      if (addr - startAddr > 20) break; // Safety limit
    }

    // Analyze loop body to create description
    const hasIncrement = addresses.some(a => {
      const node = nodes.find(n => n.address === a);
      return node?.opcode === 7; // INC
    });

    const hasTest = addresses.some(a => {
      const node = nodes.find(n => n.address === a);
      return node?.opcode === 60; // TST
    });

    let description = 'Loop';
    if (hasIncrement && hasTest) {
      description = 'Main Loop\nIncrement counters and test conditions';
    } else if (hasIncrement) {
      description = 'Counter Loop\nIncrement memory locations';
    }

    return {
      id,
      type: 'loop',
      description,
      addresses,
      edges: [
        { from: id, to: id + 1, condition: 'continue' },
        { from: id, to: id + 2, condition: 'exit' },
      ],
    };
  }

  private createConditionalBlock(
    flowGraph: FlowGraph,
    nodes: FlowNode[],
    startAddr: number,
    id: number
  ): AlgorithmicBlock {
    const node = nodes.find(n => n.address === startAddr);
    const jumpEdge = flowGraph.edges.find(
      e => e.from === startAddr && e.type === 'jump'
    );

    let description = `Test Condition\nTST ${node?.operand}`;
    if (jumpEdge && jumpEdge.to > startAddr + 10) {
      description = `Check Loop Boundary\nTest if counter = 0`;
    }

    return {
      id,
      type: 'decision',
      description,
      addresses: [startAddr],
      edges: [
        { from: id, to: id + 1, condition: 'true' },
        { from: id, to: id + 2, condition: 'false' },
      ],
    };
  }

  private connectAlgorithmicBlocks(blocks: AlgorithmicBlock[]): void {
    // Update edges based on actual control flow
    for (let i = 0; i < blocks.length - 1; i++) {
      const currentBlock = blocks[i];
      const nextBlock = blocks[i + 1];

      // Default sequential connection
      if (
        currentBlock.edges.length === 1 &&
        currentBlock.edges[0].to === currentBlock.id + 1
      ) {
        currentBlock.edges[0].to = nextBlock.id;
      }
    }
  }

  private getAlgorithmicNodeShape(block: AlgorithmicBlock): {
    open: string;
    close: string;
  } {
    switch (block.type) {
      case 'start':
      case 'end':
        return { open: '([', close: '])' };
      case 'decision':
        return { open: '{', close: '}' };
      case 'loop':
        return { open: '[[', close: ']]' };
      default:
        return { open: '[', close: ']' };
    }
  }
}
