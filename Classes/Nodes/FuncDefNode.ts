import Token from "../Token";
import BaseNode from "./BaseNode";

export default class FuncDefNode extends BaseNode {
	public varNameTok: Token | null;
	public argNameToks: Token[];
	public bodyNode: BaseNode;
	public shouldAutoReturn: boolean;

	constructor(
		varNameTok: Token | null,
		argNameToks: Token[],
		bodyNode: BaseNode,
		shouldAutoReturn: boolean
	) {
		super(
			varNameTok
				? varNameTok.posStart
				: argNameToks.length > 0
				? argNameToks[0].posStart
				: bodyNode.posStart,
			bodyNode.posEnd
		);

		this.varNameTok = varNameTok;
		this.argNameToks = argNameToks;
		this.bodyNode = bodyNode;
		this.shouldAutoReturn = shouldAutoReturn;
	}
}
