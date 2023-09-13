import Token from "../Token.js";
import BaseNode from "./BaseNode.js";

class EntryNode extends BaseNode {
	/**
	 * @param {Token} keyTok
	 * @param {BaseNode} valueNode
	 */
	constructor(keyTok, valueNode) {
		super();

		this.keyTok = keyTok;
		this.valueNode = valueNode;

		this.posStart = this.keyTok.posStart;
		this.posEnd = this.valueNode.posEnd;
	}
}

export default EntryNode;
