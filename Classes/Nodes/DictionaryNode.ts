import Position from "../Position";
import BaseNode from "./BaseNode";

export default class DictionaryNode extends BaseNode {
	public entryNodes: { [key: string]: BaseNode };

	constructor(
		entryNodes: { [key: string]: BaseNode },
		posStart: Position,
		posEnd: Position
	) {
		super(posStart, posEnd);
		this.entryNodes = entryNodes;
	}
}
