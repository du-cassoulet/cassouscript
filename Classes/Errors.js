import Position from "./Position.js";

class Error {
	/**
	 * The default error parameters
	 * @param {Position} posStart
	 * @param {Position} posEnd
	 * @param {string} errorName
	 * @param {string} details
	 */
	constructor(posStart, posEnd, errorName, details) {
		this.posStart = posStart;
		this.posEnd = posEnd;
		this.errorName = errorName;
		this.details = details;
	}

	asString() {
		let result = `${this.errorName}: ${this.details}\nFile ${
			this.posStart.fn
		}, line ${this.posStart.ln + 1}`;
		return result;
	}
}

class IllegalCharError extends Error {
	/**
	 * The constructor for the 'Illegal Character Error' Error.
	 * @param {Position} posStart
	 * @param {Position} posEnd
	 * @param {string} details
	 */
	constructor(posStart, posEnd, details) {
		super(posStart, posEnd, "Illegal Character", details);
	}
}

class InvalidSyntaxError extends Error {
	/**
	 * The constructor for the 'Invalid Syntax' Error.
	 * @param {Position} posStart
	 * @param {Position} posEnd
	 * @param {string} details
	 */
	constructor(posStart, posEnd, details) {
		super(posStart, posEnd, "Invalid Syntax", details);
	}
}

class ExpectedCharError extends Error {
	/**
	 * The constructor for the 'Expected Character' Error.
	 * @param {Position} posStart
	 * @param {Position} posEnd
	 * @param {string} details
	 */
	constructor(posStart, posEnd, details) {
		super(posStart, posEnd, "Expected Character", details);
	}
}

class TypingError extends Error {
	/**
	 * The constructor for the 'Typing Error' Error.
	 * @param {Position} posStart
	 * @param {Position} posEnd
	 * @param {string} details
	 */
	constructor(posStart, posEnd, details) {
		super(posStart, posEnd, "Typing Error", details);
	}
}

class RTError extends Error {
	/**
	 * The constructor for the 'Runtime Error' Error.
	 * @param {Position} posStart
	 * @param {Position} posEnd
	 * @param {string} details
	 */
	constructor(posStart, posEnd, details, context) {
		super(posStart, posEnd, "Runtime Error", details);
		this.context = context;
	}

	asString() {
		let result = `${this.generateTraceback()}${this.errorName}: ${
			this.details
		}\nFile ${this.posStart.fn}, line ${this.posStart.ln + 1}`;
		return result;
	}

	generateTraceback() {
		let result = "";
		let pos = this.posStart;
		let ctx = this.context;

		while (ctx) {
			result +=
				`  ${this.errorName}: ${this.details}, in ${ctx.displayName}\n  ` +
				result;
			pos = ctx.parentEntryPos;
			ctx = ctx.parent;
		}

		return "Traceback (most recent call last):\n" + result;
	}
}

export default {
	BaseError: Error,
	IllegalCharError,
	InvalidSyntaxError,
	RTError,
	ExpectedCharError,
	TypingError,
};
