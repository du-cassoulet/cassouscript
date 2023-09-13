import Token from "../Token.js";
import BaseNode from "./BaseNode.js";

class TypeNode extends BaseNode {
	/**
	 * @param {BaseNode} nodeElement
	 * @param {Token} typeTok
	 */
	constructor(nodeElement, typeTok) {
		super();

		this.nodeElement = nodeElement;
		this.typeTok = typeTok;

		if (this.nodeElement) {
			this.posStart = this.nodeElement.posStart;
			this.posEnd = this.nodeElement.posEnd;
		} else {
			this.posStart = this.typeTok.posStart;
			this.posEnd = this.typeTok.posEnd;
		}
	}
}

export default TypeNode;
