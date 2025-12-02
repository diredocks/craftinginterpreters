import Lox from "./lox";
import { Token } from "./token";
import { TokenType } from "./token-type";
import { RuntimeError } from "./runtime-error";
import type { Binary, Expr, Grouping, Literal, Unary, Visitor } from "./expr";

export class Interpreter implements Visitor<any> {
  interpret(expr: Expr) {
    try {
      const value = this.evaluate(expr);
      console.log(this.stringify(value));
    } catch (err: unknown) {
      if (err instanceof RuntimeError) {
        Lox.runtimeError(err);
      } else {
        throw err;
      }
    }
  }

  private stringify(obj: any): string {
    if (obj === null) return "nil";

    return obj.toString();
  }

  visitLiteralExpr(expr: Literal): any {
    return expr.value;
  }

  visitGroupingExpr(expr: Grouping): any {
    return this.evaluate(expr.expression);
  }

  private evaluate(expr: Expr): any {
    return expr.accept(this);
  }

  visitUnaryExpr(expr: Unary): any {
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.BANG:
        return this.isTruthy(right);
      case TokenType.MINUS:
        return -right;
    }
  }

  private isTruthy(obj: any) {
    if (obj === null) return false;
    if (typeof obj === "boolean") return obj;
    return true;
  }

  visitBinaryExpr(expr: Binary) {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.GREATER:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) > Number(right);
      case TokenType.GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) >= Number(right);
      case TokenType.LESS:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) < Number(right);
      case TokenType.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) <= Number(right);
      case TokenType.BANG_EQUAL:
        return !this.isEqual(left, right);
      case TokenType.EQUAL_EQUAL:
        return this.isEqual(left, right);
      case TokenType.MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return left - right;
      case TokenType.PLUS:
        const leftType = typeof left;
        const rightType = typeof right;
        if (leftType === "number" && rightType === "number") {
          return Number(left) + Number(right);
        }
        if (leftType === "string" && rightType === "string") {
          return left + right;
        }
        if ((leftType === "string" && rightType === "number") ||
          (leftType === "number" && rightType === "string")) {
          return left + right;
        }
        throw new RuntimeError(expr.operator,
          "Operands must be numbers or strings.");
      case TokenType.SLASH:
        this.checkNumberOperands(expr.operator, left, right);
        if (right === 0) {
          throw new RuntimeError(expr.operator,
            "Can not divide a number by zero.");
        }
        return left / right;
      case TokenType.STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return left * right;
    }

    return null;
  }

  private isEqual(a: any, b: any) {
    if (a === null && b === null) return true;
    if (a === null) return false;

    return a === b;
  }

  private checkNumberOperands(operator: Token, left: any, right: any) {
    if (typeof left === "number" && typeof right === "number") return;
    throw new RuntimeError(operator, "Operands must be numbers.");
  }
}
