import Position from "../Position";
import BaseNode from "./BaseNode";

export default class ExportNode extends BaseNode {
	public nodeToExport: BaseNode;

	constructor(nodeToExport: BaseNode, posStart: Position, posEnd: Position) {
		super(posStart, posEnd);
		this.nodeToExport = nodeToExport;
	}
}
