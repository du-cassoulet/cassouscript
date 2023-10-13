import { getattr } from "../../utils";
import RTResult from "../RTResult";
import BaseFunction from "./BaseFunction";
import Void from "./Void";
import Context from "../Context";
import Value from "./Value";
import { TypingError } from "../Errors";
import Position from "../Position";
import String from "./String";
import chalk from "chalk";

export default class BuiltInFunction extends BaseFunction {
	public static log = new BuiltInFunction("log");
	public static ask = new BuiltInFunction("ask");

	public args_log: string[];
	public args_ask: string[];

	constructor(name: string) {
		super(name);

		this.args_log = ["value"];
		this.args_ask = ["value"];
	}

	// @ts-ignore
	public async execute(args: Value[]) {
		const res = new RTResult();
		const execCtx = this.generateNewContext();

		const methodName = `execute_${this.name}`;
		const methodArgs = `args_${this.name}`;
		const method = getattr(<{}>this, methodName, this.noVisitMethod);

		// @ts-ignore
		res.register(this.checkAndPopulateArgs(this[methodArgs], args, execCtx));
		if (res.shouldReturn()) return res;

		const returnValue = res.register(await method(execCtx));
		if (res.shouldReturn()) return res;
		return res.success(returnValue);
	}

	public noVisitMethod() {
		throw new Error(`No execute_${this.name} method defined`);
	}

	public copy() {
		const copy = new BuiltInFunction(this.name);
		copy.setContext(this.context);
		copy.setPos(this.posStart, this.posEnd);

		return copy;
	}

	public toString() {
		return chalk.blue(`<built-in function ${this.name}>`);
	}

	public execute_log(execCtx: Context) {
		console.log(execCtx.symbolTable?.get("value").toString());
		return new RTResult().success(new Void(null));
	}

	public async execute_ask(execCtx: Context) {
		const res = new RTResult();
		const value = execCtx.symbolTable?.get("value");

		if (!(value instanceof String)) {
			return res.failure(
				new TypingError(
					<Position>this.posStart,
					<Position>this.posEnd,
					`'ask' function can only work with strings, not ${value?.type}`
				)
			);
		}

		let response = "";
		process.stdout.write(value.value);
		for await (const line of console) {
			response = line;
			break;
		}

		return res.success(new String(response));
	}
}
