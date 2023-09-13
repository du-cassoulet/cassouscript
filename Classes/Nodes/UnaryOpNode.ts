import Token from "../Token";
import BaseNode from "./BaseNode";

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
