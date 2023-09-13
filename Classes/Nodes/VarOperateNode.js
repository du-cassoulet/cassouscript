import Token from "../Token.js";
import BaseNode from "./BaseNode.js";

class VarOperateNode extends BaseNode {
	/**
	 *
	 * @param {Token} varNameTok
	 * @param {string[]} path
	 * @param {Token} operatorTok
	 * @param {BaseNode} newValueNode
	 */
	constructor(varNameTok, path, operatorTok, newValueNode) {
		super();

		this.varNameTok = varNameTok;
		this.path = path;
		this.operatorTok = operatorTok;
		this.newValueNode = newValueNode;

		this.posStart = this.varNameTok.posStart;
		this.posEnd = this.newValueNode.posEnd;
	}
}

export default VarOperateNode;
