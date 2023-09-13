import "colors";
import Context from "./Classes/Context.js";
import Interpreter from "./Classes/Interpreter.js";
import Lexer from "./Classes/Lexer.js";
import Parser from "./Classes/Parser.js";
import SymbolTable from "./Classes/SymbolTable.js";
import Number from "./Classes/Interpreter/Number.js";
import BuiltInFunction from "./Classes/Interpreter/BuiltInFunction.js";

const globalSymbolTable = new SymbolTable();
globalSymbolTable.set("pi", Number.pi);
globalSymbolTable.set("log", BuiltInFunction.log);
globalSymbolTable.set("ask", BuiltInFunction.ask);
globalSymbolTable.set("clear", BuiltInFunction.clear);
globalSymbolTable.set("run", BuiltInFunction.run);
globalSymbolTable.set("random", BuiltInFunction.random);
globalSymbolTable.set("round", BuiltInFunction.round);
globalSymbolTable.set("floor", BuiltInFunction.floor);
globalSymbolTable.set("ceil", BuiltInFunction.ceil);
globalSymbolTable.set("join", BuiltInFunction.join);
globalSymbolTable.set("size", BuiltInFunction.size);
globalSymbolTable.set("integer", BuiltInFunction.integer);
globalSymbolTable.set("float", BuiltInFunction.float);
globalSymbolTable.set("string", BuiltInFunction.string);
globalSymbolTable.set("waitfor", BuiltInFunction.waitfor);
globalSymbolTable.set("fetch", BuiltInFunction.fetch);
globalSymbolTable.set("import", BuiltInFunction.import);
globalSymbolTable.set("keys", BuiltInFunction.keys);
globalSymbolTable.set("values", BuiltInFunction.values);
globalSymbolTable.set("entries", BuiltInFunction.entries);

/**
 * @param {string} fn
 * @param {string} text
 * @returns {[]}
 */
export function run(fn, text) {
	let lexer = new Lexer(fn, text);
	let [tokens, error] = lexer.makeToken();
	if (error) return [null, error];

	let parser = new Parser(tokens);
	let ast = parser.parse();
	if (ast.error) return [null, ast.error];

	let interpreter = new Interpreter();
	let context = new Context("<program>");
	context.symbolTable = globalSymbolTable;
	let result = interpreter.visit(ast.node, context);

	return [result.value, result.error];
}
