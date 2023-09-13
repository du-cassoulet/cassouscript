import Position from "../Position";
import BaseNode from "./BaseNode";

export default class ListNode extends BaseNode {
	public elementNodes: BaseNode[];

	constructor(elementNodes: BaseNode[], posStart: Position, posEnd: Position) {
		super(posStart, posEnd);
		this.elementNodes = elementNodes;
	}
}
