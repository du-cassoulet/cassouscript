import BaseNode from "./BaseNode";

export default class CallNode extends BaseNode {
	public nodeToCall: BaseNode;
	public argNodes: BaseNode[];

	constructor(nodeToCall: BaseNode, argNodes: BaseNode[]) {
		super(
			nodeToCall.posStart,
			argNodes.length > 0
				? argNodes[argNodes.length - 1].posEnd
				: nodeToCall.posEnd
		);

		this.nodeToCall = nodeToCall;
		this.argNodes = argNodes;
	}
}
