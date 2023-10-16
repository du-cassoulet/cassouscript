import Error from "./Errors";

export default class RTResult {
	public value: any = null;
	public error: Error | string | null = null;
	public funcReturnValue: any = null;
	public loopShouldContinue: boolean = false;
	public loopShouldBreak: boolean = false;

	constructor() {
		this.reset();
	}

	public reset() {
		this.value = null;
		this.error = null;
		this.funcReturnValue = null;
		this.loopShouldContinue = false;
		this.loopShouldBreak = false;
	}

	public register(res: RTResult) {
		this.error = res.error;
		this.funcReturnValue = res.funcReturnValue;
		this.loopShouldContinue = res.loopShouldContinue;
		this.loopShouldBreak = res.loopShouldBreak;

		return res.value;
	}

	public success(value: any) {
		this.reset();
		this.value = value;

		return this;
	}

	public successReturn(value: any) {
		this.reset();
		this.funcReturnValue = value;

		return this;
	}

	public successContinue() {
		this.reset();
		this.loopShouldContinue = true;

		return this;
	}

	public successBreak() {
		this.reset();
		this.loopShouldBreak = true;
		return this;
	}

	public failure(error: Error | string) {
		this.reset();
		this.error = error;

		return this;
	}

	public shouldReturn() {
		return (
			this.error ||
			this.funcReturnValue ||
			this.loopShouldContinue ||
			this.loopShouldBreak
		);
	}
}
