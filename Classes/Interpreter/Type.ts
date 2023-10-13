import chalk from "chalk";
import Value from "./Value";
import { InvalidSyntaxError } from "../Errors";
import Boolean from "./Boolean";

export default class Type extends Value {
	public value: string;

	constructor(value: string) {
		super();
		this.value = value;
	}

	public getComparisonEq(other: Value): any {
		if (other instanceof Type) {
			return [new Boolean(this.value === other.value), null];
		} else {
			return [null, this.illegalOperation(other)];
		}
	}

	public copy() {
		const copy = new Type(this.value);
		copy.setPos(this.posStart, this.posEnd);
		copy.setContext(this.context);

		return copy;
	}

	public isTrue() {
		return false;
	}

	public toString() {
		return chalk.cyan(this.value);
	}
}
