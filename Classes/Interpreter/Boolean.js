import Value from "./Value.js";

class Boolean extends Value {
	/**
	 * @param {boolean} value
	 */
	constructor(value) {
		super();
		this.value = value;
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	getComparisonEq(other) {
		if (other instanceof Boolean) {
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
		if (other instanceof Boolean) {
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
		if (other instanceof Boolean) {
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
		if (other instanceof Boolean) {
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
		if (other instanceof Boolean) {
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
		if (other instanceof Boolean) {
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
		if (other instanceof Boolean) {
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
		if (other instanceof Boolean) {
			return [
				new Boolean(this.value || other.value).setContext(this.context),
				null,
			];
		} else {
			return [null, this.illegalOperation(this.posStart, this.posEnd)];
		}
	}

	notted() {
		return [new Boolean(!this.value).setContext(this.context), null];
	}

	copy() {
		let copy = new Boolean(this.value);
		copy.setPos(this.posStart, this.posEnd);
		copy.setContext(this.context);
		return copy;
	}

	isTrue() {
		return this.value;
	}

	toString() {
		return this.value.toString().yellow;
	}
}

export default Boolean;
