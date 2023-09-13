import Value from "./Value";
import chalk from "chalk";

export default class Void extends Value {
	public value: null | number;

	constructor(value: null | number) {
		super();
		this.value = value;
	}

	public copy() {
		const copy = new Void(this.value);
		copy.setPos(this.posStart, this.posEnd);
		copy.setContext(this.context);

		return copy;
	}

	public isTrue() {
		return false;
	}

	public toString() {
		return chalk.black(`${this.value}`);
	}
}
