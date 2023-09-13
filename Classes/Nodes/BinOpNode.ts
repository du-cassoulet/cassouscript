import BaseNode from "./BaseNode";
import Token from "../Token";

export default class BinOpNode extends BaseNode {
	public leftNode: BaseNode;
	public opTok: Token;
	public rightNode: BaseNode;

	constructor(leftNode: BaseNode, opTok: Token, rightNode: BaseNode) {
		super(leftNode.posStart, rightNode.posEnd);

		this.leftNode = leftNode;
		this.opTok = opTok;
		this.rightNode = rightNode;
	}
}
