import Flags from "../Constants/Flags.js";
import Chars from "../Constants/Chars.js";
import Types from "../Constants/Types.js";
import Errors from "./Errors.js";
import Position from "./Position.js";
import Token from "./Token.js";
import ParserOptions from "./ParserOptions.js";

const keywordParser = new ParserOptions();
const keywords = keywordParser.readKeywords();

class Lexer {
	/**
	 * To convert human-written code to computer-readable Nodes.
	 * @param {string} fn
	 * @param {string} text
	 */
	constructor(fn, text) {
		this.fn = fn;
		this.text = text;
		this.pos = new Position(-1, 0, -1, this.fn, this.text);
		this.currentChar = null;

		this.advance();
	}

	advance() {
		this.pos.advance(this.currentChar);
		this.currentChar =
			this.pos.idx < this.text.length ? this.text[this.pos.idx] : null;
	}

	makeToken() {
		let tokens = [];

		while (this.currentChar !== null) {
			if (" \t\r".includes(this.currentChar)) {
				this.advance();
			} else if (";\n".includes(this.currentChar)) {
				tokens.push(new Token(Flags.TT_NEWLINE, null, this.pos));
				this.advance();
			} else if (this.currentChar === ">") {
				let token = this.makeGreaterThanOrComment();
				if (token) tokens.push(token);
			} else if (Chars.DIGITS.includes(this.currentChar)) {
				tokens.push(this.makeNumber(tokens));
			} else if (Chars.LETTERS.includes(this.currentChar)) {
				tokens.push(this.makeIdentifier());
			} else if (this.currentChar === "+") {
				tokens.push(this.makePlus());
			} else if (this.currentChar === "*") {
				tokens.push(this.makeMultiply());
			} else if (this.currentChar === "/") {
				tokens.push(this.makeDivide());
			} else if (this.currentChar === "%") {
				tokens.push(new Token(Flags.TT_MODULO, null, this.pos));
				this.advance();
			} else if (this.currentChar === "^") {
				tokens.push(new Token(Flags.TT_POW, null, this.pos));
				this.advance();
			} else if (this.currentChar === "(") {
				tokens.push(new Token(Flags.TT_LPAREN, null, this.pos));
				this.advance();
			} else if (this.currentChar === ")") {
				tokens.push(new Token(Flags.TT_RPAREN, null, this.pos));
				this.advance();
			} else if (this.currentChar === "[") {
				tokens.push(new Token(Flags.TT_LSQUARE, null, this.pos));
				this.advance();
			} else if (this.currentChar === "]") {
				tokens.push(new Token(Flags.TT_RSQUARE, null, this.pos));
				this.advance();
			} else if (this.currentChar === "&") {
				tokens.push(new Token(Flags.TT_AND, null, this.pos));
				this.advance();
			} else if (this.currentChar === "|") {
				tokens.push(new Token(Flags.TT_OR, null, this.pos));
				this.advance();
			} else if (this.currentChar === "{") {
				tokens.push(new Token(Flags.TT_LBRACKET, null, this.pos));
				this.advance();
			} else if (this.currentChar === "}") {
				tokens.push(new Token(Flags.TT_RBRACKET, null, this.pos));
				this.advance();
			} else if (this.currentChar === ",") {
				tokens.push(new Token(Flags.TT_COMMA, null, this.pos));
				this.advance();
			} else if (this.currentChar === ".") {
				tokens.push(new Token(Flags.TT_DOT, null, this.pos));
				this.advance();
			} else if (this.currentChar === ":") {
				tokens.push(new Token(Flags.TT_DBDOT, null, this.pos));
				this.advance();
			} else if (this.currentChar === "@") {
				tokens.push(new Token(Flags.TT_AT, null, this.pos));
				this.advance();
			} else if (this.currentChar === "-") {
				tokens.push(this.makeArrow());
			} else if (this.currentChar === "!") {
				tokens.push(this.makeNotEquals());
			} else if (this.currentChar === "=") {
				tokens.push(this.makeEquals());
			} else if (this.currentChar === "<") {
				tokens.push(this.makeLessThan());
			} else if ("\"'".includes(this.currentChar)) {
				tokens.push(this.makeString());
			} else {
				let posStart = this.pos.copy();
				let char = this.currentChar;

				this.advance();
				return [
					[],
					new Errors.IllegalCharError(posStart, this.pos, "'" + char + "'"),
				];
			}
		}

		tokens.push(new Token(Flags.TT_EOF, null, this.pos));
		return [tokens, null];
	}

