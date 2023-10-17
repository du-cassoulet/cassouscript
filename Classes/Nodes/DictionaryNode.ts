import Position from "../Position";
import BaseNode from "./BaseNode";

export default class DictionaryNode extends BaseNode {
	public entryNodes: [BaseNode | string, BaseNode][];
	public keys: (BaseNode | string)[];

	constructor(
		entryNodes: [BaseNode | string, BaseNode][],
		keys: (BaseNode | string)[],
		posStart: Position,
		posEnd: Position
	) {
		super(posStart, posEnd);
		this.keys = keys;
		this.entryNodes = entryNodes;
	}
}
