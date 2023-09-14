import Context from "./Classes/Context";
import Interpreter from "./Classes/Interpreter";
import Lexer from "./Classes/Lexer";
import Parser from "./Classes/Parser";
import SymbolTable from "./Classes/SymbolTable";
import Number from "./Classes/Interpreter/Number";
import BuiltInFunction from "./Classes/Interpreter/BuiltInFunction";

const globalSymbolTable = new SymbolTable();
globalSymbolTable.set("pi", Number.pi);
globalSymbolTable.set("log", BuiltInFunction.log);

export function run(fn: string, text: string) {
  const lexer = new Lexer(fn, text);
  const { tokens, error } = lexer.makeToken();
  if (error) return { value: null, error };

  const parser = new Parser(tokens);
  const ast = parser.parse();
  if (ast.error) return { value: null, error: ast.error };

  const context = new Context("<program>");
  context.symbolTable = globalSymbolTable;

  const interpreter = new Interpreter();
  const result = interpreter.visit(ast.node, context);

  return { value: result.value, error: result.error };
}
