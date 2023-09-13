import Position from "../Position";
import BaseNode from "./BaseNode";

export default class ReturnNode extends BaseNode {
	public nodeToReturn: BaseNode;

	constructor(nodeToReturn: BaseNode, posStart: Position, posEnd: Position) {
		super(posStart, posEnd);
		this.nodeToReturn = nodeToReturn;
	}
}
