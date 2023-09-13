import Token from "../Token.js";
import BaseNode from "./BaseNode.js";

class FuncDefNode extends BaseNode {
	/**
	 * @param {Token} varNameTok
	 * @param {Token[]} argNameToks
	 * @param {BaseNode} bodyNode
	 * @param {Token} typeTok
	 * @param {boolean} shouldAutoReturn
	 */
	constructor(varNameTok, argNameToks, bodyNode, typeTok, shouldAutoReturn) {
		super();

		this.varNameTok = varNameTok;
		this.argNameToks = argNameToks;
		this.bodyNode = bodyNode;
		this.typeTok = typeTok;
		this.shouldAutoReturn = shouldAutoReturn;

		if (this.varNameTok) {
			this.posStart = this.varNameTok.posStart;
		} else if (this.argNameToks.length > 0) {
			this.posStart = this.argNameToks[0].posStart;
		} else {
			this.posStart = this.bodyNode.posStart;
		}

		this.posEnd = this.bodyNode.posEnd;
	}
}

export default FuncDefNode;
