import BaseNode from "./BaseNode";

export default class IfNode extends BaseNode {
	public conditionNode: BaseNode;
	public ifBody: BaseNode;
	public elseBody: BaseNode | null;
	public shouldReturnNull: boolean;

	constructor(
		conditionNode: BaseNode,
		ifBody: BaseNode,
		elseBody: BaseNode | null,
		shouldReturnNull: boolean
	) {
		super(ifBody.posStart, (ifBody || elseBody).posEnd);

		this.conditionNode = conditionNode;
		this.ifBody = ifBody;
		this.elseBody = elseBody;
		this.shouldReturnNull = shouldReturnNull;
	}
}
