import Interpreter from "../Interpreter";
import BaseNode from "../Nodes/BaseNode";
import RTResult from "../RTResult";
import BaseFunction from "./BaseFunction";
import Value from "./Value";
import Void from "./Void";

class Function extends BaseFunction {
	/**
	 * @param {string} name
	 * @param {BaseNode} bodyNode
	 * @param {string[]} argNames
	 * @param {string} typeTok
	 * @param {boolean} shouldAutoReturn
	 */
	constructor(name, bodyNode, argNames, type, shouldAutoReturn) {
		super(name);

		this.bodyNode = bodyNode;
		this.argNames = argNames;
		this.type = type;
		this.shouldAutoReturn = shouldAutoReturn;
	}

	/**
	 * @param {Value} args
	 * @returns {RTResult}
	 */
	execute(args) {
		let res = new RTResult();
		let interpreter = new Interpreter();
		let execCtx = this.generateNewContext();

		res.register(this.checkAndPopulateArgs(this.argNames, args, execCtx));
		if (res.shouldReturn()) return res;

		let value = res.register(interpreter.visit(this.bodyNode, execCtx));
		if (res.shouldReturn() && res.funcReturnValue === null) return res;

		let retValue =
			(this.shouldAutoReturn ? value : null) ||
			res.funcReturnValue ||
			new Void(null);

		return res.success(retValue);
	}

	copy() {
		let copy = new Function(
			this.name,
			this.bodyNode,
			this.argNames,
			this.type,
			this.shouldAutoReturn
		);

		copy.setContext(this.context);
		copy.setPos(this.posStart, this.posEnd);
		return copy;
	}

	toString() {
		return `<function ${this.name}${
			this.type ? `for the type '${this.type}'` : ""
		}>`.cyan;
	}
}

export default Function;
