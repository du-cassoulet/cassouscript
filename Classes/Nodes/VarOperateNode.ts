import Token from "../Token";
import BaseNode from "./BaseNode";

export default class VarOperateNode extends BaseNode {
  public varNameTok: Token;
  public operatorTok: Token;
  public newValueNode: BaseNode;

  constructor(varNameTok: Token, operatorTok: Token, newValueNode: BaseNode) {
    super(varNameTok.posStart, newValueNode.posEnd);

    this.varNameTok = varNameTok;
    this.operatorTok = operatorTok;
    this.newValueNode = newValueNode;
  }
}
