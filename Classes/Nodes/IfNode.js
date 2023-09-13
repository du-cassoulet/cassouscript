import BaseNode from "./BaseNode.js";

class IfNode extends BaseNode {
	/**
	 * @param {[BaseNode, BaseNode, boolean][]} cases
	 * @param {[BaseNode, BaseNode, boolean]} elseCase
	 */
	constructor(cases, elseCase) {
		super();

		this.cases = cases;
		this.elseCase = elseCase;

		this.posStart = this.cases[0][0].posStart;
		this.posEnd = (this.elseCase ||
			this.cases[this.cases.length - 1])[0].posEnd;
	}
}

export default IfNode;
