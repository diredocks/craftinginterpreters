async function main() {
  const arg = process.argv.slice(2);
  if (arg.length == 0) {
    console.log("Usage: loxts [script]");
  } else if (arg.length == 1) {
    runFile(arg[0]!);
  } else {
    runPrompt();
  }
}

async function runFile(path: string) {
  run(await Bun.file(path).text());
}

async function runPrompt() {
  for (; ;) {
    const line = prompt("վ'ᴗ' ի ");
    if (!line) break;
    run(line);
  }
}

function run(source: string) { }

await main();
