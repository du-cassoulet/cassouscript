import Context from "../Context.js";
import Errors from "../Errors.js";
import Position from "../Position.js";

class Value {
	constructor() {
		this.setPos();
		this.setContext();
	}

	/**
	 * To define the value's position
	 * @param {Position | null} posStart
	 * @param {Position | null} posEnd
	 * @returns {Value}
	 */
	setPos(posStart = null, posEnd = null) {
		this.posStart = posStart;
		this.posEnd = posEnd;
		return this;
	}

	/**
	 * To define the value's context.
	 * @param {Context} context
	 * @returns {Value}
	 */
	setContext(context) {
		this.context = context;
		return this;
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	addedTo(other) {
		return [null, this.illegalOperation(other)];
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	subbedBy(other) {
		return [null, this.illegalOperation(other)];
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	multedBy(other) {
		return [null, this.illegalOperation(other)];
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	divedBy(other) {
		return [null, this.illegalOperation(other)];
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	powedBy(other) {
		return [null, this.illegalOperation(other)];
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	moduledBy(other) {
		return [null, this.illegalOperation(other)];
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	getComparisonEq(other) {
		return [null, this.illegalOperation(other)];
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	getComparisonNe(other) {
		return [null, this.illegalOperation(other)];
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	getComparisonLt(other) {
		return [null, this.illegalOperation(other)];
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	getComparisonGt(other) {
		return [null, this.illegalOperation(other)];
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	getComparisonLte(other) {
		return [null, this.illegalOperation(other)];
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	getComparisonGte(other) {
		return [null, this.illegalOperation(other)];
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	andedBy(other) {
		return [null, this.illegalOperation(other)];
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	oredBy(other) {
		return [null, this.illegalOperation(other)];
	}

	notted() {
		return [null, this.illegalOperation()];
	}

	execute() {
		return [null, this.illegalOperation()];
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	isIn(other) {
		return [null, this.illegalOperation(other)];
	}

	copy() {
		throw new Error("No copy method defined");
	}

	isTrue() {
		return true;
	}

	/**
	 * @param {Value | null} other
	 * @returns {Errors.InvalidSyntaxError}
	 */
	illegalOperation(other = null) {
		if (!other) other = this;
		return new Errors.InvalidSyntaxError(
			this.posStart,
			this.posEnd,
			"Illegal operation",
			this.context
		);
	}
}

export default Value;
