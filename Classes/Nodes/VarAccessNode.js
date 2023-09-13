import Token from "../Token.js";
import BaseNode from "./BaseNode.js";

class VarAccessNode extends BaseNode {
	/**
	 *
	 * @param {Token} varNameTok
	 * @param {string[]} path
	 * @param {Node} methodExpr
	 */
	constructor(varNameTok, path) {
		super();

		this.varNameTok = varNameTok;
		this.path = path;

		this.posStart = this.varNameTok.posStart;
		this.posEnd = this.path.posEnd;
	}
}

export default VarAccessNode;
