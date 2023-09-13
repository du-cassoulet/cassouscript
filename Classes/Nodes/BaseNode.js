import Position from "../Position.js";

class BaseNode {
	/**
	 * The basic node constructor.
	 * @param {Position} posStart
	 * @param {Position} posEnd
	 */
	constructor(posStart, posEnd) {
		this.posStart = posStart;
		this.posEnd = posEnd;
	}
}

export default BaseNode;
