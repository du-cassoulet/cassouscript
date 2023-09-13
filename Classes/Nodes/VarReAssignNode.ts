import Token from "../Token";
import BaseNode from "./BaseNode";

export default class VarReAssignNode extends BaseNode {
	public varNameTok: Token;
	public newValueNode: BaseNode;

	constructor(varNameTok: Token, newValueNode: BaseNode) {
		super(varNameTok.posStart, newValueNode.posEnd);

		this.varNameTok = varNameTok;
		this.newValueNode = newValueNode;
	}
}
