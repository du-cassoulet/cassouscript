import { ExpectedCharError, InvalidSyntaxError } from "./Errors";
import TokenTypes from "../Constants/TokenTypes";
import NumberNode from "./Nodes/NumberNode";
import BinOpNode from "./Nodes/BinOpNode";
import ParseResult from "./ParseResult";
import UnaryOpNode from "./Nodes/UnaryOpNode";
import VarAccessNode from "./Nodes/VarAccessNode";
import VarAssignNode from "./Nodes/VarAssignNode";
import IfNode from "./Nodes/IfNode";
import ForInNode from "./Nodes/ForInNode";
import WhileNode from "./Nodes/WhileNode";
import FuncDefNode from "./Nodes/FuncDefNode";
import CallNode from "./Nodes/CallNode";
import StringNode from "./Nodes/StringNode";
import ListNode from "./Nodes/ListNode";
import ReturnNode from "./Nodes/ReturnNode";
import ContinueNode from "./Nodes/ContinueNode";
import BreakNode from "./Nodes/BreakNode";
import VarReAssignNode from "./Nodes/VarReAssignNode";
import BooleanNode from "./Nodes/BooleanNode";
import VoidNode from "./Nodes/VoidNode";
import ForOfNode from "./Nodes/ForOfNode";
import Token from "./Token";
import BaseNode from "./Nodes/BaseNode";
import DictionaryNode from "./Nodes/DictionaryNode";

export default class Parser {
	public tokens: Token[];
	public tokIdx: number = 0;
	public currentTok: Token;

	constructor(tokens: Token[]) {
		this.tokens = tokens;
		this.currentTok = this.tokens[this.tokIdx];
	}

	private advance() {
		this.tokIdx++;
		this.updateCurrentTok();
		return this.currentTok;
	}

	private reverse(amount: number = 1) {
		this.tokIdx -= amount;
		this.updateCurrentTok();
		return this.currentTok;
	}

	private updateCurrentTok() {
		if (this.tokIdx >= 0 && this.tokIdx < this.tokens.length) {
			this.currentTok = this.tokens[this.tokIdx];
		}
	}

	public parse() {
		let res = this.statements();
		if (!res.error && this.currentTok.type !== TokenTypes.EOF) {
			return res.failure(
				new InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"<ERROR>"
				)
			);
		}

