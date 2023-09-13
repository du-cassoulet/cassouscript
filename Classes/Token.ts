import Position from "./Position";
import TokenTypes from "../Constants/TokenTypes";

export default class Token {
  public type: TokenTypes;
  public value: any;
  public posStart: Position;
  public posEnd: Position;

  constructor(
    type: TokenTypes,
    value: any,
    posStart: Position,
    posEnd: Position
  ) {
    this.type = type;
    this.value = value;
    this.posStart = posStart.copy();
    this.posEnd = posEnd.copy();
  }

  public matches(type: TokenTypes, value: any) {
    return this.type === type && this.value === value;
  }

  public toString() {
    if (this.value) {
      return `${this.type}:${this.value}`;
    }

    return `${this.type}`;
  }
}
