import Position from "../Position";
import BaseNode from "./BaseNode";

class BreakNode extends BaseNode {
	/**
	 *
	 * @param {Position} posStart
	 * @param {Position} posEnd
	 */
	constructor(posStart, posEnd) {
		super();

		this.posStart = posStart;
		this.posEnd = posEnd;
	}
}

export default BreakNode;
