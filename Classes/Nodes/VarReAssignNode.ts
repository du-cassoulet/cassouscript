import Token from "../Token";
import BaseNode from "./BaseNode";

class VarReAssignNode extends BaseNode {
  public varNameTok: Token;
  public newValueNode: BaseNode;

  constructor(varNameTok: Token, newValueNode: BaseNode) {
    super(varNameTok.posStart, newValueNode.posEnd);

    this.varNameTok = varNameTok;
    this.newValueNode = newValueNode;
  }
}

export default VarReAssignNode;