		return res;
	}

	private statements() {
		const res = new ParseResult();
		const statements: BaseNode[] = [];
		const posStart = this.currentTok.posStart.copy();

		while (this.currentTok.type === TokenTypes.NEWLINE) {
			0;
			res.registerAdvancement();
			this.advance();
		}

		const statement = res.register(this.statement());
		if (res.error) return res;
		statements.push(<BaseNode>statement);

		let moreStatements = true;

		while (true) {
			let newlineCount = 0;

			// @ts-ignore
			while (this.currentTok.type === TokenTypes.NEWLINE) {
				res.registerAdvancement();
				this.advance();
				newlineCount++;
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

	private statement() {
		const res = new ParseResult();
		const posStart = this.currentTok.posStart.copy();

		if (this.currentTok.matches(TokenTypes.KEYWORD, "return")) {
			res.registerAdvancement();
			this.advance();

			const expr = res.tryRegister(this.expr());
			if (!expr) this.reverse(res.toReverseCount);

			return res.success(
				new ReturnNode(expr, posStart, this.currentTok.posStart.copy())
			);
		}

		if (this.currentTok.matches(TokenTypes.KEYWORD, "continue")) {
			res.registerAdvancement();
			this.advance();

			return res.success(
				new ContinueNode(posStart, this.currentTok.posStart.copy())
			);
		}

		if (this.currentTok.matches(TokenTypes.KEYWORD, "break")) {
			res.registerAdvancement();
			this.advance();

			return res.success(
				new BreakNode(posStart, this.currentTok.posStart.copy())
			);
		}

		const expr = res.register(this.expr());
		if (res.error) {
			return res.failure(
				new InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"<ERROR>"
				)
			);
		}

		return res.success(<BaseNode>expr);
	}

	private expr() {
		const res = new ParseResult();

		if (this.currentTok.matches(TokenTypes.KEYWORD, "set")) {
			res.registerAdvancement();
			this.advance();

			if (this.currentTok.type !== TokenTypes.IDENTIFIER) {
				return res.failure(
					new InvalidSyntaxError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"<ERROR>"
					)
				);
			}

			const varName = this.currentTok;
			res.registerAdvancement();
			this.advance();

			// @ts-ignore
			while (this.currentTok.type === TokenTypes.NEWLINE) {
				res.registerAdvancement();
				this.advance();
			}

			// @ts-ignore
			if (this.currentTok.type !== TokenTypes.EQ) {
				return res.failure(
					new InvalidSyntaxError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"<ERROR>"
					)
				);
			}

			res.registerAdvancement();
			this.advance();

			while (this.currentTok.type === TokenTypes.NEWLINE) {
				res.registerAdvancement();
				this.advance();
			}

			const expr = res.register(this.expr());
			if (res.error) return res;

			return res.success(new VarAssignNode(varName, expr));
		}

		const node = res.register(
			this.binOp("compExpr", [TokenTypes.AND, TokenTypes.OR], "compExpr")
		);

		if (res.error) {
			return res.failure(
				new InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"<ERROR>"
				)
			);
		}

		return res.success(<BaseNode>node);
	}

	private binOp(
		funca: string,
		ops: (string | [string, string])[],
		funcb: string
	) {
		const res = new ParseResult();

		// @ts-ignore
		let left = res.register(this[funca]());
		if (res.error) return res;

		while (
			ops.includes(this.currentTok.type) ||
			ops.find((e) => this.currentTok.matches(<TokenTypes>e[0], e[1]))
		) {
			const opTok = this.currentTok;
			this.advance();

			// @ts-ignore
			const right = res.register(this[funcb]());
			if (res.error) return res;

			left = new BinOpNode(left, opTok, right);
		}

		return res.success(<BaseNode>left);
	}

	public compExpr() {
		const res = new ParseResult();

		if (this.currentTok.type === TokenTypes.NOT) {
			const opTok = this.currentTok;
			res.registerAdvancement();
			this.advance();

			const node = res.register(this.compExpr());
			if (res.error) return res;

			return res.success(new UnaryOpNode(opTok, node));
		}

		const node = res.register(
			this.binOp(
				"arithExpr",
				[
					TokenTypes.EE,
					TokenTypes.NE,
					TokenTypes.LT,
					TokenTypes.GT,
					TokenTypes.LTE,
					TokenTypes.GTE,
				],
				"arithExpr"
			)
		);

		if (res.error) {
			return res.failure(
				new InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"<ERROR>"
				)
			);
		}

		return res.success(<BaseNode>node);
	}

	public arithExpr() {
		return this.binOp("term", [TokenTypes.PLUS, TokenTypes.MINUS], "term");
	}

	public term() {
		return this.binOp(
			"factor",
			[TokenTypes.MUL, TokenTypes.DIV, TokenTypes.MODULO],
			"factor"
		);
	}

	public factor() {
		const res = new ParseResult();
		const tok = this.currentTok;

		if ([TokenTypes.PLUS, TokenTypes.MINUS].includes(tok.type)) {
			res.registerAdvancement();
			this.advance();

			const factor = res.register(this.factor());
			if (res.error) return res;

			return res.success(new UnaryOpNode(tok, factor));
		}

		return this.power();
	}

	private power() {
		return this.binOp("call", [TokenTypes.POW], "factor");
	}

	public call() {
		const res = new ParseResult();
		const atom = res.register(this.atom());
		if (res.error) return res;

		if (this.currentTok.type === TokenTypes.LPAREN) {
			res.registerAdvancement();
			this.advance();
			const argNodes: BaseNode[] = [];

			// @ts-ignore
			if (this.currentTok.type === TokenTypes.RPAREN) {
				res.registerAdvancement();
				this.advance();
			} else {
				argNodes.push(<BaseNode>res.register(this.expr()));
				if (res.error) {
					return res.failure(
						new InvalidSyntaxError(
							this.currentTok.posStart,
							this.currentTok.posEnd,
							"<ERROR>"
						)
					);
				}

				// @ts-ignore
				while (this.currentTok.type === TokenTypes.COMMA) {
					res.registerAdvancement();
					this.advance();

					argNodes.push(<BaseNode>res.register(this.expr()));
					if (res.error) return res;
				}

				// @ts-ignore
				if (this.currentTok.type !== TokenTypes.RPAREN) {
					return res.failure(
						new InvalidSyntaxError(
							this.currentTok.posStart,
							this.currentTok.posEnd,
							"<ERROR>"
						)
					);
				}

				res.registerAdvancement();
				this.advance();
			}

			return res.success(new CallNode(atom, argNodes));
		}

		return res.success(<BaseNode>atom);
	}

	private atom() {
		const res = new ParseResult();
		const tok = this.currentTok;

		if ([TokenTypes.INT, TokenTypes.FLOAT].includes(tok.type)) {
			res.registerAdvancement();
			this.advance();
			return res.success(new NumberNode(tok));
		} else if (tok.type === TokenTypes.STRING) {
			res.registerAdvancement();
			this.advance();
			return res.success(new StringNode(tok));
		} else if (
			tok.matches(TokenTypes.KEYWORD, "true") ||
			tok.matches(TokenTypes.KEYWORD, "false")
		) {
			res.registerAdvancement();
			this.advance();
			return res.success(new BooleanNode(tok));
		} else if (
			tok.matches(TokenTypes.KEYWORD, "null") ||
			tok.matches(TokenTypes.KEYWORD, "NaN")
		) {
			res.registerAdvancement();
			this.advance();
			return res.success(new VoidNode(tok));
		} else if (tok.type === TokenTypes.LSQUARE) {
			const listExpr = res.register(this.listExpr());
			if (res.error) return res;
			return res.success(<BaseNode>listExpr);
		} else if (tok.type === TokenTypes.LBRACKET) {
			const objExpr = res.register(this.objExpr());
			if (res.error) return res;
			return res.success(<BaseNode>objExpr);
		} else if (tok.type === TokenTypes.IDENTIFIER) {
			res.registerAdvancement();
			this.advance();
			const keys = [];

			while (this.currentTok.type === TokenTypes.DOT) {
				res.registerAdvancement();
				this.advance();

				// @ts-ignore
				if (this.currentTok.type !== TokenTypes.IDENTIFIER) {
					return res.failure(
						new InvalidSyntaxError(
							this.currentTok.posStart,
							this.currentTok.posEnd,
							"<ERROR>"
						)
					);
				}

				keys.push(this.currentTok.value);
				res.registerAdvancement();
				this.advance();
			}

			if (this.currentTok.type === TokenTypes.EQ) {
				res.registerAdvancement();
				this.advance();

				// @ts-ignore
				while (this.currentTok.type === TokenTypes.NEWLINE) {
					res.registerAdvancement();
					this.advance();
				}

				const expr = res.register(this.expr());
				if (res.error) return res;

				return res.success(new VarReAssignNode(tok, <BaseNode>expr));
			}

			return res.success(new VarAccessNode(tok, keys));
		} else if (tok.type === TokenTypes.LPAREN) {
			res.registerAdvancement();
			this.advance();
			const expr = res.register(this.expr());
			if (res.error) return res;

			if (this.currentTok.type === TokenTypes.RPAREN) {
				res.registerAdvancement();
				this.advance();
				return res.success(<BaseNode>expr);
			} else {
				return res.failure(
					new ExpectedCharError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"<ERROR>"
					)
				);
			}
		} else if (tok.matches(TokenTypes.KEYWORD, "if")) {
			const ifExpr = res.register(this.ifExpr());
			if (res.error) return res;
			return res.success(<BaseNode>ifExpr);
		} else if (tok.matches(TokenTypes.KEYWORD, "for")) {
			const forExpr = res.register(this.forExpr());
			if (res.error) return res;
			return res.success(<BaseNode>forExpr);
		} else if (tok.matches(TokenTypes.KEYWORD, "while")) {
			const whileExpr = res.register(this.whileExpr());
			if (res.error) return res;
			return res.success(<BaseNode>whileExpr);
		} else if (tok.matches(TokenTypes.KEYWORD, "func")) {
			const funcDef = res.register(this.funcDef());
			if (res.error) return res;
			return res.success(<BaseNode>funcDef);
		}

		return res.failure(
			new InvalidSyntaxError(
				this.currentTok.posStart,
				this.currentTok.posEnd,
				"<ERROR>"
			)
		);
	}

	private listExpr() {
		const res = new ParseResult();
		const elementNodes: BaseNode[] = [];
		const posStart = this.currentTok.posStart.copy();

		if (this.currentTok.type !== TokenTypes.LSQUARE) {
			return res.failure(
				new InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"<ERROR>"
				)
			);
		}

		res.registerAdvancement();
		this.advance();

		// @ts-ignore
		while (this.currentTok.type === TokenTypes.NEWLINE) {
			res.registerAdvancement();
			this.advance();
		}

		// @ts-ignore
		if (this.currentTok.type === TokenTypes.RSQUARE) {
			res.registerAdvancement();
			this.advance();
		} else {
			elementNodes.push(res.register(this.expr()));
			if (res.error) {
				return res.failure(
					new InvalidSyntaxError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"<ERROR>"
					)
				);
			}

			// @ts-ignore
			while (this.currentTok.type === TokenTypes.COMMA) {
				res.registerAdvancement();
				this.advance();

				while (this.currentTok.type === TokenTypes.NEWLINE) {
					res.registerAdvancement();
					this.advance();
				}

				elementNodes.push(res.register(this.expr()));
				if (res.error) return res;
			}

			// @ts-ignore
			while (this.currentTok.type === TokenTypes.NEWLINE) {
				res.registerAdvancement();
				this.advance();
			}

			// @ts-ignore
			if (this.currentTok.type !== TokenTypes.RSQUARE) {
				return res.failure(
					new InvalidSyntaxError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"<ERROR>"
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

	private objExpr() {
		const res = new ParseResult();
		const entryNodes: { [key: string]: BaseNode } = {};
		const posStart = this.currentTok.posStart.copy();

		if (this.currentTok.type !== TokenTypes.LBRACKET) {
			return res.failure(
				new InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"<ERROR>"
				)
			);
		}

		res.registerAdvancement();
		this.advance();

		// @ts-ignore
		while (this.currentTok.type === TokenTypes.NEWLINE) {
			res.registerAdvancement();
			this.advance();
		}

		// @ts-ignore
		while (this.currentTok.type === TokenTypes.IDENTIFIER) {
			const keyTokValue = this.currentTok.value;
			res.registerAdvancement();
			this.advance();

			while (this.currentTok.type !== TokenTypes.DB_DOT) {
				return res.failure(
					new InvalidSyntaxError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"<ERROR>"
					)
				);
			}

			res.registerAdvancement();
			this.advance();

			const entryExpr = res.register(this.expr());
			if (res.error) return res;

			entryNodes[keyTokValue] = entryExpr;

			if (this.currentTok.type === TokenTypes.COMMA) {
				res.registerAdvancement();
				this.advance();

				while (this.currentTok.type === TokenTypes.NEWLINE) {
					res.registerAdvancement();
					this.advance();
				}
			} else {
				break;
			}
		}

		// @ts-ignore
		while (this.currentTok.type === TokenTypes.NEWLINE) {
			res.registerAdvancement();
			this.advance();
		}

		// @ts-ignore
		if (this.currentTok.type !== TokenTypes.RBRACKET) {
			return res.failure(
				new InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"<ERROR>"
				)
			);
		}

		res.registerAdvancement();
		this.advance();

		return res.success(
			new DictionaryNode(entryNodes, posStart, this.currentTok.posEnd.copy())
		);
	}

	private ifExpr() {
		const res = new ParseResult();

		if (!this.currentTok.matches(TokenTypes.KEYWORD, "if")) {
			return res.failure(
				new InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"<ERROR>"
				)
			);
		}

		res.registerAdvancement();
		this.advance();

		const condition = res.register(this.expr());
		if (res.error) return res;

		while (this.currentTok.type === TokenTypes.NEWLINE) {
			res.registerAdvancement();
			this.advance();
		}

		let shouldReturnNull = false;
		let elseBody: BaseNode | null = null;

		if (this.currentTok.type === TokenTypes.LBRACKET) {
			res.registerAdvancement();
			this.advance();

			shouldReturnNull = true;
			var ifBody = res.register(this.statements());
			if (res.error) return res;

			// @ts-ignore
			if (this.currentTok.type === TokenTypes.RBRACKET) {
				res.registerAdvancement();
				this.advance();
			} else {
				return res.failure(
					new InvalidSyntaxError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"<ERROR>"
					)
				);
			}
		} else if (this.currentTok.type === TokenTypes.ARROW) {
			res.registerAdvancement();
			this.advance();

			var ifBody = res.register(this.statement());
			if (res.error) return res;
		} else {
			return res.failure(
				new InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"<ERROR>"
				)
			);
		}

		if (this.currentTok.matches(TokenTypes.KEYWORD, "else")) {
			res.registerAdvancement();
			this.advance();

			// @ts-ignore
			while (this.currentTok.type === TokenTypes.NEWLINE) {
				res.registerAdvancement();
				this.advance();
			}

			// @ts-ignore
			if (this.currentTok.type === TokenTypes.LBRACKET) {
				res.registerAdvancement();
				this.advance();

				shouldReturnNull = true;
				elseBody = res.register(this.statements());
				if (res.error) return res;

				// @ts-ignore
				if (this.currentTok.type === TokenTypes.RBRACKET) {
					res.registerAdvancement();
					this.advance();
				} else {
					return res.failure(
						new InvalidSyntaxError(
							this.currentTok.posStart,
							this.currentTok.posEnd,
							"<ERROR>"
						)
					);
				}
			} else if (this.currentTok.type === TokenTypes.ARROW) {
				res.registerAdvancement();
				this.advance();

				elseBody = res.register(this.statement());
				if (res.error) return res;
			} else {
				return res.failure(
					new InvalidSyntaxError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"<ERROR>"
					)
				);
			}
		}

		return res.success(
			new IfNode(condition, ifBody, elseBody, shouldReturnNull)
		);
	}

	private forExpr() {
		const res = new ParseResult();

		if (!this.currentTok.matches(TokenTypes.KEYWORD, "for")) {
			return res.failure(
				new InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"<ERROR>"
				)
			);
		}

		res.registerAdvancement();
		this.advance();

		if (this.currentTok.type !== TokenTypes.IDENTIFIER) {
			return res.failure(
				new InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"<ERROR>"
				)
			);
		}

		const varName = this.currentTok;
		res.registerAdvancement();
		this.advance();

		// @ts-ignore
		if (this.currentTok.type !== TokenTypes.EQ) {
			return res.failure(
				new InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"<ERROR>"
				)
			);
		}

		res.registerAdvancement();
		this.advance();

		if (this.currentTok.matches(TokenTypes.KEYWORD, "each")) {
			res.registerAdvancement();
			this.advance();

			const browseValue = res.register(this.expr());
			if (res.error) return res;

			while (this.currentTok.type === TokenTypes.NEWLINE) {
				res.registerAdvancement();
				this.advance();
			}

			if (this.currentTok.type === TokenTypes.ARROW) {
				res.registerAdvancement();
				this.advance();

				while (this.currentTok.type === TokenTypes.NEWLINE) {
					res.registerAdvancement();
					this.advance();
				}

				const body = res.register(this.statement());
				if (res.error) return res;

				return res.success(new ForOfNode(varName, browseValue, body, false));
			} else if (this.currentTok.type === TokenTypes.LBRACKET) {
				res.registerAdvancement();
				this.advance();

				const body = res.register(this.statements());
				if (res.error) return res;

				if (this.currentTok.type !== TokenTypes.RBRACKET) {
					return res.failure(
						new InvalidSyntaxError(
							this.currentTok.posStart,
							this.currentTok.posEnd,
							"<ERROR>"
						)
					);
				}

				res.registerAdvancement();
				this.advance();

				return res.success(new ForOfNode(varName, browseValue, body, true));
			}
		} else {
			const startValue = res.register(this.expr());
			if (res.error) return res;

			if (!this.currentTok.matches(TokenTypes.KEYWORD, "to")) {
				return res.failure(
					new InvalidSyntaxError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"<ERROR>"
					)
				);
			}

			res.registerAdvancement();
			this.advance();

			const endValue = res.register(this.expr());
			if (res.error) return res;

			let stepValue: BaseNode | null = null;
			if (this.currentTok.matches(TokenTypes.KEYWORD, "inc")) {
				res.registerAdvancement();
				this.advance();

				stepValue = res.register(this.expr());
				if (res.error) return res;
			}

			while (this.currentTok.type === TokenTypes.NEWLINE) {
				res.registerAdvancement();
				this.advance();
			}

			if (this.currentTok.type === TokenTypes.ARROW) {
				res.registerAdvancement();
				this.advance();

				while (this.currentTok.type === TokenTypes.NEWLINE) {
					res.registerAdvancement();
					this.advance();
				}

				const body = res.register(this.statement());
				if (res.error) return res;

				return res.success(
					new ForInNode(varName, startValue, endValue, stepValue, body, false)
				);
			} else if (this.currentTok.type === TokenTypes.LBRACKET) {
				res.registerAdvancement();
				this.advance();

				const body = res.register(this.statements());
				if (res.error) return res;

				if (this.currentTok.type !== TokenTypes.RBRACKET) {
					return res.failure(
						new InvalidSyntaxError(
							this.currentTok.posStart,
							this.currentTok.posEnd,
							"<ERROR>"
						)
					);
				}

				res.registerAdvancement();
				this.advance();

				return res.success(
					new ForInNode(varName, startValue, endValue, stepValue, body, true)
				);
			}
		}

		return res.failure(
			new InvalidSyntaxError(
				this.currentTok.posStart,
				this.currentTok.posEnd,
				"<ERROR>"
			)
		);
	}

	private whileExpr() {
		const res = new ParseResult();

		if (!this.currentTok.matches(TokenTypes.KEYWORD, "while")) {
			return res.failure(
				new InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"<ERROR>"
				)
			);
		}

		res.registerAdvancement();
		this.advance();

		const condition = res.register(this.expr());
		if (res.error) return res;

		while (this.currentTok.type === TokenTypes.NEWLINE) {
			res.registerAdvancement();
			this.advance();
		}

		if (this.currentTok.type === TokenTypes.ARROW) {
			res.registerAdvancement();
			this.advance();

			// @ts-ignore
			while (this.currentTok.type === TokenTypes.NEWLINE) {
				res.registerAdvancement();
				this.advance();
			}

			const body = res.register(this.statement());
			if (res.error) return res;

			res.registerAdvancement();
			this.advance();

			return res.success(new WhileNode(condition, body, false));
		} else if (this.currentTok.type === TokenTypes.LBRACKET) {
			res.registerAdvancement();
			this.advance();

			const body = res.register(this.statements());
			if (res.error) return res;

			// @ts-ignore
			if (this.currentTok.type === TokenTypes.RBRACKET) {
				res.registerAdvancement();
				this.advance();
			} else {
				return res.failure(
					new InvalidSyntaxError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"<ERROR>"
					)
				);
			}

			res.registerAdvancement();
			this.advance();

			return res.success(new WhileNode(condition, body, true));
		} else {
			return res.failure(
				new InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"<ERROR>"
				)
			);
		}
	}

	private funcDef() {
		const res = new ParseResult();

		if (!this.currentTok.matches(TokenTypes.KEYWORD, "func")) {
			return res.failure(
				new InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"<ERROR>"
				)
			);
		}

		res.registerAdvancement();
		this.advance();
		let varNameTok: Token | null = null;

		if (this.currentTok.type === TokenTypes.IDENTIFIER) {
			varNameTok = this.currentTok;
			res.registerAdvancement();
			this.advance();

			// @ts-ignore
			if (this.currentTok.type !== TokenTypes.LPAREN) {
				return res.failure(
					new InvalidSyntaxError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"<ERROR>"
					)
				);
			}
		}

		res.registerAdvancement();
		this.advance();
		const argNameToks: Token[] = [];

		// @ts-ignore
		if (this.currentTok.type === TokenTypes.IDENTIFIER) {
			argNameToks.push(this.currentTok);
			res.registerAdvancement();
			this.advance();

			while (this.currentTok.type === TokenTypes.COMMA) {
				res.registerAdvancement();
				this.advance();

				if (this.currentTok.type !== TokenTypes.IDENTIFIER) {
					return res.failure(
						new InvalidSyntaxError(
							this.currentTok.posStart,
							this.currentTok.posEnd,
							"<ERROR>"
						)
					);
				}

				argNameToks.push(this.currentTok);
				res.registerAdvancement();
				this.advance();
			}

			if (this.currentTok.type !== TokenTypes.RPAREN) {
				return res.failure(
					new InvalidSyntaxError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"<ERROR>"
					)
				);
			}
		} else {
			// @ts-ignore
			if (this.currentTok.type !== TokenTypes.RPAREN) {
				return res.failure(
					new InvalidSyntaxError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"<ERROR>"
					)
				);
			}
		}

		res.registerAdvancement();
		this.advance();

		// @ts-ignore
		if (this.currentTok.type === TokenTypes.ARROW) {
			res.registerAdvancement();
			this.advance();

			const nodeToReturn = res.register(this.expr());
			if (res.error) return res;

			return res.success(
				new FuncDefNode(varNameTok, argNameToks, nodeToReturn, true)
			);
			// @ts-ignore
		} else if (this.currentTok.type === TokenTypes.LBRACKET) {
			res.registerAdvancement();
			this.advance();

			const body = res.register(this.statements());
			if (res.error) return res;

			if (this.currentTok.type !== TokenTypes.RBRACKET) {
				return res.failure(
					new InvalidSyntaxError(
						this.currentTok.posStart,
						this.currentTok.posEnd,
						"<ERROR>"
					)
				);
			}

			res.registerAdvancement();
			this.advance();

			return res.success(new FuncDefNode(varNameTok, argNameToks, body, false));
		} else {
			return res.failure(
				new InvalidSyntaxError(
					this.currentTok.posStart,
					this.currentTok.posEnd,
					"<ERROR>"
				)
			);
		}
	}
}
