class Position {
	/**
	 * The position of the lexer or an element in the code.
	 * @param {number} idx
	 * @param {number} ln
	 * @param {number} col
	 * @param {string} fn
	 * @param {string} ftxt
	 */
	constructor(idx, ln, col, fn, ftxt) {
		this.idx = idx;
		this.ln = ln;
		this.col = col;
		this.fn = fn;
		this.ftxt = ftxt;
	}

	/**
	 * To make the position advance in the document.
	 * @param {string | null} currentChar
	 * @returns {Position}
	 */
	advance(currentChar = null) {
		++this.idx;
		++this.col;

		if (currentChar === "\n") {
			++this.ln;
			this.col = 0;
		}

		return this;
	}

	copy() {
		return new Position(this.idx, this.ln, this.col, this.fn, this.ftxt);
	}
}

export default Position;
