import Number from "./Number.js";
import Value from "./Value.js";
import List from "./List.js";
import Boolean from "./Boolean.js";

class String extends Value {
	/**
	 * @param {string} value
	 */
	constructor(value) {
		super();
		this.value = value;
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	addedTo(other) {
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
			return [null, this.illegalOperation(this.addedTo, other)];
		}
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	multedBy(other) {
		if (other instanceof Number) {
			return [
				new String(this.value.repeat(other.value)).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(this.addedTo, other)];
		}
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	getComparisonEq(other) {
		if (other instanceof String) {
			return [
				new Boolean(this.value === other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(this.addedTo, other)];
		}
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	getComparisonNe(other) {
		if (other instanceof String) {
			return [
				new Boolean(this.value !== other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(this.addedTo, other)];
		}
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	isIn(other) {
		if (other instanceof List) {
			let includes = !!other.elements.find(
				(e) =>
					this.constructor.name === e.constructor.name && this.value === e.value
			);
			return [new Boolean(includes), null];
		} else if (other instanceof String) {
			return [new Boolean(other.value.includes(this.value)), null];
		} else if (other instanceof Object) {
			let includes = !!other.elements.find(
				(e) =>
					this.constructor.name === e.elements[0].constructor.name &&
					this.value === e.elements[0].value
			);
			return [new Boolean(includes), null];
		} else {
			return [null, this.illegalOperation(this.posStart, this.posEnd)];
		}
	}

	isTrue() {
		return this.value.length > 0;
	}

	copy() {
		let copy = new String(this.value);
		copy.setPos(this.posStart, this.posEnd);
		copy.setContext(this.context);
		return copy;
	}

	toString(tabNum) {
		if (!tabNum) {
			return this.value.toString();
		} else {
			return `'${this.value}'`.green;
		}
	}
}

export default String;
