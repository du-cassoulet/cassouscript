import Token from "../Token.js";
import BaseNode from "./BaseNode.js";

class UnaryOpNode extends BaseNode {
	/**
	 * @param {Token} opTok
	 * @param {BaseNode} node
	 */
	constructor(opTok, node) {
		super();

		this.opTok = opTok;
		this.node = node;

		this.posStart = this.opTok.posStart;
		this.posEnd = node.posEnd;
	}
}

export default UnaryOpNode;
