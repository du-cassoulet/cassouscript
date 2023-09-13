import Token from "../Token";
import BaseNode from "./BaseNode";

class VarAccessNode extends BaseNode {
  public varNameTok: Token;

  constructor(varNameTok: Token) {
    super(varNameTok.posStart, varNameTok.posEnd);
    this.varNameTok = varNameTok;
  }
}

export default VarAccessNode;
