import Context from "../Context";
import RTResult from "../RTResult";
import SymbolTable from "../SymbolTable";
import Value from "./Value";
import { RTError } from "../Errors";
import Position from "../Position";

export default class BaseFunction extends Value {
	public name: string;
	public context: Context | null = null;
	public posStart: Position | null = null;
	public posEnd: Position | null = null;

	constructor(name: string) {
		super();
		this.name = name || "anonymous";
	}

	public generateNewContext() {
		const newContext = new Context(this.name, this.context, this.posStart);
		newContext.symbolTable = new SymbolTable(
			newContext.parent?.symbolTable ?? null
		);

		return newContext;
	}

	public checkArgs(argNames: string[], args: Value[]) {
		const res = new RTResult();

		if (args.length > argNames.length) {
			return res.failure(
				new RTError(
					<Position>this.posStart,
					<Position>this.posEnd,
					`${args.length - argNames.length} too many args passed into '${
						this.name
					}'`,
					<Context>this.context
				)
			);
		}

		if (args.length < argNames.length) {
			return res.failure(
				new RTError(
					<Position>this.posStart,
					<Position>this.posEnd,
					`${argNames.length - args.length} too few args passed into '${
						this.name
					}'`,
					<Context>this.context
				)
			);
		}

		return res.success(null);
	}

	public populateArgs(argNames: string[], args: Value[], execCtx: Context) {
		for (const i in args) {
			const argName = argNames[i];
			const argValue = args[i];

			argValue.setContext(execCtx);
			execCtx.symbolTable?.set(argName, argValue);
		}
	}

	public checkAndPopulateArgs(
		argNames: string[],
		args: Value[],
		execCtx: Context
	) {
		const res = new RTResult();
		res.register(this.checkArgs(argNames, args));
		if (res.shouldReturn()) return res;

		this.populateArgs(argNames, args, execCtx);
		return res.success(null);
	}
}
