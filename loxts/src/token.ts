import type { TokenType } from "./token-type";

export class Token {
  constructor(
    public type: TokenType,
    public lexeme: string,
    public literal: unknown,
    public line: number
  ) { }

  toString(): string {
    return `${this.type} ${this.lexeme} ${this.literal}`;
  }
}
