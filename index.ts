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

/**
 * @param {string} fn
 * @param {string} text
 * @returns {[]}
 */
export function run(fn, text) {
  const lexer = new Lexer(fn, text);
  const { tokens, error } = lexer.makeToken();
  if (error) return [null, error];

  const parser = new Parser(tokens);
  const ast = parser.parse();
  if (ast.error) return [null, ast.error];

  const interpreter = new Interpreter();
  const context = new Context("<program>");
  context.symbolTable = globalSymbolTable;
  const result = interpreter.visit(ast.node, context);

  return [result.value, result.error];
}
