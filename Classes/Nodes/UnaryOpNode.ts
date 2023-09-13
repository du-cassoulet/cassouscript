import Token from "../Token";
import BaseNode from "./BaseNode";

export default class UnaryOpNode extends BaseNode {
	public opTok: Token;
	public node: BaseNode;

	constructor(opTok: Token, node: BaseNode) {
		super(opTok.posStart, node.posEnd);

		this.opTok = opTok;
		this.node = node;
	}
}
