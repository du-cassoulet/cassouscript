import Token from "../Token";
import BaseNode from "./BaseNode";

export default class VarReAssignNode extends BaseNode {
	public varNameTok: Token;
	public newValueNode: BaseNode;
	public assignTok: Token;
	public keys: (BaseNode | string)[];

	constructor(
		varNameTok: Token,
		newValueNode: BaseNode,
		assignTok: Token,
		keys: (BaseNode | string)[]
	) {
		super(varNameTok.posStart, newValueNode.posEnd);

		this.varNameTok = varNameTok;
		this.newValueNode = newValueNode;
		this.assignTok = assignTok;
		this.keys = keys;
	}
}
