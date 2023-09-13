import BaseNode from "./BaseNode";

export type Case = [BaseNode, boolean];

class IfNode extends BaseNode {
  public cases: Case[];
  public elseCase: Case;

  constructor(cases: Case[], elseCase: Case) {
    super(
      cases[0][0].posStart,
      (elseCase || cases[cases.length - 1])[0].posEnd
    );

    this.cases = cases;
    this.elseCase = elseCase;
  }
}

export default IfNode;
