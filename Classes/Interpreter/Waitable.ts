import Value from "./Value";
import chalk from "chalk";

export default class Waitable extends Value {
	public value: any;

	constructor(value: any) {
		super();
		this.value = value;
	}

	public copy() {
		return new Waitable(this.value)
			.setContext(this.context)
			.setPos(this.posStart, this.posEnd);
	}

	public toString() {
		return chalk.cyan("<waitable>");
	}
}
