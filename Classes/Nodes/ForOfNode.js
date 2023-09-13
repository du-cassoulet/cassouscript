import Token from "../Token.js";
import BaseNode from "./BaseNode.js";

class ForOfNode extends BaseNode {
	/**
	 * @param {Token} varNameTok
	 * @param {BaseNode} listNode
	 * @param {BaseNode} bodyNode
	 * @param {boolean} shouldReturnNull
	 */
	constructor(varNameTok, listNode, bodyNode, shouldReturnNull) {
		super();

		this.varNameTok = varNameTok;
		this.listNode = listNode;
		this.bodyNode = bodyNode;
		this.shouldReturnNull = shouldReturnNull;

		this.posStart = this.varNameTok.posStart;
		this.posEnd = this.bodyNode.posEnd;
	}
}

export default ForOfNode;
