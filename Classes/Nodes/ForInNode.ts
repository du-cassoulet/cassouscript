import Token from "../Token";
import BaseNode from "./BaseNode";

class ForInNode extends BaseNode {
  public varNameTok: Token;
  public startValueNode: BaseNode;
  public endValueNode: BaseNode;
  public stepValueNode: BaseNode | null;
  public bodyNode: BaseNode;
  public shouldReturnNull: boolean;

  constructor(
    varNameTok: Token,
    startValueNode: Token,
    endValueNode: Token,
    stepValueNode: BaseNode | null,
    bodyNode: BaseNode,
    shouldReturnNull: boolean
  ) {
    super(varNameTok.posStart, bodyNode.posEnd);

    this.varNameTok = varNameTok;
    this.startValueNode = startValueNode;
    this.endValueNode = endValueNode;
    this.stepValueNode = stepValueNode;
    this.bodyNode = bodyNode;
    this.shouldReturnNull = shouldReturnNull;
  }
}

export default ForInNode;
