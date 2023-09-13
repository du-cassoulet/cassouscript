import Token from "../Token.js";
import BaseNode from "./BaseNode.js";

class VarReAssignNode extends BaseNode {
	/**
	 *
	 * @param {Token} varNameTok
	 * @param {string[]} path
	 * @param {BaseNode} newValueNode
	 */
	constructor(varNameTok, path, newValueNode) {
		super();

		this.varNameTok = varNameTok;
		this.path = path;
		this.newValueNode = newValueNode;

		this.posStart = this.varNameTok.posStart;
		this.posEnd = this.newValueNode.posEnd;
	}
}

export default VarReAssignNode;
