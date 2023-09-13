import Flags from "../Constants/Flags.js";
import Token from "./Token.js";
import NumberNode from "./Nodes/NumberNode.js";
import BinOpNode from "./Nodes/BinOpNode.js";
import ParseResult from "./ParseResult.js";
import UnaryOpNode from "./Nodes/UnaryOpNode.js";
import VarAccessNode from "./Nodes/VarAccessNode.js";
import VarAssignNode from "./Nodes/VarAssignNode.js";
import IfNode from "./Nodes/IfNode.js";
import Errors from "./Errors.js";
import ForInNode from "./Nodes/ForInNode.js";
import WhileNode from "./Nodes/WhileNode.js";
import FuncDefNode from "./Nodes/FuncDefNode.js";
import CallNode from "./Nodes/CallNode.js";
import StringNode from "./Nodes/StringNode.js";
import ListNode from "./Nodes/ListNode.js";
import ReturnNode from "./Nodes/ReturnNode.js";
import ContinueNode from "./Nodes/ContinueNode.js";
import BreakNode from "./Nodes/BreakNode.js";
import TypeNode from "./Nodes/TypeNode.js";
import VarReAssignNode from "./Nodes/VarReAssignNode.js";
import ObjectNode from "./Nodes/ObjectNode.js";
import EntryNode from "./Nodes/EntryNode.js";
import BooleanNode from "./Nodes/BooleanNode.js";
import VarOperateNode from "./Nodes/VarOperateNode.js";
import VoidNode from "./Nodes/VoidNode.js";
import SwitchNode from "./Nodes/SwitchNode.js";
import ForOfNode from "./Nodes/ForOfNode.js";
import ParserOptions from "./ParserOptions.js";

const keywordParser = new ParserOptions();
const keywords = keywordParser.readKeywords();
class Parser {
	/**
	 * The list of tokens interpreted by the Interpreter.
	 * @param {Token[]} tokens
	 */
	constructor(tokens) {
		this.tokens = tokens;
		this.tokIdx = -1;

		this.advance();
	}

	advance() {
		++this.tokIdx;
		this.updateCurrentTok();
		return this.currentTok;
	}

	/**
	 * To reverse the current token.
	 * @param {number} amount
	 * @returns {Token}
	 */
	reverse(amount = 1) {
		this.tokIdx -= amount;
		this.updateCurrentTok();
		return this.currentTok;
	}

	updateCurrentTok() {
		if (this.tokIdx >= 0 && this.tokIdx < this.tokens.length) {
			this.currentTok = this.tokens[this.tokIdx];
		}
	}

