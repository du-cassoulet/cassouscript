import Token from "../Token";
import BaseNode from "./BaseNode";

export default class StringNode extends BaseNode {
	public tok: Token;

	constructor(tok: Token) {
		super(tok.posStart, tok.posEnd);
		this.tok = tok;
	}
}
