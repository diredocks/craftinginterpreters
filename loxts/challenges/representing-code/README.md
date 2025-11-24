## 1

### Question

Earlier, I said that the |, \*, and + forms we added to our grammar metasyntax were just syntactic sugar. Take this grammar:

```
expr → expr ( "(" ( expr ( "," expr )* )? ")" | "." IDENTIFIER )+
     | IDENTIFIER
     | NUMBER
```

Produce a grammar that matches the same language but does not use any of that notational sugar.

### Answer

```
expr -> IDENTIFIER;
expr -> NUMBER;
expr -> expr "." IDENTIFIER;
expr -> expr call;

call -> "(" ")";
call -> "(" params ")";

params -> expr;
params -> params "," expr;
```

I think this gonna work but it seems not exactly the same of the original grammar according to Gemini and ChatGPT.

## 2

### Question

In reverse Polish notation (RPN), the operands to an arithmetic operator are both placed before the operator, so 1 + 2 becomes 1 2 +. Evaluation proceeds from left to right. Numbers are pushed onto an implicit stack. An arithmetic operator pops the top two numbers, performs the operation, and pushes the result. Thus, this:

```
(1 + 2) * (4 - 3)
```

in RPN becomes:

```
1 2 + 4 3 - *
```

Define a visitor class for our syntax tree classes that takes an expression, converts it to RPN, and returns the resulting string.

### Answer

See [ast-printer-rpn.ts](./ast-printer-rpn.ts)
