import Token from "../Token";
import BaseNode from "./BaseNode";

export default class NumberNode extends BaseNode {
	public tok: Token;
	public keys: (BaseNode | string)[];

	constructor(tok: Token, keys: (BaseNode | string)[]) {
		super(tok.posStart, tok.posEnd);
		this.tok = tok;
		this.keys = keys;
	}
}
