import path from "path";
import chalk from "chalk";
import Context from "./Classes/Context";
import Interpreter from "./Classes/Interpreter";
import Lexer from "./Classes/Lexer";
import Parser from "./Classes/Parser";
import SymbolTable from "./Classes/SymbolTable";
import Dictionary from "./Classes/Interpreter/Dictionary";
import Config from "./Classes/Config";
import BuiltInFunction from "./Classes/Interpreter/BuiltInFunction";
import { JSONToNodes } from "./utils";

export const globalSymbolTable = new SymbolTable();
globalSymbolTable.set("std", Dictionary.std);
globalSymbolTable.set("sqrt", BuiltInFunction.sqrt);

export async function run(
	rootPath: string,
	fn: string,
	text: string,
	isMain: boolean
) {
	const start = process.hrtime();
	const config = new Config(path.join(path.dirname(fn), ".config"));
	if (config.error) return { value: null, error: config.error };

	const lexer = new Lexer(fn, text, config);
	const { tokens, error } = lexer.makeToken();
	if (error) return { value: null, error };

	globalSymbolTable.set("package", JSONToNodes(config.package));
	globalSymbolTable.set("env", JSONToNodes(config.env));

	const parser = new Parser(tokens, config);
	const ast = parser.parse();
	if (ast.error) return { value: null, error: ast.error };

	const context = new Context("<program>");
	context.symbolTable = globalSymbolTable;

	const interpreter = new Interpreter(rootPath, config);
	const result = await interpreter.visit(ast.node, context);

	process.once("exit", () => {
		if (!result.error && isMain && config.rules.LOG_SPEED) {
			const stop = process.hrtime(start);
			const executionTime = (stop[0] * 1e9 + stop[1]) / 1e6;
			console.log(chalk.black(`\nExecuted in ${executionTime.toFixed(3)}ms.`));
		}
	});

	return result;
}
