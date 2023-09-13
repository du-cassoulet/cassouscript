import Token from "../Token";
import BaseNode from "./BaseNode";

export default class VarAssignNode extends BaseNode {
	public varNameTok: Token;
	public valueNode: BaseNode;

	constructor(varNameTok: Token, valueNode: BaseNode) {
		super(varNameTok.posStart, valueNode.posEnd);

		this.varNameTok = varNameTok;
		this.valueNode = valueNode;
	}
}
