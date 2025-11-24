import { Binary, Expr, Grouping, Literal, Unary, type Visitor } from "../../src/expr";
import { Token } from "../../src/token";
import { TokenType } from "../../src/token-type";

export class AstPrinterRPN implements Visitor<string> {
  print(expr: Expr): string {
    return expr.accept(this);
  }

  visitBinaryExpr(expr: Binary): string {
    return this.rpnify(expr.operator.lexeme, expr.left, expr.right);
  }

  visitGroupingExpr(expr: Grouping): string {
    return this.rpnify("GROUPING", expr.expression);
  }

  visitLiteralExpr(expr: Literal): string {
    if (expr.value == null) return "nil";
    return expr.value; // this.rpnify(expr.value);
  }

  visitUnaryExpr(expr: Unary): string {
    return this.rpnify(expr.operator.lexeme, expr.right);
  }

  rpnify(name: string, ...exprs: any[]): string {
    let val = "";
    for (const expr of exprs) {
      val += `${expr.accept(this)} `;
    }
    val += name;
    return val;
  }
}

const expr = new Binary(
  new Binary(
    new Literal(1),
    new Token(TokenType.PLUS, "+", null, 1),
    new Literal(2),
  ),
  new Token(TokenType.STAR, "*", null, 1),
  new Binary(
    new Literal(4),
    new Token(TokenType.MINUS, "-", null, 1),
    new Literal(3),
  )
)

console.log(new AstPrinterRPN().print(expr));
