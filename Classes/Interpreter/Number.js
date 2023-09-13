import Errors from "../Errors.js";
import Value from "./Value.js";
import List from "./List.js";
import Boolean from "./Boolean.js";
import String from "./String.js";

class Number extends Value {
	static pi = new Number(Math.PI);

	/**
	 * @param {number} value
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
		if (other instanceof Number) {
			return [
				new Number(this.value + other.value).setContext(this.context),
				null,
			];
		}
		if (other instanceof String) {
			return [
				new String(this.value + other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(this.posStart, this.posEnd)];
		}
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	subbedBy(other) {
		if (other instanceof Number) {
			return [
				new Number(this.value - other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(this.posStart, this.posEnd)];
		}
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	multedBy(other) {
		if (other instanceof Number) {
			return [
				new Number(this.value * other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(this.posStart, this.posEnd)];
		}
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	divedBy(other) {
		if (other instanceof Number) {
			if (other.value === 0) {
				return [
					null,
					new Errors.RTError(other.posStart, other.posEnd, "Division by zero"),
				];
			}

			return [
				new Number(this.value / other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(this.posStart, this.posEnd)];
		}
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	powedBy(other) {
		if (other instanceof Number) {
			return [
				new Number(this.value ** other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(this.posStart, this.posEnd)];
		}
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	moduledBy(other) {
		return [
			new Number(this.value % other.value).setContext(this.context),
			null,
		];
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	getComparisonEq(other) {
		if (other instanceof Number) {
			return [
				new Boolean(this.value === other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(this.posStart, this.posEnd)];
		}
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	getComparisonNe(other) {
		if (other instanceof Number) {
			return [
				new Boolean(this.value !== other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(this.posStart, this.posEnd)];
		}
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	getComparisonLt(other) {
		if (other instanceof Number) {
			return [
				new Boolean(this.value < other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(this.posStart, this.posEnd)];
		}
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	getComparisonGt(other) {
		if (other instanceof Number) {
			return [
				new Boolean(this.value > other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(this.posStart, this.posEnd)];
		}
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	getComparisonLte(other) {
		if (other instanceof Number) {
			return [
				new Boolean(this.value <= other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(this.posStart, this.posEnd)];
		}
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	getComparisonGte(other) {
		if (other instanceof Number) {
			return [
				new Boolean(this.value >= other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(this.posStart, this.posEnd)];
		}
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	andedBy(other) {
		if (other instanceof Number) {
			return [
				new Boolean(this.value && other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(this.posStart, this.posEnd)];
		}
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	oredBy(other) {
		if (other instanceof Number) {
			return [
				new Number(this.value || other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(this.posStart, this.posEnd)];
		}
	}

	notted() {
		return [new Boolean(!this.value).setContext(this.context), null];
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
		} else {
			return [null, this.illegalOperation(this.posStart, this.posEnd)];
		}
	}

	copy() {
		let copy = new Number(this.value);
		copy.setPos(this.posStart, this.posEnd);
		copy.setContext(this.context);
		return copy;
	}

	isTrue() {
		return this.value !== 0;
	}

	toString() {
		return this.value.toString().yellow;
	}
}

export default Number;
