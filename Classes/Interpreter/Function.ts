import chalk from "chalk";
import Interpreter from "../Interpreter";
import BaseNode from "../Nodes/BaseNode";
import RTResult from "../RTResult";
import BaseFunction from "./BaseFunction";
import Value from "./Value";
import Void from "./Void";
import Config from "../Config";

export default class Function extends BaseFunction {
	public bodyNode: BaseNode;
	public argNames: string[];
	public shouldAutoReturn: boolean;
	public rootPath: string;
	public config: Config;

	constructor(
		name: string,
		bodyNode: BaseNode,
		argNames: string[],
		shouldAutoReturn: boolean,
		rootPath: string,
		config: Config
	) {
		super(name);

		this.bodyNode = bodyNode;
		this.argNames = argNames;
		this.shouldAutoReturn = shouldAutoReturn;
		this.rootPath = rootPath;
		this.config = config;
	}

	// @ts-ignore
	public async execute(args: Value[]): any {
		const res = new RTResult();
		const interpreter = new Interpreter(this.rootPath, this.config);
		const execCtx = this.generateNewContext();

		res.register(this.checkAndPopulateArgs(this.argNames, args, execCtx));
		if (res.shouldReturn()) return res;

		const value = res.register(await interpreter.visit(this.bodyNode, execCtx));
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
			this.shouldAutoReturn,
			this.rootPath,
			this.config
		);

		copy.setContext(this.context);
		copy.setPos(this.posStart, this.posEnd);

		return copy;
	}

	public toString() {
		return chalk.blue(`<function ${this.name}>`);
	}
}
