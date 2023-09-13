import Errors from "./Errors.js";

class RTResult {
	constructor() {
		this.reset();
	}

	reset() {
		this.value = null;
		this.error = null;
		this.funcReturnValue = null;
		this.loopShouldContinue = false;
		this.loopShouldBreak = false;
	}

	/**
	 * To register an element in the Runtime Result.
	 * @param {RTResult} res
	 * @returns {any}
	 */
	register(res) {
		this.error = res.error;
		this.funcReturnValue = res.funcReturnValue;
		this.loopShouldContinue = res.loopShouldContinue;
		this.loopShouldBreak = res.loopShouldBreak;

		return res.value;
	}

	/**
	 * To end a task without error.
	 * @param {any} value
	 * @returns {RTResult}
	 */
	success(value) {
		this.reset();
		this.value = value;

		return this;
	}

	/**
	 * To end a task without error and by returning an element.
	 * @param {any} value
	 * @returns {RTResult}
	 */
	successReturn(value) {
		this.reset();
		this.funcReturnValue = value;

		return this;
	}

	successContinue() {
		this.reset();
		this.loopShouldContinue = true;

		return this;
	}

	successBreak() {
		this.reset();
		this.loopShouldBreak = true;
		return this;
	}

	/**
	 * To end a task with an error.
	 * @param {Errors.BaseError} error
	 * @returns {RTResult}
	 */
	failure(error) {
		this.reset();
		this.error = error;

		return this;
	}

	shouldReturn() {
		return (
			this.error ||
			this.funcReturnValue ||
			this.loopShouldContinue ||
			this.loopShouldBreak
		);
	}
}

export default RTResult;
