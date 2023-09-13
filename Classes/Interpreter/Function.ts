import Interpreter from "../Interpreter";
import BaseNode from "../Nodes/BaseNode";
import RTResult from "../RTResult";
import BaseFunction from "./BaseFunction";
import Value from "./Value";
import Void from "./Void";

export default class Function extends BaseFunction {
	public bodyNode: BaseNode;
	public argNames: string[];
	public shouldAutoReturn: boolean;

	constructor(
		name: string,
		bodyNode: BaseNode,
		argNames: string[],
		shouldAutoReturn: boolean
	) {
		super(name);

		this.bodyNode = bodyNode;
		this.argNames = argNames;
		this.shouldAutoReturn = shouldAutoReturn;
	}

	// @ts-ignore
	public execute(args: Value[]): any {
		const res = new RTResult();
		const interpreter = new Interpreter();
		const execCtx = this.generateNewContext();

		res.register(this.checkAndPopulateArgs(this.argNames, args, execCtx));
		if (res.shouldReturn()) return res;

		const value = res.register(interpreter.visit(this.bodyNode, execCtx));
		if (res.shouldReturn() && res.funcReturnValue === null) return res;

		const retValue =
			(this.shouldAutoReturn ? value : null) ||
			res.funcReturnValue ||
			new Void(null);

		return res.success(retValue);
	}

	public copy() {
		const copy = new Function(
			this.name,
			this.bodyNode,
			this.argNames,
			this.shouldAutoReturn
		);

		copy.setContext(this.context);
		copy.setPos(this.posStart, this.posEnd);

		return copy;
	}

	public toString() {
		return `<function ${this.name}>`;
	}
}
