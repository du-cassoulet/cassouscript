import BaseNode from "./BaseNode";

export default class WaitNode extends BaseNode {
	public waitableNode: BaseNode;
	public executeNode: BaseNode | null;

	constructor(waitableNode: BaseNode, executeNode: BaseNode | null) {
		super(waitableNode.posStart, executeNode?.posEnd ?? waitableNode.posEnd);
		this.waitableNode = waitableNode;
		this.executeNode = executeNode;
	}
}
