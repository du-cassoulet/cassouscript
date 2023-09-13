import Position from "../Position.js";
import BaseNode from "./BaseNode.js";

class ListNode extends BaseNode {
	/**
	 * @param {BaseNode[]} elementNodes
	 * @param {Position} posStart
	 * @param {Position} posEnd
	 */
	constructor(elementNodes, posStart, posEnd) {
		super();

		this.elementNodes = elementNodes;

		this.posStart = posStart;
		this.posEnd = posEnd;
	}
}

export default ListNode;
