import Number from "./Number";
import Value from "./Value";
import Boolean from "./Boolean";
import chalk from "chalk";
import List from "./List";

export default class String extends Value {
	public static methods: { [key: string]: any } = {};

	public value: string;

	constructor(value: string) {
		super();
		this.value = value;
	}

	public addedTo(other: Value): any {
		if (other instanceof String) {
			return [
				new String(this.value + other.value).setContext(this.context),
				null,
			];
		} else if (other instanceof Number) {
			return [
				new String(this.value + other.value.toString()).setContext(
					this.context
				),
				null,
			];
		} else {
			return [null, this.illegalOperation(other)];
		}
	}

	public multedBy(other: Value): any {
		if (other instanceof Number) {
			return [
				new String(this.value.repeat(other.value)).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(other)];
		}
	}

	public getComparisonEq(other: Value): any {
		if (other instanceof String) {
			return [
				new Boolean(this.value === other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(other)];
		}
	}

	public getComparisonNe(other: Value): any {
		if (other instanceof String) {
			return [
				new Boolean(this.value !== other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(other)];
		}
	}

	public isIn(other: Value): any {
		if (other instanceof List) {
			return [
				new Boolean(
					other.elements.some((e) => e.getComparisonEq(this))
				).setContext(this.context),
				null,
			];
		} else if (other instanceof String) {
			return [
				new Boolean(other.value.includes(this.value)).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(other)];
		}
	}

	public isTrue() {
		return this.value.length > 0;
	}

	public copy() {
		const copy = new String(this.value);
		copy.setPos(this.posStart, this.posEnd);
		copy.setContext(this.context);

		return copy;
	}

	public toString(tabNum: number = 0) {
		if (tabNum === 0) {
			return this.value;
		} else {
			return chalk.green(`"${this.value}"`);
		}
	}
}
