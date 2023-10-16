import TokenTypes from "../Constants/TokenTypes";
import Chars from "../Constants/Chars";
import { IllegalCharError } from "./Errors";
import Position from "./Position";
import Token from "./Token";
import Keywords from "../Constants/Keywords";
import type Config from "./Config";
import Types from "../Constants/Types";

export default class Lexer {
	public fn: string;
	public text: string;
	public pos: Position;
	public config: Config;
	public currentChar: string | null = null;

	constructor(fn: string, text: string, config: Config) {
		this.fn = fn;
		this.text = text;
		this.pos = new Position(-1, 0, -1, this.fn, this.text);
		this.config = config;

		this.advance();
	}

	public advance() {
		this.pos.advance(this.currentChar);
		this.currentChar =
			this.pos.idx < this.text.length ? this.text[this.pos.idx] : null;
	}

	public makeToken() {
		const tokens: Token[] = [];

		while (this.currentChar !== null) {
			if (" \t\r".includes(this.currentChar)) {
				this.advance();
			} else if (";\n".includes(this.currentChar)) {
				tokens.push(new Token(TokenTypes.NEWLINE, null, this.pos, this.pos));
				this.advance();
			} else if (this.currentChar === ">") {
				const token = this.makeGreaterThanOrComment();
				if (token) tokens.push(token);
			} else if (Chars.DIGITS.includes(this.currentChar)) {
				tokens.push(this.makeNumber());
			} else if (Chars.LETTERS.includes(this.currentChar)) {
				tokens.push(this.makeIdentifier());
			} else if (this.currentChar === "+") {
				tokens.push(this.makePlus());
			} else if (this.currentChar === "*") {
				tokens.push(this.makeMultiply());
			} else if (this.currentChar === "/") {
				tokens.push(this.makeDivide());
			} else if (this.currentChar === "%") {
				tokens.push(new Token(TokenTypes.MODULO, null, this.pos, this.pos));
				this.advance();
			} else if (this.currentChar === "^") {
				tokens.push(new Token(TokenTypes.POW, null, this.pos, this.pos));
				this.advance();
			} else if (this.currentChar === "(") {
				tokens.push(new Token(TokenTypes.LPAREN, null, this.pos, this.pos));
				this.advance();
			} else if (this.currentChar === ")") {
				tokens.push(new Token(TokenTypes.RPAREN, null, this.pos, this.pos));
				this.advance();
			} else if (this.currentChar === "&") {
				tokens.push(new Token(TokenTypes.AND, null, this.pos, this.pos));
				this.advance();
			} else if (this.currentChar === "|") {
				tokens.push(new Token(TokenTypes.OR, null, this.pos, this.pos));
				this.advance();
			} else if (this.currentChar === "[") {
				tokens.push(new Token(TokenTypes.LSQUARE, null, this.pos, this.pos));
				this.advance();
			} else if (this.currentChar === "]") {
				tokens.push(new Token(TokenTypes.RSQUARE, null, this.pos, this.pos));
				this.advance();
			} else if (this.currentChar === "{") {
				tokens.push(new Token(TokenTypes.LBRACKET, null, this.pos, this.pos));
				this.advance();
			} else if (this.currentChar === "}") {
				tokens.push(new Token(TokenTypes.RBRACKET, null, this.pos, this.pos));
				this.advance();
			} else if (this.currentChar === ",") {
				tokens.push(new Token(TokenTypes.COMMA, null, this.pos, this.pos));
				this.advance();
			} else if (this.currentChar === ".") {
				tokens.push(new Token(TokenTypes.DOT, null, this.pos, this.pos));
				this.advance();
			} else if (this.currentChar === ":") {
				tokens.push(new Token(TokenTypes.DB_DOT, null, this.pos, this.pos));
				this.advance();
			} else if (this.currentChar === "-") {
				tokens.push(this.makeArrowOrMinus());
			} else if (this.currentChar === "!") {
				tokens.push(this.makeNotEquals());
			} else if (this.currentChar === "=") {
				tokens.push(this.makeEquals());
			} else if (this.currentChar === "<") {
				tokens.push(this.makeLessThan());
			} else if ("\"'".includes(this.currentChar)) {
				tokens.push(this.makeString());
			} else {
				const posStart = this.pos.copy();
				this.advance();

				return {
					tokens: [],
					error: new IllegalCharError(
						posStart,
						this.pos,
						`Unexpected token '${this.currentChar}'`
					),
				};
			}
		}

		tokens.push(new Token(TokenTypes.EOF, null, this.pos, this.pos));
		return { tokens, error: null };
	}

