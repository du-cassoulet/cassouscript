import Position from "./Position.js";

class Token {
	/**
	 * A token and it's value and type.
	 * @param {string} _type
	 * @param {string} value
	 * @param {Position} posStart
	 * @param {Position} posEnd
	 */
	constructor(_type, value = null, posStart = null, posEnd = null) {
		this.type = _type;
		this.value = value;

		if (posStart !== null) {
			this.posStart = posStart.copy();
			this.posEnd = posStart.copy();
			this.posEnd.advance();
		}

		if (posEnd !== null) {
			this.posEnd = posEnd;
		}
	}

	/**
	 * To see if a value matches with it's type.
	 * @param {string} _type
	 * @param {string} value
	 * @returns {boolean}
	 */
	matches(_type, value) {
		return this.type === _type && this.value === value;
	}

	toString() {
		if (this.value) {
			return `${this.type}:${this.value}`;
		}
		return `${this.type}`;
	}
}

export default Token;
