import Value from "./Value.js";

class Promise extends Value {
	/**
	 * @param {Promise} value
	 */
	constructor(value) {
		super();
		this.value = value;
	}

	copy() {
		let copy = new Promise(this.value);
		copy.setPos(this.posStart, this.posEnd);
		copy.setContext(this.context);
		return copy;
	}

	toString() {
		return `Promise ${"<pending>".cyan}`;
	}
}

export default Promise;
