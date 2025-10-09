// Johnny C Lexer - Tokenizes Johnny C source code
export enum TokenType {
  // Literals
  NUMBER = 'NUMBER',
  IDENTIFIER = 'IDENTIFIER',

  // Keywords
  INT = 'INT',
  BOOL = 'BOOL',
  IF = 'IF',
  ELSE = 'ELSE',
  WHILE = 'WHILE',
  HALT = 'HALT',
  TRUE = 'TRUE',
  FALSE = 'FALSE',

  // Operators
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  MULTIPLY = 'MULTIPLY',
  DIVIDE = 'DIVIDE',
  ASSIGN = 'ASSIGN',

  // Comparisons
  EQUAL = 'EQUAL',
  NOT_EQUAL = 'NOT_EQUAL',
  GREATER = 'GREATER',
  LESS = 'LESS',
  GREATER_EQUAL = 'GREATER_EQUAL',
  LESS_EQUAL = 'LESS_EQUAL',

  // Punctuation
  SEMICOLON = 'SEMICOLON',
  LEFT_PAREN = 'LEFT_PAREN',
  RIGHT_PAREN = 'RIGHT_PAREN',
  LEFT_BRACE = 'LEFT_BRACE',
  RIGHT_BRACE = 'RIGHT_BRACE',

  // Special
  EOF = 'EOF',
  NEWLINE = 'NEWLINE',
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export class LexerError extends Error {
  constructor(
    message: string,
    public line: number,
    public column: number
  ) {
    super(`Lexer error at line ${line}, column ${column}: ${message}`);
    this.name = 'LexerError';
  }
}

export class Lexer {
  private source: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;

  constructor(source: string) {
    this.source = source;
  }

  /**
   * Tokenize the entire source code
   */
  tokenize(): Token[] {
    const tokens: Token[] = [];

    while (!this.isAtEnd()) {
      const token = this.nextToken();
      if (token) {
        tokens.push(token);
      }
    }

    tokens.push({
      type: TokenType.EOF,
      value: '',
      line: this.line,
      column: this.column,
    });

    return tokens;
  }

  private nextToken(): Token | null {
    this.skipWhitespace();

    if (this.isAtEnd()) {
      return null;
    }

    const start = this.position;
    const startLine = this.line;
    const startColumn = this.column;

    const char = this.advance();

    // Single-character tokens
    switch (char) {
      case '+':
        return this.makeToken(TokenType.PLUS, '+', startLine, startColumn);
      case '-':
        return this.makeToken(TokenType.MINUS, '-', startLine, startColumn);
      case '*':
        return this.makeToken(TokenType.MULTIPLY, '*', startLine, startColumn);
      case '/':
        // Handle comments
        if (this.peek() === '/') {
          this.skipLineComment();
          return this.nextToken();
        }
        return this.makeToken(TokenType.DIVIDE, '/', startLine, startColumn);
      case ';':
        return this.makeToken(TokenType.SEMICOLON, ';', startLine, startColumn);
      case '(':
        return this.makeToken(
          TokenType.LEFT_PAREN,
          '(',
          startLine,
          startColumn
        );
      case ')':
        return this.makeToken(
          TokenType.RIGHT_PAREN,
          ')',
          startLine,
          startColumn
        );
      case '{':
        return this.makeToken(
          TokenType.LEFT_BRACE,
          '{',
          startLine,
          startColumn
        );
      case '}':
        return this.makeToken(
          TokenType.RIGHT_BRACE,
          '}',
          startLine,
          startColumn
        );
      case '\n':
        this.line++;
        this.column = 1;
        return this.makeToken(TokenType.NEWLINE, '\n', startLine, startColumn);
    }

    // Two-character tokens
    if (char === '=') {
      if (this.peek() === '=') {
        this.advance();
        return this.makeToken(TokenType.EQUAL, '==', startLine, startColumn);
      }
      return this.makeToken(TokenType.ASSIGN, '=', startLine, startColumn);
    }

    if (char === '!') {
      if (this.peek() === '=') {
        this.advance();
        return this.makeToken(
          TokenType.NOT_EQUAL,
          '!=',
          startLine,
          startColumn
        );
      }
      throw new LexerError(`Unexpected character '!'`, startLine, startColumn);
    }

    if (char === '>') {
      if (this.peek() === '=') {
        this.advance();
        return this.makeToken(
          TokenType.GREATER_EQUAL,
          '>=',
          startLine,
          startColumn
        );
      }
      return this.makeToken(TokenType.GREATER, '>', startLine, startColumn);
    }

    if (char === '<') {
      if (this.peek() === '=') {
        this.advance();
        return this.makeToken(
          TokenType.LESS_EQUAL,
          '<=',
          startLine,
          startColumn
        );
      }
      return this.makeToken(TokenType.LESS, '<', startLine, startColumn);
    }

    // Numbers
    if (this.isDigit(char)) {
      while (this.isDigit(this.peek())) {
        this.advance();
      }
      const value = this.source.substring(start, this.position);
      return this.makeToken(TokenType.NUMBER, value, startLine, startColumn);
    }

    // Identifiers and keywords
    if (this.isAlpha(char)) {
      while (this.isAlphaNumeric(this.peek())) {
        this.advance();
      }
      const value = this.source.substring(start, this.position);
      const type = this.getKeywordType(value) || TokenType.IDENTIFIER;
      return this.makeToken(type, value, startLine, startColumn);
    }

    throw new LexerError(
      `Unexpected character '${char}'`,
      startLine,
      startColumn
    );
  }

  private makeToken(
    type: TokenType,
    value: string,
    line: number,
    column: number
  ): Token {
    return { type, value, line, column };
  }

  private getKeywordType(text: string): TokenType | null {
    const keywords: Record<string, TokenType> = {
      int: TokenType.INT,
      bool: TokenType.BOOL,
      if: TokenType.IF,
      else: TokenType.ELSE,
      while: TokenType.WHILE,
      halt: TokenType.HALT,
      true: TokenType.TRUE,
      false: TokenType.FALSE,
    };
    return keywords[text] || null;
  }

  private isAtEnd(): boolean {
    return this.position >= this.source.length;
  }

  private advance(): string {
    if (this.isAtEnd()) return '\0';
    const char = this.source[this.position++];
    if (char !== '\n') {
      this.column++;
    }
    return char;
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0';
    return this.source[this.position];
  }

  private skipWhitespace(): void {
    while (!this.isAtEnd()) {
      const char = this.peek();
      if (char === ' ' || char === '\r' || char === '\t') {
        this.advance();
      } else {
        break;
      }
    }
  }

  private skipLineComment(): void {
    while (!this.isAtEnd() && this.peek() !== '\n') {
      this.advance();
    }
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }

  private isAlpha(char: string): boolean {
    return (
      (char >= 'a' && char <= 'z') ||
      (char >= 'A' && char <= 'Z') ||
      char === '_'
    );
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }
}
