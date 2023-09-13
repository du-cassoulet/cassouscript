import Token from "../Token.js";
import BaseNode from "./BaseNode.js";

class BooleanNode extends BaseNode {
	/**
	 * @param {Token} tok
	 */
	constructor(tok) {
		super();

		this.tok = tok;

		this.posStart = this.tok.posStart;
		this.posEnd = this.tok.posEnd;
	}

	toString() {
		return `${this.tok}`;
	}
}

export default BooleanNode;
