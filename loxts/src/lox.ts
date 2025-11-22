import { Scanner } from "./scanner";

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
      const line = prompt("վ'ᴗ' ի ");
      if (!line) break;
      this.run(line);
      this.hadError = false; // reset error state since last eval error had gone
    }
  }

  run(source: string) {
    const scanner: Scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    for (const token of tokens) {
      console.log(`${token}`);
    }
  }

  public error(line: number, message: string) {
    this.report(line, "", message);
    this.hadError = true;
  }

  report(line: number, where: string, message: string) {
    console.log(`#${line} Error ${where} : ${message}`);
  }
}

export default Lox.getInstance();
Lox.getInstance().main();
