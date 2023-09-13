import BaseNode from "./BaseNode";

class SwitchNode extends BaseNode {
	/**
	 * @param {BaseNode} switchNode
	 * @param {BaseNode[]} cases
	 * @param {BaseNode} defaultNode
	 */
	constructor(switchNode, cases, defaultNode) {
		super();

		this.switchNode = switchNode;
		this.cases = cases;
		this.defaultNode = defaultNode;

		this.posStart = this.switchNode.posStart;
		this.posEnd = this.switchNode.posEnd;
	}
}

export default SwitchNode;
