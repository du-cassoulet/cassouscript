import Token from "../Token.js";
import BaseNode from "./BaseNode.js";

class ForInNode extends BaseNode {
	/**
	 * @param {Token} varNameTok
	 * @param {BaseNode} startValueNode
	 * @param {BaseNode} endValueNode
	 * @param {BaseNode} stepValueNode
	 * @param {BaseNode} bodyNode
	 * @param {boolean} shouldReturnNull
	 */
	constructor(
		varNameTok,
		startValueNode,
		endValueNode,
		stepValueNode,
		bodyNode,
		shouldReturnNull
	) {
		super();

		this.varNameTok = varNameTok;
		this.startValueNode = startValueNode;
		this.endValueNode = endValueNode;
		this.stepValueNode = stepValueNode;
		this.bodyNode = bodyNode;
		this.shouldReturnNull = shouldReturnNull;

		this.posStart = this.varNameTok.posStart;
		this.posEnd = this.bodyNode.posEnd;
	}
}

export default ForInNode;
