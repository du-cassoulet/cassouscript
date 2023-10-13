import BaseNode from "./BaseNode";

export default class IncludeNode extends BaseNode {
	public pathNode: BaseNode;

	constructor(pathNode: BaseNode) {
		super(pathNode.posStart, pathNode.posEnd);
		this.pathNode = pathNode;
	}
}
