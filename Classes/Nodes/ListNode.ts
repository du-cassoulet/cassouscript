import Position from "../Position";
import BaseNode from "./BaseNode";

export default class ListNode extends BaseNode {
	public elementNodes: BaseNode[];
	public keys: (BaseNode | string)[];

	constructor(
		elementNodes: BaseNode[],
		keys: (BaseNode | string)[],
		posStart: Position,
		posEnd: Position
	) {
		super(posStart, posEnd);
		this.elementNodes = elementNodes;
		this.keys = keys;
	}
}
