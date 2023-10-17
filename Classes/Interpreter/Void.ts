import Boolean from "./Boolean";
import List from "./List";
import Value from "./Value";
import chalk from "chalk";

export default class Void extends Value {
	public static methods: { [key: string]: any } = {};

	public value: null | number;

	constructor(value: null | number) {
		super();
		this.value = value;
	}

	public isIn(other: Value): any {
		if (other instanceof List) {
			return [
				new Boolean(
					other.elements.some((e) => e.getComparisonEq(this))
				).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(other)];
		}
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
