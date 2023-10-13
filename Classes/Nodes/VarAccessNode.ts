import Token from "../Token";
import BaseNode from "./BaseNode";

export default class VarAccessNode extends BaseNode {
	public varNameTok: Token;
	public keys: (BaseNode | string)[];

	constructor(varNameTok: Token, keys: (BaseNode | string)[]) {
		super(varNameTok.posStart, varNameTok.posEnd);

		this.varNameTok = varNameTok;
		this.keys = keys;
	}
}
