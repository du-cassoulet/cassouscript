import Value from "./Value.js";

class Void extends Value {
	/**
	 * @param {void} value
	 */
	constructor(value) {
		super();
		this.value = value;
	}

	copy() {
		let copy = new Void(this.value);
		copy.setPos(this.posStart, this.posEnd);
		copy.setContext(this.context);
		return copy;
	}

	isTrue() {
		return false;
	}

	toString() {
		return `${this.value}`.gray;
	}
}

export default Void;
