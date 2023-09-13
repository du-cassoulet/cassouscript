import Position from "../Position.js";
import BaseNode from "./BaseNode.js";

class ReturnNode extends BaseNode {
	/**
	 * @param {BaseNode} nodeToReturn
	 * @param {Position} posStart
	 * @param {Position} posEnd
	 */
	constructor(nodeToReturn, posStart, posEnd) {
		super();

		this.nodeToReturn = nodeToReturn;

		this.posStart = posStart;
		this.posEnd = posEnd;
	}
}

export default ReturnNode;
