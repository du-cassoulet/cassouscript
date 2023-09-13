import Position from "../Position.js";
import BaseNode from "./BaseNode.js";

class ContinueNode extends BaseNode {
	/**
	 * @param {Position} posStart
	 * @param {Position} posEnd
	 */
	constructor(posStart, posEnd) {
		super();

		this.posStart = posStart;
		this.posEnd = posEnd;
	}
}

export default ContinueNode;
