import Token from "../Token";
import BaseNode from "./BaseNode";
import ListNode from "./ListNode";

class ForOfNode extends BaseNode {
  public varNameTok: Token;
  public listNode: ListNode;
  public bodyNode: BaseNode;
  public shouldReturnNull: boolean;

  constructor(
    varNameTok: Token,
    listNode: ListNode,
    bodyNode: BaseNode,
    shouldReturnNull: boolean
  ) {
    super(varNameTok.posStart, bodyNode.posEnd);

    this.varNameTok = varNameTok;
    this.listNode = listNode;
    this.bodyNode = bodyNode;
    this.shouldReturnNull = shouldReturnNull;
  }
}

export default ForOfNode;