	/**
	 * To make a number from a string.
	 * @param {Token[]} tokens
	 * @returns {Token}
	 */
	makeNumber(tokens) {
		let lastTok = tokens[tokens.length - 1];
		let numStr = "";
		let dotCount = 0;
		let posStart = this.pos.copy();

		if (lastTok.type === Flags.TT_DOT) {
			while (
				this.currentChar !== null &&
				Chars.DIGITS.includes(this.currentChar)
			) {
				numStr += this.currentChar;
				this.advance();
			}
		} else {
			while (
				this.currentChar !== null &&
				`${Chars.DIGITS}.`.includes(this.currentChar)
			) {
				if (this.currentChar === ".") {
					if (dotCount === 1) break;

					++dotCount;
					numStr += ".";
				} else {
					numStr += this.currentChar;
				}

				this.advance();
			}
		}

		if (dotCount === 0) {
			return new Token(Flags.TT_INT, parseInt(numStr), posStart, this.pos);
		} else {
			return new Token(Flags.TT_FLOAT, parseFloat(numStr), posStart, this.pos);
		}
	}

	makeString() {
		let stringChar = this.currentChar;
		let string = "";
		let posStart = this.pos.copy();
		let escapeCharacter = false;
		this.advance();

		let escapeCharacters = {
			n: "\n",
			t: "\t",
		};

		while (
			this.currentChar !== null &&
			(this.currentChar !== stringChar || escapeCharacter)
		) {
			if (this.currentChar === "\\") {
				escapeCharacter = true;
				this.advance();
				string += escapeCharacters[this.currentChar];
			} else {
				string += this.currentChar;
			}

			this.advance();
			escapeCharacter = false;
		}

		this.advance();
		return new Token(Flags.TT_STRING, string, posStart, this.pos);
	}

	makeIdentifier() {
		let idStr = "";
		let posStart = this.pos.copy();

		while (
			this.currentChar !== null &&
			`${Chars.LETTERS_DIGITS}_`.includes(this.currentChar)
		) {
			idStr += this.currentChar;
			this.advance();
		}

		if (Object.values(keywords).includes(idStr)) {
			var tokType = Flags.TT_KEYWORD;
		} else if (Types.includes(idStr)) {
			var tokType = Flags.TT_TYPE;
		} else {
			var tokType = Flags.TT_IDENTIFIER;
		}
		return new Token(tokType, idStr, posStart, this.pos);
	}

	makePlus() {
		let tokType = Flags.TT_PLUS;
		let posStart = this.pos.copy();
		this.advance();

		if (this.currentChar === "=") {
			this.advance();
			tokType = Flags.TT_PLE;
		}

		return new Token(tokType, null, posStart, this.pos);
	}

	makeMultiply() {
		let tokType = Flags.TT_MUL;
		let posStart = this.pos.copy();
		this.advance();

		if (this.currentChar === "=") {
			this.advance();
			tokType = Flags.TT_MUE;
		}

		return new Token(tokType, null, posStart, this.pos);
	}

	makeDivide() {
		let tokType = Flags.TT_DIV;
		let posStart = this.pos.copy();
		this.advance();

		if (this.currentChar === "=") {
			this.advance();
			tokType = Flags.TT_DIE;
		}

		return new Token(tokType, null, posStart, this.pos);
	}

	makeNotEquals() {
		let tokType = Flags.TT_NOT;
		let posStart = this.pos.copy();
		this.advance();

		if (this.currentChar === "=") {
			this.advance();
			tokType = Flags.TT_NE;
		}

		return new Token(tokType, null, posStart, this.pos);
	}

	makeEquals() {
		let tokType = Flags.TT_EQ;
		let posStart = this.pos.copy();
		this.advance();

		if (this.currentChar === "=") {
			this.advance();
			tokType = Flags.TT_EE;
		}

		return new Token(tokType, null, posStart, this.pos);
	}

	makeLessThan() {
		let tokType = Flags.TT_LT;
		let posStart = this.pos.copy();
		this.advance();

		if (this.currentChar === "=") {
			this.advance();
			tokType = Flags.TT_LTE;
		}

		return new Token(tokType, null, posStart, this.pos);
	}

	makeGreaterThanOrComment() {
		let tokType = Flags.TT_GT;
		let posStart = this.pos.copy();
		this.advance();

		if (this.currentChar === "=") {
			this.advance();
			tokType = Flags.TT_GTE;
		} else if (this.currentChar === ">") {
			this.advance();

			while (this.currentChar !== "\n" && this.currentChar !== null) {
				this.advance();
			}

			this.advance();
			return null;
		}

		return new Token(tokType, null, posStart, this.pos);
	}

	makeArrow() {
		let tokType = Flags.TT_MINUS;
		let posStart = this.pos.copy();
		this.advance();

		if (this.currentChar === ">") {
			this.advance();
			tokType = Flags.TT_ARROW;
		} else if (this.currentChar === "=") {
			this.advance();
			tokType = Flags.TT_MIE;
		}

		return new Token(tokType, null, posStart, this.pos);
	}
}

export default Lexer;
