import Token from "../Token";
import BaseNode from "./BaseNode";

export default class BooleanNode extends BaseNode {
	public tok: Token;

	constructor(tok: Token) {
		super(tok.posStart, tok.posEnd);
		this.tok = tok;
	}
}
