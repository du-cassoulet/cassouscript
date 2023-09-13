import Position from "../Position";

export default class BaseNode {
  public posStart: Position;
  public posEnd: Position;

  constructor(posStart: Position, posEnd: Position) {
    this.posStart = posStart;
    this.posEnd = posEnd;
  }
}
