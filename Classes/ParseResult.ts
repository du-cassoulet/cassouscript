import Error from "./Errors";
import BaseNode from "./Nodes/BaseNode";

export default class ParseResult {
	public error: Error | null = null;
	public node: BaseNode | any = null;
	public lastRegisteredAdvanceCount: number = 0;
	public advanceCount: number = 0;
	public toReverseCount: number = 0;

	constructor() {}

	public registerAdvancement() {
		this.lastRegisteredAdvanceCount = 1;
		this.advanceCount++;
	}

	public register(res: ParseResult) {
		this.lastRegisteredAdvanceCount = res.advanceCount;
		this.advanceCount += res.advanceCount;

		if (res.error) {
			this.error = res.error;
		}

		return res.node;
	}

	public tryRegister(res: ParseResult) {
		if (res.error) {
			this.toReverseCount = res.advanceCount;
			return null;
		}

		return this.register(res);
	}

	public success(value: any) {
		this.node = value;
		return this;
	}

	public failure(error: Error) {
		if (!this.error || this.advanceCount === 0) {
			this.error = error;
		}
		return this;
	}
}
