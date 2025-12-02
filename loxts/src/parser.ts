import { Token } from "./token";
import { TokenType } from "./token-type";
import { Binary, Expr, Grouping, Literal, Unary } from "./expr";
import Lox from "./lox";
import { Expression, Print, Stmt } from "./stmt";

export class ParseError extends Error { }

export class Parser {
  private current: number = 0;
  constructor(private tokens: Token[]) { }

  private expression(): Expr {
    return this.equality();
  }

  private binary(nextRule: () => Expr, ...types: TokenType[]): Expr {
    let expr: Expr = nextRule();

    while (this.match(...types)) {
      const operator: Token = this.previous();
      const right: Expr = this.comparison();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private equality(): Expr {
    return this.binary(() => this.comparison(),
      TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL);
  }

  private comparison(): Expr {
    return this.binary(() => this.term(),
      TokenType.GREATER, TokenType.GREATER_EQUAL,
      TokenType.LESS, TokenType.LESS_EQUAL);
  }

  private term(): Expr {
    return this.binary(() => this.factor(), TokenType.MINUS, TokenType.PLUS);
  }

  private factor(): Expr {
    return this.binary(() => this.unary(), TokenType.SLASH, TokenType.STAR);
  }

  private unary(): Expr {
    while (this.match(TokenType.MINUS, TokenType.BANG)) {
      const operator = this.previous();
      const right = this.unary();
      return new Unary(operator, right);
    }

    return this.primary();
  }

  private primary(): Expr {
    if (this.match(TokenType.FALSE)) return new Literal(false);
    if (this.match(TokenType.TRUE)) return new Literal(true);
    if (this.match(TokenType.NIL)) return new Literal(null);

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new Literal(this.previous().literal);
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
      return new Grouping(expr);
    }

    throw this.error(this.peek(), "Expect expression.");
  }

  private consume(type: TokenType, message: string) {
    if (this.check(type)) return this.advance();
    throw this.error(this.peek(), message);
  }

  private error(token: Token, message: string): ParseError {
    Lox.error(token, message);
    return new ParseError(message);
  }

  private synchronize() {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.SEMICOLON) return;
      switch (this.peek().type) {
        case TokenType.CLASS:
        case TokenType.FUN:
        case TokenType.VAR:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return;
      }
      this.advance();
    }
  }

  private match(...types: TokenType[]) {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType) {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance() {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd() {
    return this.peek().type === TokenType.EOF;
  }

  private peek() {
    return this.tokens[this.current]!;
  }

  private previous() {
    return this.tokens[this.current - 1]!;
  }

  public parse() {
    const statements: Stmt[] = [];
    while (!this.isAtEnd()) {
      statements.push(this.statement());
    }
    return statements;
  }

  private statement() {
    if (this.match(TokenType.PRINT)) return this.printStatement();
    return this.expressionStatement();
  }

  private printStatement() {
    const value = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
    return new Print(value);
  }

  private expressionStatement() {
    const value = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
    return new Expression(value);
  }
}
