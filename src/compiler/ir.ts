// Johnny C Intermediate Representation - Simple 3-address code
import {
  Program,
  Statement,
  Expression,
  VarDeclaration,
  Assignment,
  IfStatement,
  WhileStatement,
  HaltStatement,
  BinaryExpression,
  UnaryExpression,
  NumberLiteral,
  BooleanLiteral,
  Identifier,
} from './parser';

// IR Instructions
export abstract class IRInstruction {
  constructor(public id: number) {}
}

// 3-address code operations
export class IRAssign extends IRInstruction {
  constructor(
    id: number,
    public dest: string,
    public src: string
  ) {
    super(id);
  }
}

export class IRBinary extends IRInstruction {
  constructor(
    id: number,
    public dest: string,
    public left: string,
    public op: string,
    public right: string
  ) {
    super(id);
  }
}

export class IRUnary extends IRInstruction {
  constructor(
    id: number,
    public dest: string,
    public op: string,
    public operand: string
  ) {
    super(id);
  }
}

export class IRConstant extends IRInstruction {
  constructor(
    id: number,
    public dest: string,
    public value: number
  ) {
    super(id);
  }
}

export class IRLabel extends IRInstruction {
  constructor(
    id: number,
    public name: string
  ) {
    super(id);
  }
}

export class IRJump extends IRInstruction {
  constructor(
    id: number,
    public target: string
  ) {
    super(id);
  }
}

export class IRConditionalJump extends IRInstruction {
  constructor(
    id: number,
    public condition: string,
    public target: string
  ) {
    super(id);
  }
}

export class IRHalt extends IRInstruction {
  constructor(id: number) {
    super(id);
  }
}

// Basic Block for control flow
export class BasicBlock {
  public instructions: IRInstruction[] = [];
  public predecessors: BasicBlock[] = [];
  public successors: BasicBlock[] = [];

  constructor(public name: string) {}

  addInstruction(instr: IRInstruction): void {
    this.instructions.push(instr);
  }

  addSuccessor(block: BasicBlock): void {
    if (!this.successors.includes(block)) {
      this.successors.push(block);
      block.predecessors.push(this);
    }
  }
}

// Symbol table for variables
export interface Symbol {
  name: string;
  type: 'int' | 'bool';
  isTemp: boolean;
}

export class IRGenerator {
  private nextInstrId = 0;
  private nextTempId = 0;
  private nextLabelId = 0;
  private symbols = new Map<string, Symbol>();
  private blocks: BasicBlock[] = [];
  private currentBlock: BasicBlock;

  constructor() {
    this.currentBlock = new BasicBlock('entry');
    this.blocks.push(this.currentBlock);
  }

  /**
   * Generate IR from AST
   */
  generate(program: Program): {
    blocks: BasicBlock[];
    symbols: Map<string, Symbol>;
  } {
    for (const stmt of program.statements) {
      this.generateStatement(stmt);
    }

    return {
      blocks: this.blocks,
      symbols: this.symbols,
    };
  }

  private generateStatement(stmt: Statement): void {
    if (stmt instanceof VarDeclaration) {
      this.generateVarDeclaration(stmt);
    } else if (stmt instanceof Assignment) {
      this.generateAssignment(stmt);
    } else if (stmt instanceof IfStatement) {
      this.generateIfStatement(stmt);
    } else if (stmt instanceof WhileStatement) {
      this.generateWhileStatement(stmt);
    } else if (stmt instanceof HaltStatement) {
      this.generateHaltStatement();
    }
  }

  private generateVarDeclaration(stmt: VarDeclaration): void {
    // Register the symbol
    this.symbols.set(stmt.name, {
      name: stmt.name,
      type: stmt.type,
      isTemp: false,
    });

    // Generate initialization if present
    if (stmt.initializer) {
      const valueTemp = this.generateExpression(stmt.initializer);
      this.emit(new IRAssign(this.nextInstrId++, stmt.name, valueTemp));
    } else {
      // Initialize to 0
      this.emit(new IRConstant(this.nextInstrId++, stmt.name, 0));
    }
  }

  private generateAssignment(stmt: Assignment): void {
    const valueTemp = this.generateExpression(stmt.value);
    this.emit(new IRAssign(this.nextInstrId++, stmt.name, valueTemp));
  }

