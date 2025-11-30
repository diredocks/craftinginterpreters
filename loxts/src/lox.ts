import { Token } from "./token";
import { Scanner } from "./scanner";
import { TokenType } from "./token-type";
import { Parser } from "./parser";

class Lox {
  private hadError = false;

  private constructor() { }
  private static _instance: Lox = new Lox();

  public static getInstance(): Lox {
    return Lox._instance;
  }

  async main() {
    const arg = process.argv.slice(2);
    if (arg.length == 0) {
      console.log("Usage: loxts [script]");
    } else if (arg.length == 1) {
      await this.runFile(arg[0]!);
    } else {
      await this.runPrompt();
    }
  }

  async runFile(path: string) {
    this.run(await Bun.file(path).text());
    if (this.hadError) process.exit(65);
  }

  async runPrompt() {
    for (; ;) {
      const line = prompt("վ'ᴗ' ի ::");
      if (!line) break;
      this.run(line);
      this.hadError = false; // reset error state since last eval error had gone
    }
  }

  run(source: string) {
    const scanner: Scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens);
    const expression = parser.parse();

    if (this.hadError) return;

    // console.log(new AstPrinterRPN().print(expression!));
  }

  public error(token: Token, message: string): void;
  public error(line: number, message: string): void;

  public error(arg1: Token | number, message: string): void {
    if (typeof arg1 === "number") {
      this.report(arg1, "", message);
    } else {
      if (arg1.type === TokenType.EOF) {
        this.report(arg1.line, " at end", message);
      } else {
        this.report(arg1.line, ` at '${arg1.lexeme}'`, message);
      }
    }

    this.hadError = true;
  }

  report(line: number, where: string, message: string) {
    console.log(`#${line} Error ${where} : ${message}`);
  }
}

export default Lox.getInstance();
Lox.getInstance().main();
