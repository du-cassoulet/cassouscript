import Token from "../Token";
import BaseNode from "./BaseNode";

export default class TypeNode extends BaseNode {
	public element: BaseNode | Token;

	constructor(element: BaseNode) {
		super(element.posStart, element.posEnd);
		this.element = element;
	}
}
