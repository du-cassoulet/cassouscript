import Position from "../Position";
import BaseNode from "./BaseNode";

export default class BreakNode extends BaseNode {
	constructor(posStart: Position, posEnd: Position) {
		super(posStart, posEnd);
	}
}
