import Token from "../Token";
import BaseNode from "./BaseNode";

class StringNode extends BaseNode {
  public tok: Token;

  constructor(tok: Token) {
    super(tok.posStart, tok.posEnd);
    this.tok = tok;
  }
}

export default StringNode;
