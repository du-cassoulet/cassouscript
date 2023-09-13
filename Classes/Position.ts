export default class Position {
	public idx: number;
	public ln: number;
	public col: number;
	public fn: string;
	public ftxt: string;

	constructor(idx: number, ln: number, col: number, fn: string, ftxt: string) {
		this.idx = idx;
		this.ln = ln;
		this.col = col;
		this.fn = fn;
		this.ftxt = ftxt;
	}

	public advance(currentChar: string | null = null) {
		this.idx++;
		this.col++;

		if (currentChar === "\n") {
			this.ln++;
			this.col = 0;
		}

		return this;
	}

	public copy() {
		return new Position(this.idx, this.ln, this.col, this.fn, this.ftxt);
	}
}
