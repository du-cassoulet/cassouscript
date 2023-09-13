import BaseNode from "./BaseNode.js";
import Token from "../Token.js";

class BinOpNode extends BaseNode {
	/**
	 * @param {BaseNode} leftNode
	 * @param {Token} opTok
	 * @param {BaseNode} rightNode
	 */
	constructor(leftNode, opTok, rightNode) {
		super();

		this.leftNode = leftNode;
		this.opTok = opTok;
		this.rightNode = rightNode;

		this.posStart = this.leftNode.posStart;
		this.posEnd = this.rightNode.posEnd;
	}

	toString() {
		return `(${this.leftNode}, ${this.opTok}, ${this.rightNode})`;
	}
}

export default BinOpNode;
