import Position from "../Position";
import BaseNode from "./BaseNode";

export default class DictionaryNode extends BaseNode {
	public entryNodes: [BaseNode | string, BaseNode][];

	constructor(
		entryNodes: [BaseNode | string, BaseNode][],
		posStart: Position,
		posEnd: Position
	) {
		super(posStart, posEnd);
		this.entryNodes = entryNodes;
	}
}