	private makeNumber() {
		const posStart = this.pos.copy();
		let numStr = "";
		let dotCount = 0;

		while (
			this.currentChar !== null &&
			`${Chars.DIGITS}.`.includes(this.currentChar)
		) {
			if (this.currentChar === ".") {
				if (dotCount === 1) break;

				dotCount++;
				numStr += ".";
			} else {
				numStr += this.currentChar;
			}

			this.advance();
		}

		if (dotCount === 0) {
			return new Token(TokenTypes.INT, parseInt(numStr), posStart, this.pos);
		} else {
			return new Token(TokenTypes.FLOAT, null, posStart, this.pos);
		}
	}

	private makeString() {
		const stringChar = this.currentChar;
		const posStart = this.pos.copy();
		let string = "";
		let escapeCharacter = false;
		this.advance();

		const escapeCharacters: { [key: string]: string } = {
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
		return new Token(TokenTypes.STRING, string, posStart, this.pos);
	}

	private makeIdentifier() {
		const posStart = this.pos.copy();
		let idStr = "";

		while (
			this.currentChar !== null &&
			Chars.LETTERS_DIGITS.includes(this.currentChar)
		) {
			idStr += this.currentChar;
			this.advance();
		}

		if (Types.includes(idStr)) {
			return new Token(TokenTypes.TYPE, idStr, posStart, this.pos);
		} else if (Object.values(this.config.keywords).includes(idStr)) {
			return new Token(TokenTypes.KEYWORD, idStr, posStart, this.pos);
		} else {
			return new Token(TokenTypes.IDENTIFIER, idStr, posStart, this.pos);
		}
	}

	private makePlus() {
		const posStart = this.pos.copy();
		let tokType = TokenTypes.PLUS;
		this.advance();

		if (this.currentChar === "=") {
			tokType = TokenTypes.PLUSEQ;
			this.advance();
		}

		return new Token(tokType, null, posStart, this.pos);
	}

	private makeMultiply() {
		const posStart = this.pos.copy();
		let tokType = TokenTypes.MUL;
		this.advance();

		if (this.currentChar === "=") {
			tokType = TokenTypes.MULEQ;
			this.advance();
		}

		return new Token(tokType, null, posStart, this.pos);
	}

	private makeDivide() {
		const posStart = this.pos.copy();
		let tokType = TokenTypes.DIV;
		this.advance();

		if (this.currentChar === "=") {
			tokType = TokenTypes.DIVEQ;
			this.advance();
		}

		return new Token(tokType, null, posStart, this.pos);
	}

	private makeNotEquals() {
		const posStart = this.pos.copy();
		let tokType = TokenTypes.NOT;
		this.advance();

		if (this.currentChar === "=") {
			this.advance();
			tokType = TokenTypes.NE;
		}

		return new Token(tokType, null, posStart, this.pos);
	}

	private makeEquals() {
		const posStart = this.pos.copy();
		let tokType = TokenTypes.EQ;
		this.advance();

		if (this.currentChar === "=") {
			this.advance();
			tokType = TokenTypes.EE;
		}

		return new Token(tokType, null, posStart, this.pos);
	}

	private makeLessThan() {
		const posStart = this.pos.copy();
		let tokType = TokenTypes.LT;
		this.advance();

		if (this.currentChar === "=") {
			this.advance();
			tokType = TokenTypes.LTE;
		}

		return new Token(tokType, null, posStart, this.pos);
	}

	private makeGreaterThanOrComment() {
		const posStart = this.pos.copy();
		let tokType = TokenTypes.GT;
		this.advance();

		if (this.currentChar === "=") {
			this.advance();
			tokType = TokenTypes.GTE;
		} else if (this.currentChar === ">") {
			this.advance();

			// @ts-ignore
			while (this.currentChar !== "\n" && this.currentChar !== null) {
				this.advance();
			}

			this.advance();
			return null;
		}

		return new Token(tokType, null, posStart, this.pos);
	}

	private makeArrowOrMinus() {
		const posStart = this.pos.copy();
		let tokType = TokenTypes.MINUS;
		this.advance();

		if (this.currentChar === ">") {
			this.advance();
			tokType = TokenTypes.ARROW;
		} else if (this.currentChar === "=") {
			tokType = TokenTypes.MINUSEQ;
			this.advance();
		}

		return new Token(tokType, null, posStart, this.pos);
	}
}
