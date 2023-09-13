import Token from "../Token";
import BaseNode from "./BaseNode";

class VarAssignNode extends BaseNode {
	/**
	 * @param {Token} varNameTok
	 * @param {BaseNode} valueNode
	 */
	constructor(varNameTok, valueNode) {
		super();

		this.varNameTok = varNameTok;
		this.valueNode = valueNode;

		this.posStart = this.varNameTok.posStart;
		this.posEnd = this.valueNode.posEnd;
	}
}

export default VarAssignNode;
