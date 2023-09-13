import Context from "./Context";
import Position from "./Position";

export default class Error {
  public posStart: Position;
  public posEnd: Position;
  public name: string;
  public details: string;

  constructor(
    posStart: Position,
    posEnd: Position,
    name: string,
    details: string
  ) {
    this.posStart = posStart;
    this.posEnd = posEnd;
    this.name = name;
    this.details = details;
  }

  public toString() {
    return `${this.name}: ${this.details}\nFile ${this.posStart.fn}, line ${
      this.posStart.ln + 1
    }`;
  }
}

export class IllegalCharError extends Error {
  constructor(posStart: Position, posEnd: Position, details: string) {
    super(posStart, posEnd, "Illegal Character", details);
  }
}

export class InvalidSyntaxError extends Error {
  constructor(posStart: Position, posEnd: Position, details: string) {
    super(posStart, posEnd, "Invalid Syntax", details);
  }
}

export class ExpectedCharError extends Error {
  constructor(posStart: Position, posEnd: Position, details: string) {
    super(posStart, posEnd, "Expected Character", details);
  }
}

export class TypingError extends Error {
  constructor(posStart: Position, posEnd: Position, details: string) {
    super(posStart, posEnd, "Typing Error", details);
  }
}

export class RTError extends Error {
  public context: Context;

  constructor(
    posStart: Position,
    posEnd: Position,
    details: string,
    context: Context
  ) {
    super(posStart, posEnd, "Runtime Error", details);
    this.context = context;
  }

  public toString() {
    return `${this.generateTraceback()}${this.name}: ${this.details}\nFile ${
      this.posStart.fn
    }, line ${this.posStart.ln + 1}`;
  }

  public generateTraceback() {
    let result = "";
    let pos: Position | null = this.posStart;
    let ctx: Context | null = this.context;

    while (ctx) {
      result +=
        `  ${this.name}: ${this.details}, in ${ctx.displayName}\n  ` + result;
      pos = ctx.parentEntryPos;
      ctx = ctx.parent;
    }

    return "Traceback (most recent call last):\n" + result;
  }
}
