// Johnny C Parser - Recursive descent parser that builds an AST
import { Token, TokenType, Lexer, LexerError } from './lexer';

// AST Node types
export abstract class ASTNode {
  constructor(
    public line: number,
    public column: number
  ) {}
}

// Program
export class Program extends ASTNode {
  constructor(
    public statements: Statement[],
    line: number,
    column: number
  ) {
    super(line, column);
  }
}

// Statements
export abstract class Statement extends ASTNode {}

export class VarDeclaration extends Statement {
  constructor(
    public type: 'int' | 'bool',
    public name: string,
    public initializer: Expression | null,
    line: number,
    column: number
  ) {
    super(line, column);
  }
}

export class Assignment extends Statement {
  constructor(
    public name: string,
    public value: Expression,
    line: number,
    column: number
  ) {
    super(line, column);
  }
}

export class IfStatement extends Statement {
  constructor(
    public condition: Expression,
    public thenBranch: Statement[],
    public elseBranch: Statement[] | null,
    line: number,
    column: number
  ) {
    super(line, column);
  }
}

export class WhileStatement extends Statement {
  constructor(
    public condition: Expression,
    public body: Statement[],
    line: number,
    column: number
  ) {
    super(line, column);
  }
}

export class HaltStatement extends Statement {
  constructor(line: number, column: number) {
    super(line, column);
  }
}

// Expressions
export abstract class Expression extends ASTNode {}

export class BinaryExpression extends Expression {
  constructor(
    public left: Expression,
    public operator: string,
    public right: Expression,
    line: number,
    column: number
  ) {
    super(line, column);
  }
}

export class UnaryExpression extends Expression {
  constructor(
    public operator: string,
    public operand: Expression,
    line: number,
    column: number
  ) {
    super(line, column);
  }
}

export class NumberLiteral extends Expression {
  constructor(
    public value: number,
    line: number,
    column: number
  ) {
    super(line, column);
  }
}

export class Identifier extends Expression {
  constructor(
    public name: string,
    line: number,
    column: number
  ) {
    super(line, column);
  }
}

export class ParseError extends Error {
  constructor(
    message: string,
    public token: Token
  ) {
    super(
      `Parse error at line ${token.line}, column ${token.column}: ${message}`
    );
    this.name = 'ParseError';
  }
}

export class Parser {
  private tokens: Token[];
  private current: number = 0;

  constructor(source: string) {
    const lexer = new Lexer(source);
    try {
      this.tokens = lexer.tokenize();
    } catch (error) {
      if (error instanceof LexerError) {
        throw error;
      }
      throw new Error(`Lexer failed: ${error}`);
    }
  }

  /**
   * Parse the program
   * program → statement* EOF
   */
  parse(): Program {
    const statements: Statement[] = [];

    while (!this.isAtEnd()) {
      // Skip newlines at top level
      if (this.check(TokenType.NEWLINE)) {
        this.advance();
        continue;
      }

      const stmt = this.statement();
      if (stmt) {
        statements.push(stmt);
      }
    }

    const firstToken = this.tokens[0] || {
      line: 1,
      column: 1,
      type: TokenType.EOF,
      value: '',
    };
    return new Program(statements, firstToken.line, firstToken.column);
  }

  /**
   * Parse a statement
   * statement → varDecl | assignment | ifStmt | whileStmt | haltStmt
   */
  private statement(): Statement | null {
    try {
      if (this.match(TokenType.INT, TokenType.BOOL)) {
        return this.varDeclaration();
      }

      if (this.match(TokenType.IF)) {
        return this.ifStatement();
      }

      if (this.match(TokenType.WHILE)) {
        return this.whileStatement();
      }

      if (this.match(TokenType.HALT)) {
        return this.haltStatement();
      }

      if (this.check(TokenType.IDENTIFIER)) {
        return this.assignment();
      }

      // Skip unexpected tokens
      if (!this.isAtEnd()) {
        this.advance();
      }
      return null;
    } catch (error) {
      // Synchronize on statement boundaries
      this.synchronize();
      throw error;
    }
  }

  /**
   * Parse variable declaration
   * varDecl → ("int" | "bool") IDENTIFIER ("=" expression)? ";"
   */
  private varDeclaration(): VarDeclaration {
    const typeToken = this.previous();
    const type = typeToken.value as 'int' | 'bool';

    if (!this.check(TokenType.IDENTIFIER)) {
      throw new ParseError(
        `Expected variable name after '${type}'`,
        this.peek()
      );
    }

    const name = this.advance().value;
    let initializer: Expression | null = null;

    if (this.match(TokenType.ASSIGN)) {
      initializer = this.expression();
    }

    this.consume(
      TokenType.SEMICOLON,
      "Expected ';' after variable declaration"
    );

    return new VarDeclaration(
      type,
      name,
      initializer,
      typeToken.line,
      typeToken.column
    );
  }

  /**
   * Parse assignment
   * assignment → IDENTIFIER "=" expression ";"
   */
  private assignment(): Assignment {
    const nameToken = this.advance();
    const name = nameToken.value;

    this.consume(TokenType.ASSIGN, "Expected '=' after variable name");
    const value = this.expression();
    this.consume(TokenType.SEMICOLON, "Expected ';' after assignment");

    return new Assignment(name, value, nameToken.line, nameToken.column);
  }

