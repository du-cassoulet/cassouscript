import path from "path";
import chalk from "chalk";
import Context from "./Classes/Context";
import Interpreter from "./Classes/Interpreter";
import Lexer from "./Classes/Lexer";
import Parser from "./Classes/Parser";
import SymbolTable from "./Classes/SymbolTable";
import Number from "./Classes/Interpreter/Number";
import BuiltInFunction from "./Classes/Interpreter/BuiltInFunction";
import Config from "./Classes/Config";

const globalSymbolTable = new SymbolTable();
globalSymbolTable.set("pi", Number.pi);
globalSymbolTable.set("log", BuiltInFunction.log);

export function run(fn: string, text: string) {
	const start = process.hrtime();
	const config = new Config(path.join(path.dirname(fn), ".config"));
	const lexer = new Lexer(fn, text, config);
	const { tokens, error } = lexer.makeToken();
	if (error) return { value: null, error };

	const parser = new Parser(tokens, config);
	const ast = parser.parse();
	if (ast.error) return { value: null, error: ast.error };

	const context = new Context("<program>");
	context.symbolTable = globalSymbolTable;

	const interpreter = new Interpreter();
	const result = interpreter.visit(ast.node, context);

	if (!result.error && config.rules.LOG_SPEED) {
		const stop = process.hrtime(start);
		const executionTime = (stop[0] * 1e9 + stop[1]) / 1e6;
		console.log(chalk.black(`\nExecuted in ${executionTime.toFixed(3)}ms.`));
	}

	return { value: result.value, error: result.error };
}