  private generateIfStatement(stmt: IfStatement): void {
    const conditionTemp = this.generateExpression(stmt.condition);

    // Create blocks
    const thenBlock = this.createBlock('if_then');
    const elseBlock = stmt.elseBranch
      ? this.createBlock('if_else')
      : this.createBlock('if_end');
    const endBlock = this.createBlock('if_end');

    // Conditional jump
    this.emit(
      new IRConditionalJump(this.nextInstrId++, conditionTemp, thenBlock.name)
    );

    // Jump to else/end
    if (stmt.elseBranch) {
      this.emit(new IRJump(this.nextInstrId++, elseBlock.name));
    } else {
      this.emit(new IRJump(this.nextInstrId++, endBlock.name));
    }

    // Generate then branch
    this.switchToBlock(thenBlock);
    for (const s of stmt.thenBranch) {
      this.generateStatement(s);
    }
    this.emit(new IRJump(this.nextInstrId++, endBlock.name));

    // Generate else branch if present
    if (stmt.elseBranch && elseBlock !== endBlock) {
      this.switchToBlock(elseBlock);
      for (const s of stmt.elseBranch) {
        this.generateStatement(s);
      }
      this.emit(new IRJump(this.nextInstrId++, endBlock.name));
    }

    // Continue with end block
    this.switchToBlock(endBlock);
  }

  private generateWhileStatement(stmt: WhileStatement): void {
    const condBlock = this.createBlock('while_cond');
    const bodyBlock = this.createBlock('while_body');
    const endBlock = this.createBlock('while_end');

    // Jump to condition
    this.emit(new IRJump(this.nextInstrId++, condBlock.name));

    // Generate condition block
    this.switchToBlock(condBlock);
    const conditionTemp = this.generateExpression(stmt.condition);
    this.emit(
      new IRConditionalJump(this.nextInstrId++, conditionTemp, bodyBlock.name)
    );
    this.emit(new IRJump(this.nextInstrId++, endBlock.name));

    // Generate body block
    this.switchToBlock(bodyBlock);
    for (const s of stmt.body) {
      this.generateStatement(s);
    }
    this.emit(new IRJump(this.nextInstrId++, condBlock.name));

    // Continue with end block
    this.switchToBlock(endBlock);
  }

  private generateHaltStatement(): void {
    this.emit(new IRHalt(this.nextInstrId++));
  }

  private generateExpression(expr: Expression): string {
    if (expr instanceof NumberLiteral) {
      const temp = this.newTemp();
      this.emit(new IRConstant(this.nextInstrId++, temp, expr.value));
      return temp;
    }

    if (expr instanceof BooleanLiteral) {
      const temp = this.newTemp();
      this.emit(new IRConstant(this.nextInstrId++, temp, expr.value ? 1 : 0));
      return temp;
    }

    if (expr instanceof Identifier) {
      return expr.name;
    }

    if (expr instanceof BinaryExpression) {
      const leftTemp = this.generateExpression(expr.left);
      const rightTemp = this.generateExpression(expr.right);
      const resultTemp = this.newTemp();

      this.emit(
        new IRBinary(
          this.nextInstrId++,
          resultTemp,
          leftTemp,
          expr.operator,
          rightTemp
        )
      );
      return resultTemp;
    }

    if (expr instanceof UnaryExpression) {
      const operandTemp = this.generateExpression(expr.operand);
      const resultTemp = this.newTemp();

      this.emit(
        new IRUnary(this.nextInstrId++, resultTemp, expr.operator, operandTemp)
      );
      return resultTemp;
    }

    throw new Error(`Unsupported expression type: ${expr.constructor.name}`);
  }

  private emit(instr: IRInstruction): void {
    this.currentBlock.addInstruction(instr);
  }

  private createBlock(baseName: string): BasicBlock {
    const block = new BasicBlock(`${baseName}_${this.nextLabelId++}`);
    this.blocks.push(block);
    this.currentBlock.addSuccessor(block);
    return block;
  }

  private switchToBlock(block: BasicBlock): void {
    this.currentBlock = block;
  }

  private newTemp(): string {
    const temp = `_t${this.nextTempId++}`;
    this.symbols.set(temp, {
      name: temp,
      type: 'int', // All temps are int for simplicity
      isTemp: true,
    });
    return temp;
  }
}