  /**
   * Parse if statement
   * ifStmt → "if" "(" expression ")" "{" statement* "}" ("else" "{" statement* "}")?
   */
  private ifStatement(): IfStatement {
    const ifToken = this.previous();

    this.consume(TokenType.LEFT_PAREN, "Expected '(' after 'if'");
    const condition = this.expression();
    this.consume(TokenType.RIGHT_PAREN, "Expected ')' after if condition");

    this.consume(TokenType.LEFT_BRACE, "Expected '{' before if body");
    const thenBranch = this.block();

    let elseBranch: Statement[] | null = null;
    if (this.match(TokenType.ELSE)) {
      this.consume(TokenType.LEFT_BRACE, "Expected '{' before else body");
      elseBranch = this.block();
    }

    return new IfStatement(
      condition,
      thenBranch,
      elseBranch,
      ifToken.line,
      ifToken.column
    );
  }

  /**
   * Parse while statement
   * whileStmt → "while" "(" expression ")" "{" statement* "}"
   */
  private whileStatement(): WhileStatement {
    const whileToken = this.previous();

    this.consume(TokenType.LEFT_PAREN, "Expected '(' after 'while'");
    const condition = this.expression();
    this.consume(TokenType.RIGHT_PAREN, "Expected ')' after while condition");

    this.consume(TokenType.LEFT_BRACE, "Expected '{' before while body");
    const body = this.block();

    return new WhileStatement(
      condition,
      body,
      whileToken.line,
      whileToken.column
    );
  }

  /**
   * Parse halt statement
   * haltStmt → "halt" ";"
   */
  private haltStatement(): HaltStatement {
    const haltToken = this.previous();
    this.consume(TokenType.SEMICOLON, "Expected ';' after 'halt'");

    return new HaltStatement(haltToken.line, haltToken.column);
  }

  /**
   * Parse a block of statements
   * block → statement* "}"
   */
  private block(): Statement[] {
    const statements: Statement[] = [];

    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      // Skip newlines in blocks
      if (this.check(TokenType.NEWLINE)) {
        this.advance();
        continue;
      }

      const stmt = this.statement();
      if (stmt) {
        statements.push(stmt);
      }
    }

    this.consume(TokenType.RIGHT_BRACE, "Expected '}' after block");
    return statements;
  }

  /**
   * Parse expression
   * expression → equality
   */
  private expression(): Expression {
    return this.equality();
  }

  /**
   * Parse equality expressions
   * equality → comparison ( ( "!=" | "==" ) comparison )*
   */
  private equality(): Expression {
    let expr = this.comparison();

    while (this.match(TokenType.NOT_EQUAL, TokenType.EQUAL)) {
      const operator = this.previous().value;
      const right = this.comparison();
      expr = new BinaryExpression(
        expr,
        operator,
        right,
        expr.line,
        expr.column
      );
    }

    return expr;
  }

  /**
   * Parse comparison expressions
   * comparison → term ( ( ">" | ">=" | "<" | "<=" ) term )*
   */
  private comparison(): Expression {
    let expr = this.term();

    while (
      this.match(
        TokenType.GREATER,
        TokenType.GREATER_EQUAL,
        TokenType.LESS,
        TokenType.LESS_EQUAL
      )
    ) {
      const operator = this.previous().value;
      const right = this.term();
      expr = new BinaryExpression(
        expr,
        operator,
        right,
        expr.line,
        expr.column
      );
    }

    return expr;
  }

  /**
   * Parse term expressions
   * term → factor ( ( "-" | "+" ) factor )*
   */
  private term(): Expression {
    let expr = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous().value;
      const right = this.factor();
      expr = new BinaryExpression(
        expr,
        operator,
        right,
        expr.line,
        expr.column
      );
    }

    return expr;
  }

  /**
   * Parse factor expressions
   * factor → unary ( ( "/" | "*" ) unary )*
   */
  private factor(): Expression {
    let expr = this.unary();

    while (this.match(TokenType.DIVIDE, TokenType.MULTIPLY)) {
      const operator = this.previous().value;
      const right = this.unary();
      expr = new BinaryExpression(
        expr,
        operator,
        right,
        expr.line,
        expr.column
      );
    }

    return expr;
  }

  /**
   * Parse unary expressions
   * unary → ( "!" | "-" ) unary | primary
   */
  private unary(): Expression {
    if (this.match(TokenType.MINUS)) {
      const operator = this.previous().value;
      const right = this.unary();
      return new UnaryExpression(
        operator,
        right,
        this.previous().line,
        this.previous().column
      );
    }

    return this.primary();
  }

  /**
   * Parse primary expressions
   * primary → NUMBER | IDENTIFIER | "(" expression ")"
   */
  private primary(): Expression {
    if (this.match(TokenType.NUMBER)) {
      const token = this.previous();
      return new NumberLiteral(
        parseInt(token.value, 10),
        token.line,
        token.column
      );
    }

    if (this.match(TokenType.IDENTIFIER)) {
      const token = this.previous();
      return new Identifier(token.value, token.line, token.column);
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expected ')' after expression");
      return expr;
    }

    throw new ParseError('Expected expression', this.peek());
  }

  // Utility methods
  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();

    throw new ParseError(message, this.peek());
  }

  private synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.SEMICOLON) return;

      switch (this.peek().type) {
        case TokenType.INT:
        case TokenType.BOOL:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.HALT:
          return;
      }

      this.advance();
    }
  }
}
