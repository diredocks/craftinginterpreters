// WARN: We still gonna import some types used here manually

// helper function that make things easier
function createGenerated() {
  let generated = "";
  return (content?: string | null) => {
    // no newline when no parameter (get generated string)
    if (content != null) generated += content + "\n";
    return generated;
  };
}

export class GenerateAst {
  private constructor() { }
  private static _instance = new GenerateAst();

  public static getInstance() {
    return GenerateAst._instance;
  }

  async main() {
    const arg = process.argv.slice(2);
    if (arg.length != 1) {
      console.error("Usage: generate_ast <output directory>");
      process.exit(64);
    }
    const outputDir = arg[0];
    // we use ts notation here since we're generating ts code
    this.defineAst(outputDir!, "Expr", [
      "Binary   :: left: Expr, operator: Token, right: Expr",
      "Grouping :: expression: Expr",
      "Literal  :: value: any",
      "Unary    :: operator: Token, right: Expr"
    ]);

    this.defineAst(outputDir!, "Stmt", [
      "Expression :: expression: Expr",
      "Print      :: expression: Expr"
    ]);
  }

  private async defineAst(outputDir: string, baseName: string, types: string[]) {
    const path = outputDir + "/" + baseName.toLowerCase() + ".ts";

    const writeGenerated = createGenerated();
    this.defineVisitor(writeGenerated, baseName, types);

    writeGenerated("export abstract class " + baseName + " {");
    writeGenerated("  abstract accept<R>(visitor: Visitor<R>): R;");
    writeGenerated("}");
    writeGenerated("");

    for (const type of types) {
      const className = type.split('::')[0]?.trim()!;
      const fields = type.split('::')[1]?.trim()!;
      this.defineType(writeGenerated, baseName, className, fields);
    }

    await Bun.write(path, writeGenerated()); // write it at once
  }

  private defineType(writeGenerated: any, baseName: string, className: string, fields: string) {
    writeGenerated("export class " + className + " extends " + baseName + " {");
    // constructor will *define fields* and *store parameters*
    writeGenerated("  constructor(");
    for (const field of fields.split(',')) {
      writeGenerated(`    public ${field},`);
    }
    writeGenerated("  ) { super(); }");
    writeGenerated("");
    // this is where we call visitor implemented methods
    writeGenerated("  accept<R>(visitor: Visitor<R>): R {");
    writeGenerated(`    return visitor.visit${className}${baseName}(this);`);
    writeGenerated("  }");
    writeGenerated("}");
    writeGenerated("");
  }

  private defineVisitor(writeGenerated: any, baseName: string, types: string[]) {
    writeGenerated("export interface Visitor<R> {");
    for (const type of types) {
      const typeName = type.split('::')[0]?.trim()!;
      writeGenerated(`  visit${typeName}${baseName}(expr: ${typeName}): R;`);
    }
    writeGenerated("}");
    writeGenerated("");
  }
}

export default GenerateAst.getInstance();
GenerateAst.getInstance().main();
