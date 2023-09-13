import BaseNode from "./BaseNode";

class CallNode extends BaseNode {
	/**
	 * @param {BaseNode} nodeToCall
	 * @param {BaseNode[]} argNodes
	 */
	constructor(nodeToCall, argNodes, isTypeMethod) {
		super();

		this.nodeToCall = nodeToCall;
		this.argNodes = argNodes;
		this.isTypeMethod = isTypeMethod;

		this.posStart = this.nodeToCall.posStart;

		if (argNodes.length > 0) {
			this.posEnd = this.argNodes[this.argNodes.length - 1].posEnd;
		} else {
			this.posEnd = this.nodeToCall.posEnd;
		}
	}
}

export default CallNode;
