import { getattr } from "../../utils";
import RTResult from "../RTResult";
import BaseFunction from "./BaseFunction";
import Void from "./Void";
import Context from "../Context";
import Value from "./Value";

export default class BuiltInFunction extends BaseFunction {
	static log = new BuiltInFunction("log");

	public args_log: string[];

	constructor(name: string) {
		super(name);

		this.args_log = ["value"];
	}

	// @ts-ignore
	public execute(args: Value[]) {
		const res = new RTResult();
		const execCtx = this.generateNewContext();

		const methodName = `execute_${this.name}`;
		const methodArgs = `args_${this.name}`;
		const method = getattr(this, methodName, this.noVisitMethod);

		// @ts-ignore
		res.register(this.checkAndPopulateArgs(this[methodArgs], args, execCtx));
		if (res.shouldReturn()) return res;

		const returnValue = res.register(method(execCtx));
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
		return `<built-in function ${this.name}>`;
	}

	public execute_log(execCtx: Context) {
		console.log(execCtx.symbolTable?.get("value").toString());
		return new RTResult().success(new Void(null));
	}
}
