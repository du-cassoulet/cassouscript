import BaseNode from "./BaseNode.js";

class WhileNode extends BaseNode {
	/**
	 * @param {BaseNode} conditionNode
	 * @param {BaseNode} bodyNode
	 * @param {boolean} shouldReturnNull
	 */
	constructor(conditionNode, bodyNode, shouldReturnNull) {
		super();

		this.conditionNode = conditionNode;
		this.bodyNode = bodyNode;
		this.shouldReturnNull = shouldReturnNull;

		this.posStart = this.conditionNode.posStart;
		this.posEnd = this.bodyNode.posEnd;
	}
}

export default WhileNode;
