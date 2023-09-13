import BaseNode from "./BaseNode";

export default class WhileNode extends BaseNode {
	public conditionNode: BaseNode;
	public bodyNode: BaseNode;
	public shouldReturnNull: boolean;

	constructor(
		conditionNode: BaseNode,
		bodyNode: BaseNode,
		shouldReturnNull: boolean
	) {
		super(conditionNode.posStart, bodyNode.posEnd);

		this.conditionNode = conditionNode;
		this.bodyNode = bodyNode;
		this.shouldReturnNull = shouldReturnNull;
	}
}