	parse() {
		let res = this.statements();
		if (!res.error && this.currentTok.type !== Flags.TT_EOF) {
			return res.failure(
				new Errors.InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"Expected '+', '-', '*' or '/'"
				)
			);
		}
		return res;
	}

	call() {
		let res = new ParseResult();
		let atom = res.register(this.atom());
		if (res.error) return res;

		if (this.currentTok.type === Flags.TT_LPAREN) {
			res.registerAdvancement();
			this.advance();
			let argNodes = [];

			if (this.currentTok.type === Flags.TT_RPAREN) {
				res.registerAdvancement();
				this.advance();
			} else {
				argNodes.push(res.register(this.expr()));
				if (res.error) {
					return res.failure(
						new Errors.InvalidSyntaxError(
							this.currentTok.posStart,
							this.currentTok.posEnd,
							"Expected ')', 'set', 'func', 'while', 'for', 'if', int, float or identifier"
						)
					);
				}

				while (this.currentTok.type === Flags.TT_COMMA) {
					res.registerAdvancement();
					this.advance();

					argNodes.push(res.register(this.expr()));
					if (res.error) return res;
				}

				if (this.currentTok.type !== Flags.TT_RPAREN) {
					return res.failure(
						new Errors.InvalidSyntaxError(
							this.currentTok.posStart,
							this.currentTok.posEnd,
							"Expected ')' or ','"
						)
					);
				}

				res.registerAdvancement();
				this.advance();
			}

			return res.success(new CallNode(atom, argNodes, false));
		} else if (this.currentTok.type === Flags.TT_AT) {
			res.registerAdvancement();
			this.advance();

			let baseAtom = res.register(this.atom());
			if (res.error) return res;

			if (this.currentTok.type !== Flags.TT_LPAREN) {
				return res.failure(
					new Errors.InvalidSyntaxError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"Expected '('"
					)
				);
			}

			res.registerAdvancement();
			this.advance();
			let argNodes = [atom];

			if (this.currentTok.type === Flags.TT_RPAREN) {
				res.registerAdvancement();
				this.advance();
			} else {
				argNodes.push(res.register(this.expr()));
				if (res.error) {
					return res.failure(
						new Errors.InvalidSyntaxError(
							this.currentTok.posStart,
							this.currentTok.posEnd,
							"Expected ')', 'set', 'func', 'while', 'for', 'if', int, float or identifier"
						)
					);
				}

				while (this.currentTok.type === Flags.TT_COMMA) {
					res.registerAdvancement();
					this.advance();

					argNodes.push(res.register(this.expr()));
					if (res.error) return res;
				}

				if (this.currentTok.type !== Flags.TT_RPAREN) {
					return res.failure(
						new Errors.InvalidSyntaxError(
							this.currentTok.posStart,
							this.currentTok.posEnd,
							"Expected ')' or ','"
						)
					);
				}

				res.registerAdvancement();
				this.advance();
			}

			return res.success(new CallNode(baseAtom, argNodes, true));
		}

		return res.success(atom);
	}

	atom() {
		let res = new ParseResult();
		let tok = this.currentTok;

		if ([Flags.TT_INT, Flags.TT_FLOAT].includes(tok.type)) {
			res.registerAdvancement();
			this.advance();
			return res.success(new NumberNode(tok));
		} else if (tok.type === Flags.TT_STRING) {
			res.registerAdvancement();
			this.advance();
			return res.success(new StringNode(tok));
		} else if (tok.type === Flags.TT_TYPE) {
			res.registerAdvancement();
			this.advance();
			return res.success(new TypeNode(null, tok));
		} else if (
			tok.matches(Flags.TT_KEYWORD, keywords.true) ||
			tok.matches(Flags.TT_KEYWORD, keywords.false)
		) {
			res.registerAdvancement();
			this.advance();
			return res.success(new BooleanNode(tok));
		} else if (
			tok.matches(Flags.TT_KEYWORD, keywords.null) ||
			tok.matches(Flags.TT_KEYWORD, keywords.NaN)
		) {
			res.registerAdvancement();
			this.advance();
			return res.success(new VoidNode(tok));
		} else if (tok.type === Flags.TT_IDENTIFIER) {
			res.registerAdvancement();
			this.advance();
			let path = [];

			while (this.currentTok.type === Flags.TT_DOT) {
				res.registerAdvancement();
				this.advance();

				let atom = res.register(this.atom());
				if (res.error) return res;

				path.push(atom);
			}

			if (this.currentTok.type === Flags.TT_EQ) {
				res.registerAdvancement();
				this.advance();

				while (this.currentTok.type === Flags.TT_NEWLINE) {
					res.registerAdvancement();
					this.advance();
				}

				let expr = res.register(this.expr());
				if (res.error) return res;

				return res.success(new VarReAssignNode(tok, path, expr));
			} else if (
				[Flags.TT_PLE, Flags.TT_MIE, Flags.TT_MUE, Flags.TT_DIE].includes(
					this.currentTok.type
				)
			) {
				let operatorTok = this.currentTok;
				res.registerAdvancement();
				this.advance();

				let expr = res.register(this.expr());
				if (res.error) return res;
				return res.success(new VarOperateNode(tok, path, operatorTok, expr));
			}

			return res.success(new VarAccessNode(tok, path));
		} else if (tok.type === Flags.TT_LPAREN) {
			res.registerAdvancement();
			this.advance();
			let expr = res.register(this.expr());
			if (res.error) return res;

			if (this.currentTok.type === Flags.TT_RPAREN) {
				res.registerAdvancement();
				this.advance();
				return res.success(expr);
			} else {
				return res.failure(
					new Errors.ExpectedCharError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"Expected ')'"
					)
				);
			}
		} else if (tok.type === Flags.TT_LSQUARE) {
			let listExpr = res.register(this.listExpr());
			if (res.error) return res;
			return res.success(listExpr);
		} else if (tok.type === Flags.TT_LBRACKET) {
			let objectExpr = res.register(this.objectExpr());
			if (res.error) return res;
			return res.success(objectExpr);
		} else if (tok.matches(Flags.TT_KEYWORD, keywords.if)) {
			let ifExpr = res.register(this.ifExpr());
			if (res.error) return res;
			return res.success(ifExpr);
		} else if (tok.matches(Flags.TT_KEYWORD, keywords.for)) {
			let forExpr = res.register(this.forExpr());
			if (res.error) return res;
			return res.success(forExpr);
		} else if (tok.matches(Flags.TT_KEYWORD, keywords.while)) {
			let whileExpr = res.register(this.whileExpr());
			if (res.error) return res;
			return res.success(whileExpr);
		} else if (tok.matches(Flags.TT_KEYWORD, keywords.switch)) {
			let switchExpr = res.register(this.switchExpr());
			if (res.error) return res;
			return res.success(switchExpr);
		} else if (tok.matches(Flags.TT_KEYWORD, keywords.func)) {
			let funcDef = res.register(this.funcDef());
			if (res.error) return res;
			return res.success(funcDef);
		}

		return res.failure(
			new Errors.InvalidSyntaxError(
				this.currentTok.posStart,
				this.currentTok.posEnd,
				"Expected int, float, identifier, 'set', '+', '-', '('"
			)
		);
	}

	funcDef() {
		let res = new ParseResult();
		let typeTok = null;

		if (!this.currentTok.matches(Flags.TT_KEYWORD, keywords.func)) {
			return res.failure(
				new Errors.InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"Expected 'func'"
				)
			);
		}

		res.registerAdvancement();
		this.advance();

		if (this.currentTok.type === Flags.TT_IDENTIFIER) {
			var varNameTok = this.currentTok;
			res.registerAdvancement();
			this.advance();

			if (this.currentTok.type === Flags.TT_LT) {
				res.registerAdvancement();
				this.advance();

				if (this.currentTok.type !== Flags.TT_TYPE) {
					return res.failure(
						new Errors.InvalidSyntaxError(
							this.currentTok.posStart,
							this.currentTok.posEnd,
							"Expected type"
						)
					);
				}

				typeTok = this.currentTok;
				res.registerAdvancement();
				this.advance();

				if (this.currentTok.type !== Flags.TT_GT) {
					return res.failure(
						new Errors.InvalidSyntaxError(
							this.currentTok.posStart,
							this.currentTok.posEnd,
							"Expected '>'"
						)
					);
				}

				res.registerAdvancement();
				this.advance();
			}

			if (this.currentTok.type !== Flags.TT_LPAREN) {
				return res.failure(
					new Errors.InvalidSyntaxError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"Expected '('"
					)
				);
			}
		} else {
			var varNameTok = null;

			if (this.currentTok.type !== Flags.TT_LPAREN) {
				return res.failure(
					new Errors.InvalidSyntaxError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"Expected '('"
					)
				);
			}
		}

		res.registerAdvancement();
		this.advance();
		let argNameToks = [];

		if (this.currentTok.type === Flags.TT_IDENTIFIER) {
			argNameToks.push(this.currentTok);
			res.registerAdvancement();
			this.advance();

			while (this.currentTok.type === Flags.TT_COMMA) {
				res.registerAdvancement();
				this.advance();

				if (this.currentTok.type !== Flags.TT_IDENTIFIER) {
					return res.failure(
						new Errors.InvalidSyntaxError(
							this.currentTok.posStart,
							this.currentTok.posEnd,
							"Expected identifier"
						)
					);
				}

				argNameToks.push(this.currentTok);
				res.registerAdvancement();
				this.advance();
			}

			if (this.currentTok.type !== Flags.TT_RPAREN) {
				return res.failure(
					new Errors.InvalidSyntaxError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"Expected ',' or ')'"
					)
				);
			}
		} else {
			if (this.currentTok.type !== Flags.TT_RPAREN) {
				return res.failure(
					new Errors.InvalidSyntaxError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"Expected ',' or ')'"
					)
				);
			}
		}

		res.registerAdvancement();
		this.advance();

		if (this.currentTok.type === Flags.TT_ARROW) {
			res.registerAdvancement();
			this.advance();
			let nodeToReturn = res.register(this.expr());
			if (res.error) return res;

			return res.success(
				new FuncDefNode(varNameTok, argNameToks, nodeToReturn, typeTok, true)
			);
		} else if (this.currentTok.type === Flags.TT_LBRACKET) {
			res.registerAdvancement();
			this.advance();

			let body = res.register(this.statements());
			if (res.error) return res;

			if (this.currentTok.type !== Flags.TT_RBRACKET) {
				return res.failure(
					new Errors.InvalidSyntaxError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"Expected '}'"
					)
				);
			}

			res.registerAdvancement();
			this.advance();

			return res.success(
				new FuncDefNode(varNameTok, argNameToks, body, typeTok, false)
			);
		} else {
			return res.failure(
				new Errors.InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"Expected '{' or '->'"
				)
			);
		}
	}

	switchExpr() {
		let res = new ParseResult();

		if (!this.currentTok.matches(Flags.TT_KEYWORD, keywords.switch)) {
			return res.failure(
				new Errors.InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"Expected 'switch'"
				)
			);
		}

		res.registerAdvancement();
		this.advance();

		let switchNode = res.register(this.expr());
		if (res.error) return res;

		if (this.currentTok.type !== Flags.TT_LBRACKET) {
			return res.failure(
				new Errors.InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"Expected '{'"
				)
			);
		}

		res.registerAdvancement();
		this.advance();

		while (this.currentTok.type === Flags.TT_NEWLINE) {
			res.registerAdvancement();
			this.advance();
		}

		let caseNodes = [];
		let defaultNode = null;

		while (
			this.currentTok.type !== Flags.TT_RBRACKET &&
			this.currentTok.type !== Flags.TT_EOF
		) {
			while (this.currentTok.type === Flags.TT_NEWLINE) {
				res.registerAdvancement();
				this.advance();
			}

			if (this.currentTok.matches(Flags.TT_KEYWORD, keywords.case)) {
				let caseExpr = res.register(this.caseExpr());
				if (res.error) return res;
				caseNodes.push(caseExpr);
			} else if (this.currentTok.matches(Flags.TT_KEYWORD, keywords.default)) {
				res.registerAdvancement();
				this.advance();

				while (this.currentTok.type === Flags.TT_NEWLINE) {
					res.registerAdvancement();
					this.advance();
				}

				if (this.currentTok.type === Flags.TT_ARROW) {
					res.registerAdvancement();
					this.advance();

					while (this.currentTok.type === Flags.TT_NEWLINE) {
						res.registerAdvancement();
						this.advance();
					}

					defaultNode = [res.register(this.statement()), false];
					if (res.error) return res;
				} else if (this.currentTok.type === Flags.TT_LBRACKET) {
					res.registerAdvancement();
					this.advance();

					defaultNode = [res.register(this.statements()), true];
					if (res.error) return res;

					if (this.currentTok.type !== Flags.TT_RBRACKET) {
						return res.failure(
							new Errors.InvalidSyntaxError(
								this.currentTok.posStart,
								this.currentTok.posEnd,
								"Expected '}'"
							)
						);
					}

					res.registerAdvancement();
					this.advance();
				} else {
					return res.failure(
						new Errors.InvalidSyntaxError(
							this.currentTok.posStart,
							this.currentTok.posEnd,
							"Expected '{' or '->'"
						)
					);
				}
			} else {
				return res.failure(
					new Errors.InvalidSyntaxError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"Expected 'case', 'default' or '}'"
					)
				);
			}

			while (this.currentTok.type === Flags.TT_NEWLINE) {
				res.registerAdvancement();
				this.advance();
			}
		}

		if (this.currentTok.type !== Flags.TT_RBRACKET) {
			return res.failure(
				new Errors.InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"Expected 'case', 'default' or '}'"
				)
			);
		}

		res.registerAdvancement();
		this.advance();

		return res.success(new SwitchNode(switchNode, caseNodes, defaultNode));
	}

	caseExpr() {
		let res = new ParseResult();
		let shouldReturnNull = true;

		if (!this.currentTok.matches(Flags.TT_KEYWORD, keywords.case)) {
			return res.failure(
				new Errors.InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"Expected 'case'"
				)
			);
		}

		res.registerAdvancement();
		this.advance();

		let condition = res.register(this.expr());
		if (res.error) return res;

		while (this.currentTok.type === Flags.TT_NEWLINE) {
			res.registerAdvancement();
			this.advance();
		}

		if (this.currentTok.type === Flags.TT_ARROW) {
			res.registerAdvancement();
			this.advance();

			while (this.currentTok.type === Flags.TT_NEWLINE) {
				res.registerAdvancement();
				this.advance();
			}

			shouldReturnNull = false;
			var body = res.register(this.statement());
			if (res.error) return res;
		} else if (this.currentTok.type === Flags.TT_LBRACKET) {
			res.registerAdvancement();
			this.advance();

			var body = res.register(this.statements());
			if (res.error) return res;

			if (this.currentTok.type !== Flags.TT_RBRACKET) {
				return res.failure(
					new Errors.InvalidSyntaxError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"Expected '}'"
					)
				);
			}

			res.registerAdvancement();
			this.advance();
		} else {
			return res.failure(
				new Errors.InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"Expected '{' or '->'"
				)
			);
		}

		return res.success([condition, body, shouldReturnNull]);
	}

	listExpr() {
		let res = new ParseResult();
		let elementNodes = [];
		let posStart = this.currentTok.posStart.copy();

		if (this.currentTok.type !== Flags.TT_LSQUARE) {
			return res.failure(
				new Errors.InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"Expected '['"
				)
			);
		}

		res.registerAdvancement();
		this.advance();

		while (this.currentTok.type === Flags.TT_NEWLINE) {
			res.registerAdvancement();
			this.advance();
		}

		if (this.currentTok.type === Flags.TT_RSQUARE) {
			res.registerAdvancement();
			this.advance();
		} else {
			elementNodes.push(res.register(this.expr()));
			if (res.error) {
				return res.failure(
					new Errors.InvalidSyntaxError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"Expected ']', 'set', 'func', 'while', 'for', 'if', int, float or identifier"
					)
				);
			}

			while (this.currentTok.type === Flags.TT_COMMA) {
				res.registerAdvancement();
				this.advance();

				while (this.currentTok.type === Flags.TT_NEWLINE) {
					res.registerAdvancement();
					this.advance();
				}

				elementNodes.push(res.register(this.expr()));
				if (res.error) return res;
			}

			while (this.currentTok.type === Flags.TT_NEWLINE) {
				res.registerAdvancement();
				this.advance();
			}

			if (this.currentTok.type !== Flags.TT_RSQUARE) {
				return res.failure(
					new Errors.InvalidSyntaxError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"Expected ']' or ','"
					)
				);
			}

			res.registerAdvancement();
			this.advance();
		}

		return res.success(
			new ListNode(elementNodes, posStart, this.currentTok.posEnd.copy())
		);
	}

	entryExpr() {
		let res = new ParseResult();

		while (this.currentTok.type === Flags.TT_NEWLINE) {
			res.registerAdvancement();
			this.advance();
		}

		let key = res.register(this.expr());
		if (res.error) return res;

		while (this.currentTok.type === Flags.TT_NEWLINE) {
			res.registerAdvancement();
			this.advance();
		}

		if (this.currentTok.type !== Flags.TT_DBDOT) {
			return res.failure(
				new Errors.InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"Expected ':'"
				)
			);
		}

		res.registerAdvancement();
		this.advance();

		while (this.currentTok.type === Flags.TT_NEWLINE) {
			res.registerAdvancement();
			this.advance();
		}

		const expr = res.register(this.expr());
		if (res.error) return res;

		return res.success(new EntryNode(key, expr));
	}

	objectExpr() {
		let res = new ParseResult();
		let elementNodes = [];
		let posStart = this.currentTok.posStart.copy();

		if (this.currentTok.type !== Flags.TT_LBRACKET) {
			return res.failure(
				new Errors.InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"Expected '{'"
				)
			);
		}

		res.registerAdvancement();
		this.advance();

		if (this.currentTok.type === Flags.TT_RBRACKET) {
			res.registerAdvancement();
			this.advance();
		} else {
			elementNodes.push(res.register(this.entryExpr()));
			if (res.error) {
				return res.failure(
					new Errors.InvalidSyntaxError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"Expected ']', 'set', 'func', 'while', 'for', 'if', int, float or identifier"
					)
				);
			}

			while (this.currentTok.type === Flags.TT_COMMA) {
				res.registerAdvancement();
				this.advance();

				elementNodes.push(res.register(this.entryExpr()));
				if (res.error) return res;
			}

			while (this.currentTok.type === Flags.TT_NEWLINE) {
				res.registerAdvancement();
				this.advance();
			}

			if (this.currentTok.type !== Flags.TT_RBRACKET) {
				return res.failure(
					new Errors.InvalidSyntaxError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"Expected '}' or ','"
					)
				);
			}

			res.registerAdvancement();
			this.advance();
		}

		return res.success(
			new ObjectNode(elementNodes, posStart, this.currentTok.posEnd.copy())
		);
	}

	forExpr() {
		let res = new ParseResult();

		if (!this.currentTok.matches(Flags.TT_KEYWORD, keywords.for)) {
			return res.failure(
				new Errors.InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"Expected 'for'"
				)
			);
		}

		res.registerAdvancement();
		this.advance();

		if (this.currentTok.type !== Flags.TT_IDENTIFIER) {
			return res.failure(
				new Errors.InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"Expected identifier"
				)
			);
		}

		let varName = this.currentTok;
		res.registerAdvancement();
		this.advance();

		if (this.currentTok.type !== Flags.TT_EQ) {
			return res.failure(
				new Errors.InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"Expected '='"
				)
			);
		}

		res.registerAdvancement();
		this.advance();

		if (this.currentTok.matches(Flags.TT_KEYWORD, keywords.each)) {
			res.registerAdvancement();
			this.advance();

			const browseValue = res.register(this.expr());
			if (res.error) return res;

			while (this.currentTok.type === Flags.TT_NEWLINE) {
				res.registerAdvancement();
				this.advance();
			}

			if (this.currentTok.type === Flags.TT_ARROW) {
				res.registerAdvancement();
				this.advance();

				while (this.currentTok.type === Flags.TT_NEWLINE) {
					res.registerAdvancement();
					this.advance();
				}

				let body = res.register(this.statement());
				if (res.error) return res;

				return res.success(new ForOfNode(varName, browseValue, body, false));
			} else if (this.currentTok.type === Flags.TT_LBRACKET) {
				res.registerAdvancement();
				this.advance();

				let body = res.register(this.statements());
				if (res.error) return res;

				if (this.currentTok.type !== Flags.TT_RBRACKET) {
					return res.failure(
						new Errors.InvalidSyntaxError(
							this.currentTok.posStart,
							this.currentTok.posEnd,
							"Expected '}'"
						)
					);
				}

				res.registerAdvancement();
				this.advance();

				return res.success(new ForOfNode(varName, browseValue, body, true));
			}
		} else {
			let startValue = res.register(this.expr());
			if (res.error) return res;

			if (this.currentTok.matches(Flags.TT_KEYWORD, keywords.to)) {
				res.registerAdvancement();
				this.advance();

				let endValue = res.register(this.expr());
				if (res.error) return res;

				if (this.currentTok.matches(Flags.TT_KEYWORD, keywords.inc)) {
					res.registerAdvancement();
					this.advance();

					var stepValue = res.register(this.expr());
					if (res.error) return res;
				} else {
					var stepValue = null;
				}

				while (this.currentTok.type === Flags.TT_NEWLINE) {
					res.registerAdvancement();
					this.advance();
				}

				if (this.currentTok.type === Flags.TT_ARROW) {
					res.registerAdvancement();
					this.advance();

					while (this.currentTok.type === Flags.TT_NEWLINE) {
						res.registerAdvancement();
						this.advance();
					}

					let body = res.register(this.statement());
					if (res.error) return res;

					return res.success(
						new ForInNode(varName, startValue, endValue, stepValue, body, false)
					);
				} else if (this.currentTok.type === Flags.TT_LBRACKET) {
					res.registerAdvancement();
					this.advance();

					let body = res.register(this.statements());
					if (res.error) return res;

					if (this.currentTok.type !== Flags.TT_RBRACKET) {
						return res.failure(
							new Errors.InvalidSyntaxError(
								this.currentTok.posStart,
								this.currentTok.posEnd,
								"Expected '}'"
							)
						);
					}

					res.registerAdvancement();
					this.advance();

					return res.success(
						new ForInNode(varName, startValue, endValue, stepValue, body, true)
					);
				}
			} else {
				return res.failure(
					new Errors.InvalidSyntaxError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"Expected 'to'"
					)
				);
			}
		}
	}

	whileExpr() {
		let res = new ParseResult();

		if (!this.currentTok.matches(Flags.TT_KEYWORD, keywords.while)) {
			return res.failure(
				new Errors.InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"Expected 'while'"
				)
			);
		}

		res.registerAdvancement();
		this.advance();

		let condition = res.register(this.expr());
		if (res.error) return res;

		while (this.currentTok.type === Flags.TT_NEWLINE) {
			res.registerAdvancement();
			this.advance();
		}

		if (this.currentTok.type === Flags.TT_ARROW) {
			res.registerAdvancement();
			this.advance();

			while (this.currentTok.type === Flags.TT_NEWLINE) {
				res.registerAdvancement();
				this.advance();
			}

			let body = res.register(this.statement());
			if (res.error) return res;

			res.registerAdvancement();
			this.advance();

			return res.success(new WhileNode(condition, body, false));
		} else if (this.currentTok.type === Flags.TT_LBRACKET) {
			res.registerAdvancement();
			this.advance();

			let body = res.register(this.statements());
			if (res.error) return res;

			if (this.currentTok.type === Flags.TT_RBRACKET) {
				res.registerAdvancement();
				this.advance();
			} else {
				return res.failure(
					new Errors.InvalidSyntaxError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"Expected '}'"
					)
				);
			}

			res.registerAdvancement();
			this.advance();

			return res.success(new WhileNode(condition, body, true));
		} else {
			return res.failure(
				new Errors.InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"Expected '{' or '->'"
				)
			);
		}
	}

	ifExpr() {
		let res = new ParseResult();
		let allCases = res.register(this.ifExprCases("if"));
		if (res.error) return res;
		let [cases, elseCase] = allCases;
		return res.success(new IfNode(cases, elseCase));
	}

	ifExprB() {
		return this.ifExprCases("elif");
	}

	ifExprC() {
		let res = new ParseResult();
		let elseCase = null;

		if (this.currentTok.matches(Flags.TT_KEYWORD, keywords.else)) {
			res.registerAdvancement();
			this.advance();

			while (this.currentTok.type === Flags.TT_NEWLINE) {
				res.registerAdvancement();
				this.advance();
			}

			if (this.currentTok.type === Flags.TT_LBRACKET) {
				res.registerAdvancement();
				this.advance();

				let statements = res.register(this.statements());
				if (res.error) return res;
				elseCase = [statements, true];

				if (this.currentTok.type === Flags.TT_RBRACKET) {
					res.registerAdvancement();
					this.advance();
				} else {
					return res.failure(
						new Errors.InvalidSyntaxError(
							this.currentTok.posStart,
							this.currentTok.posEnd,
							"Expected '}'"
						)
					);
				}
			} else {
				let expr = res.register(this.statement());
				if (res.error) return res;
				elseCase = [expr, false];
			}
		}

		return res.success(elseCase);
	}

	ifExprBOrC() {
		let res = new ParseResult();
		let cases = [];
		let elseCase = null;

		if (this.currentTok.matches(Flags.TT_KEYWORD, keywords.elif)) {
			let allCases = res.register(this.ifExprB());
			if (res.error) return res;
			[cases, elseCase] = allCases;
		} else {
			elseCase = res.register(this.ifExprC());
			if (res.error) return res;
		}

		return res.success([cases, elseCase]);
	}

	/**
	 * The conversion of tokens in a If Node.
	 * @param {string} caseKeyword
	 * @returns {ParseResult}
	 */
	ifExprCases(caseKeyword) {
		let res = new ParseResult();
		let cases = [];
		let elseCase = null;

		if (!this.currentTok.matches(Flags.TT_KEYWORD, caseKeyword)) {
			return res.failure(
				Errors.InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					`Expected '${caseKeyword}'`
				)
			);
		}

		res.registerAdvancement();
		this.advance();

		let condition = res.register(this.expr());
		if (res.error) return res;

		while (this.currentTok.type === Flags.TT_NEWLINE) {
			res.registerAdvancement();
			this.advance();
		}

		if (this.currentTok.type === Flags.TT_ARROW) {
			res.registerAdvancement();
			this.advance();

			while (this.currentTok.type === Flags.TT_NEWLINE) {
				res.registerAdvancement();
				this.advance();
			}

			let expr = res.register(this.statement());
			if (res.error) return res;
			cases.push([condition, expr, false]);

			let allCases = res.register(this.ifExprBOrC());
			if (res.error) return res;
			let newCases = [];
			[newCases, elseCase] = allCases;
			cases = [...cases, ...newCases];
		} else if (this.currentTok.type === Flags.TT_LBRACKET) {
			res.registerAdvancement();
			this.advance();

			let statements = res.register(this.statements());
			if (res.error) return res;
			cases.push([condition, statements, true]);

			if (this.currentTok.type === Flags.TT_RBRACKET) {
				res.registerAdvancement();
				this.advance();
			} else {
				return res.failure(
					new Errors.InvalidSyntaxError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"Expected '}'"
					)
				);
			}

			let allCases = res.register(this.ifExprBOrC());
			if (res.error) return res;
			let newCases = [];
			[newCases, elseCase] = allCases;
			cases = [...cases, ...newCases];
		} else {
			return res.failure(
				new Errors.InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"Expected '{' or '->'"
				)
			);
		}

		return res.success([cases, elseCase]);
	}

	power() {
		return this.binOp("call", [Flags.TT_POW], "factor");
	}

	factor() {
		let res = new ParseResult();
		let tok = this.currentTok;

		if ([Flags.TT_PLUS, Flags.TT_MINUS].includes(tok.type)) {
			res.registerAdvancement();
			this.advance();
			let factor = res.register(this.factor());
			if (res.error) return res;
			return res.success(new UnaryOpNode(tok, factor));
		}

		return this.power();
	}

	term() {
		return this.binOp("factor", [Flags.TT_MUL, Flags.TT_DIV, Flags.TT_MODULO]);
	}

	arithExpr() {
		return this.binOp("term", [Flags.TT_PLUS, Flags.TT_MINUS]);
	}

	compExpr() {
		let res = new ParseResult();

		if (this.currentTok.type === Flags.TT_NOT) {
			let opTok = this.currentTok;
			res.registerAdvancement();
			this.advance();

			let node = res.register(this.compExpr());
			if (res.error) return res;
			return res.success(new UnaryOpNode(opTok, node));
		}

		let node = res.register(
			this.binOp("arithExpr", [
				Flags.TT_EE,
				Flags.TT_NE,
				Flags.TT_LT,
				Flags.TT_GT,
				Flags.TT_LTE,
				Flags.TT_GTE,
			])
		);

		if (res.error) {
			return res.failure(
				new Errors.InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"Expected int, float, identifier, 'set', '+', '-', '(', '!'"
				)
			);
		}

		return res.success(node);
	}

	statements() {
		let res = new ParseResult();
		let statements = [];
		let posStart = this.currentTok.posStart.copy();

		while (this.currentTok.type === Flags.TT_NEWLINE) {
			res.registerAdvancement();
			this.advance();
		}

		let statement = res.register(this.statement());
		if (res.error) return res;
		statements.push(statement);

		let moreStatements = true;

		while (true) {
			let newlineCount = 0;

			while (this.currentTok.type === Flags.TT_NEWLINE) {
				res.registerAdvancement();
				this.advance();
				++newlineCount;
			}

			if (newlineCount === 0) {
				moreStatements = false;
			}

			if (!moreStatements) break;
			let statement = res.tryRegister(this.statement());
			if (!statement) {
				this.reverse(res.toReverseCount);
				moreStatements = true;
				continue;
			}

			statements.push(statement);
		}

		return res.success(
			new ListNode(statements, posStart, this.currentTok.posEnd.copy())
		);
	}

	statement() {
		let res = new ParseResult();
		let posStart = this.currentTok.posStart.copy();

		if (this.currentTok.matches(Flags.TT_KEYWORD, keywords.return)) {
			res.registerAdvancement();
			this.advance();

			let expr = res.tryRegister(this.expr());
			if (!expr) this.reverse(res.toReverseCount);

			return res.success(
				new ReturnNode(expr, posStart, this.currentTok.posStart.copy())
			);
		}

		if (this.currentTok.matches(Flags.TT_KEYWORD, keywords.continue)) {
			res.registerAdvancement();
			this.advance();
			return res.success(
				new ContinueNode(posStart, this.currentTok.posStart.copy())
			);
		}

		if (this.currentTok.matches(Flags.TT_KEYWORD, keywords.break)) {
			res.registerAdvancement();
			this.advance();
			return res.success(
				new BreakNode(posStart, this.currentTok.posStart.copy())
			);
		}

		let expr = res.register(this.expr());
		if (res.error) {
			return res.failure(
				new Errors.InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"Expected 'return', 'continue', 'break', 'set', 'if', 'for', 'while', 'func', int, float, identifier, '+', '-', '(', '[' or '!'"
				)
			);
		}

		return res.success(expr);
	}

	expr() {
		let res = new ParseResult();

		if (this.currentTok.matches(Flags.TT_KEYWORD, keywords.set)) {
			res.registerAdvancement();
			this.advance();

			if (this.currentTok.type !== Flags.TT_IDENTIFIER) {
				return res.failure(
					new Errors.InvalidSyntaxError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"Expected identifier"
					)
				);
			}

			let varName = this.currentTok;
			res.registerAdvancement();
			this.advance();

			while (this.currentTok.type === Flags.TT_NEWLINE) {
				res.registerAdvancement();
				this.advance();
			}

			if (this.currentTok.type !== Flags.TT_EQ) {
				return res.failure(
					new Errors.InvalidSyntaxError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"Expected '='"
					)
				);
			}

			res.registerAdvancement();
			this.advance();

			while (this.currentTok.type === Flags.TT_NEWLINE) {
				res.registerAdvancement();
				this.advance();
			}

			let expr = res.register(this.expr());
			if (res.error) return res;
			return res.success(new VarAssignNode(varName, expr, false));
		}

		if (this.currentTok.matches(Flags.TT_KEYWORD, keywords.type)) {
			res.registerAdvancement();
			this.advance();

			let expr = res.tryRegister(this.expr());
			if (!expr)
				return res.failure(
					new Errors.InvalidSyntaxError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"Expected int, float, identifier, string, object, list"
					)
				);

			return res.success(new TypeNode(expr, null));
		}

		let node = res.register(
			this.binOp("compExpr", [
				Flags.TT_AND,
				Flags.TT_OR,
				[Flags.TT_KEYWORD, "in"],
			])
		);

		if (res.error) {
			return res.failure(
				new Errors.InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"Expected 'set', int, float, identifier, '+', '-' or '('"
				)
			);
		}

		return res.success(node);
	}

	/**
	 * To effectuate an operation between two expressions.
	 * @param {string} funca
	 * @param {string[]} ops
	 * @param {string} funcb
	 * @returns {ParseResult}
	 */
	binOp(funca, ops, funcb = null) {
		if (funcb === null) {
			funcb = funca;
		}

		let res = new ParseResult();
		let left = res.register(this[funca]());
		if (res.error) return res;

		while (
			ops.includes(this.currentTok.type) ||
			ops.find((e) => this.currentTok.matches(e[0], e[1]))
		) {
			let opTok = this.currentTok;
			this.advance();
			let right = res.register(this[funcb]());
			if (res.error) return res;
			left = new BinOpNode(left, opTok, right);
		}

		return res.success(left);
	}
}

export default Parser;
