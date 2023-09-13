import Value from "./Value";
import chalk from "chalk";

export default class Boolean extends Value {
	public value: boolean;

	constructor(value: boolean) {
		super();
		this.value = value;
	}

	public getComparisonEq(other: Value): any {
		if (other instanceof Boolean) {
			return [
				new Boolean(this.value === other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(other)];
		}
	}

	public getComparisonNe(other: Value): any {
		if (other instanceof Boolean) {
			return [
				new Boolean(this.value !== other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(other)];
		}
	}

	public getComparisonLt(other: Value): any {
		if (other instanceof Boolean) {
			return [
				new Boolean(this.value < other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(other)];
		}
	}

	public getComparisonGt(other: Value): any {
		if (other instanceof Boolean) {
			return [
				new Boolean(this.value > other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(other)];
		}
	}

	public getComparisonLte(other: Value): any {
		if (other instanceof Boolean) {
			return [
				new Boolean(this.value <= other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(other)];
		}
	}

	public getComparisonGte(other: Value): any {
		if (other instanceof Boolean) {
			return [
				new Boolean(this.value >= other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(other)];
		}
	}

	public andedBy(other: Value): any {
		if (other instanceof Boolean) {
			return [
				new Boolean(this.value && other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(other)];
		}
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	public oredBy(other: Value): any {
		if (other instanceof Boolean) {
			return [
				new Boolean(this.value || other.value).setContext(this.context),
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
		const copy = new Boolean(this.value);
		copy.setPos(this.posStart, this.posEnd);
		copy.setContext(this.context);

		return copy;
	}

	public isTrue() {
		return this.value;
	}

	public toString() {
		return chalk.yellow(this.value.toString());
	}
}
