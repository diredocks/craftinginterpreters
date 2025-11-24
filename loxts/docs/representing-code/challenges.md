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
