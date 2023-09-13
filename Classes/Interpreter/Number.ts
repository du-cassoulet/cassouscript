import { RTError } from "../Errors";
import Value from "./Value";
import Boolean from "./Boolean";
import String from "./String";
import Position from "../Position";
import Context from "../Context";
import chalk from "chalk";

export default class Number extends Value {
	public value: number;
	static pi = new Number(Math.PI);

	constructor(value: number) {
		super();
		this.value = value;
	}

	public addedTo(other: Value): any {
		if (other instanceof Number) {
			return [
				new Number(this.value + other.value).setContext(this.context),
				null,
			];
		} else if (other instanceof String) {
			return [
				new String(this.value + other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(other)];
		}
	}

	public subbedBy(other: Value): any {
		if (other instanceof Number) {
			return [
				new Number(this.value - other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(other)];
		}
	}

	public multedBy(other: Value): any {
		if (other instanceof Number) {
			return [
				new Number(this.value * other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(other)];
		}
	}

	public divedBy(other: Value): any {
		if (other instanceof Number) {
			if (other.value === 0) {
				return [
					null,
					new RTError(
						<Position>other.posStart,
						<Position>other.posEnd,
						"Division by zero",
						<Context>this.context
					),
				];
			}

			return [
				new Number(this.value / other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(other)];
		}
	}

	public powedBy(other: Value): any {
		if (other instanceof Number) {
			return [
				new Number(this.value ** other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(other)];
		}
	}

	public moduledBy(other: Value): any {
		if (other instanceof Number) {
			return [
				new Number(this.value % other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(other)];
		}
	}

	public getComparisonEq(other: Value): any {
		if (other instanceof Number) {
			return [
				new Boolean(this.value === other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(other)];
		}
	}

	public getComparisonNe(other: Value): any {
		if (other instanceof Number) {
			return [
				new Boolean(this.value !== other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(other)];
		}
	}

	public getComparisonLt(other: Value): any {
		if (other instanceof Number) {
			return [
				new Boolean(this.value < other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(other)];
		}
	}

	public getComparisonGt(other: Value): any {
		if (other instanceof Number) {
			return [
				new Boolean(this.value > other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(other)];
		}
	}

	public getComparisonLte(other: Value): any {
		if (other instanceof Number) {
			return [
				new Boolean(this.value <= other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(other)];
		}
	}

	public getComparisonGte(other: Value): any {
		if (other instanceof Number) {
			return [
				new Boolean(this.value >= other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(other)];
		}
	}

	public oredBy(other: Value): any {
		if (other instanceof Number) {
			return [
				new Number(this.value || other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(other)];
		}
	}

	public notted(): any {
		return [new Boolean(!this.value).setContext(this.context), null];
	}

	public copy() {
		const copy = new Number(this.value);
		copy.setPos(this.posStart, this.posEnd);
		copy.setContext(this.context);

		return copy;
	}

	public isTrue() {
		return this.value !== 0;
	}

	public toString() {
		return chalk.yellow(this.value.toString());
	}
}
