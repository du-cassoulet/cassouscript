import Value from "./Value.js";

class Type extends Value {
	static pi = new Number(Math.PI);

	/**
	 * @param {string} value
	 */
	constructor(value) {
		super();
		this.value = value;
	}

	copy() {
		let copy = new Type(this.value);
		copy.setPos(this.posStart, this.posEnd);
		copy.setContext(this.context);
		return copy;
	}

	toString() {
		return `[${this.value}]`.cyan;
	}
}

export default Type;
