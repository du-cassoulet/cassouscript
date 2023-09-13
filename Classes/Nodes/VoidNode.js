import Token from "../Token.js";
import BaseNode from "./BaseNode.js";

class VoidNode extends BaseNode {
	/**
	 * @param {Token} tok
	 */
	constructor(tok) {
		super();

		this.tok = tok;

		this.posStart = this.tok.posStart;
		this.posEnd = this.tok.posEnd;
	}
}

export default VoidNode;
