import path from "path";
import { getattr } from "../utils";
import { RTError } from "./Errors";
import TokenTypes from "../Constants/TokenTypes";
import RTResult from "./RTResult";
import Number from "./Interpreter/Number";
import Function from "./Interpreter/Function";
import String from "./Interpreter/String";
import List from "./Interpreter/List";
import Boolean from "./Interpreter/Boolean";
import Void from "./Interpreter/Void";
import BaseNode from "./Nodes/BaseNode";
import Context from "./Context";
import VoidNode from "./Nodes/VoidNode";
import BooleanNode from "./Nodes/BooleanNode";
import NumberNode from "./Nodes/NumberNode";
import ListNode from "./Nodes/ListNode";
import StringNode from "./Nodes/StringNode";
import VarAccessNode from "./Nodes/VarAccessNode";
import VarAssignNode from "./Nodes/VarAssignNode";
import VarReAssignNode from "./Nodes/VarReAssignNode";
import BinOpNode from "./Nodes/BinOpNode";
import UnaryOpNode from "./Nodes/UnaryOpNode";
import IfNode from "./Nodes/IfNode";
import ForInNode from "./Nodes/ForInNode";
import ForOfNode from "./Nodes/ForOfNode";
import WhileNode from "./Nodes/WhileNode";
import FuncDefNode from "./Nodes/FuncDefNode";
import CallNode from "./Nodes/CallNode";
import ReturnNode from "./Nodes/ReturnNode";
import DictionaryNode from "./Nodes/DictionaryNode";
import Dictionary from "./Interpreter/Dictionary";
import Value from "./Interpreter/Value";
import Type from "./Interpreter/Type";
import TypeNode from "./Nodes/TypeNode";
import IncludeNode from "./Nodes/IncludeNode";
import Math from "./Libraries/Math";
import Text from "./Libraries/Text";
import Random from "./Libraries/Random";
import File from "./Libraries/File";
import Request from "./Libraries/Request";
import WaitNode from "./Nodes/WaitNode";
import Waitable from "./Interpreter/Waitable";
import BuiltInFunction from "./Interpreter/BuiltInFunction";
import Lexer from "./Lexer";
import Config from "./Config";
import Parser from "./Parser";

export default class Interpreter {
	public rootPath: string;
	public config: Config;

	constructor(rootPath: string, config: Config) {
		this.rootPath = rootPath;
		this.config = config;
	}

	public async visit(node: BaseNode, context: Context): Promise<RTResult> {
		const methodName = `visit_${node.constructor.name}`;
		const method = getattr(<{}>this, methodName, this.noVisitMethod);

		return method(node, context);
	}

	public noVisitMethod(node: BaseNode) {
		throw new Error(`No visit_${node.constructor.name} method defined`);
	}

	public visit_VoidNode(node: VoidNode, context: Context) {
		let value = null;
		if (node.tok.value === "NaN") value = NaN;

		return new RTResult().success(
			new Void(value).setContext(context).setPos(node.posStart, node.posEnd)
		);
	}

	public visit_BooleanNode(node: BooleanNode, context: Context) {
		return new RTResult().success(
			new Boolean(node.tok.value === "true")
				.setContext(context)
				.setPos(node.posStart, node.posEnd)
		);
	}

	public visit_NumberNode(node: NumberNode, context: Context) {
		return new RTResult().success(
			new Number(node.tok.value)
				.setContext(context)
				.setPos(node.posStart, node.posEnd)
		);
	}

	public async visit_ListNode(node: ListNode, context: Context) {
		const res = new RTResult();
		const elements: any[] = [];

		for (const elementNode of node.elementNodes) {
			elements.push(res.register(await this.visit(elementNode, context)));
			if (res.shouldReturn()) return res;
		}

		return res.success(
			new List(elements).setContext(context).setPos(node.posStart, node.posEnd)
		);
	}

	public async visit_DictionaryNode(node: DictionaryNode, context: Context) {
		const res = new RTResult();
		const entries: { [key: string]: Value } = {};

		for (let [key, valueNode] of node.entryNodes) {
			if (key instanceof BaseNode) {
				const keyObj = res.register(await this.visit(key, context));
				if (res.shouldReturn()) return res;
				key = keyObj.value;
			}

			entries[<string>key] = res.register(await this.visit(valueNode, context));
			if (res.shouldReturn()) return res;
		}

		return res.success(
			new Dictionary(entries)
				.setContext(context)
				.setPos(node.posStart, node.posEnd)
		);
	}

	public visit_StringNode(node: StringNode, context: Context) {
		return new RTResult().success(
			new String(node.tok.value)
				.setContext(context)
				.setPos(node.posStart, node.posEnd)
		);
	}

	public async visit_VarAccessNode(node: VarAccessNode, context: Context) {
		const res = new RTResult();
		const varName = node.varNameTok.value;
		let value = context.symbolTable?.get(varName);

		if (!value) {
			return res.failure(
				new RTError(
					node.posStart,
					node.posEnd,
					`The variable '${varName}' is not defined`,
					context
				)
			);
		}

		for (let key of node.keys) {
			if (key instanceof BaseNode) {
				const keyObj = res.register(await this.visit(key, context));
				if (res.shouldReturn()) return res;
				key = keyObj.value;
			}

			if (value instanceof Dictionary) {
				if (<string>key in value.entries) {
					value = value.entries[<string>key];
				} else {
					return res.success(new Void(null));
				}
			} else if (value instanceof List) {
				if (<number>(<unknown>key) < value.elements.length) {
					value = value.elements[<number>(<unknown>key)];
				} else {
					return res.success(new Void(null));
				}
			} else if (value instanceof String) {
				if (<number>(<unknown>key) < value.value.length) {
					value = new String(value.value[<number>(<unknown>key)]);
				} else {
					return res.success(new Void(null));
				}
			} else {
				return res.failure(
					new RTError(
						node.posStart,
						node.posEnd,
						`'${key}' is not defined in the variable '${varName}'`,
						context
					)
				);
			}
		}

		return res.success(
			value.copy().setContext(context).setPos(node.posStart, node.posEnd)
		);
	}

	public async visit_VarAssignNode(node: VarAssignNode, context: Context) {
		const res = new RTResult();
		const varName = node.varNameTok.value;
		const value = res.register(await this.visit(node.valueNode, context));
		if (res.shouldReturn()) return res;

		context.symbolTable?.set(varName, value);
		return res.success(value);
	}

	public async visit_VarReAssignNode(node: VarReAssignNode, context: Context) {
		const res = new RTResult();
		const varName = node.varNameTok.value;
		const assignTok = node.assignTok.type;
		const newValue = res.register(await this.visit(node.newValueNode, context));
		let value = context.symbolTable?.get(varName);
		if (res.error) return res;

		if (node.keys.length > 0) {
			for (let i = 0; i < node.keys.length; i++) {
				let key = node.keys[i];

				if (key instanceof BaseNode) {
					const keyObj = res.register(await this.visit(key, context));
					if (res.shouldReturn()) return res;
					key = keyObj.value;
				}

				if (value instanceof Dictionary) {
					if (i < node.keys.length - 1) {
						if (<string>key in value.entries) {
							value = value.entries[<string>key];
						} else {
							return res.failure(
								new RTError(
									node.posStart,
									node.posEnd,
									`'${key}' is undefined in the variable '${varName}'`,
									context
								)
							);
						}
					} else {
						let error = null;
						let cleanValue = null;

						switch (assignTok) {
							case TokenTypes.EQ:
								cleanValue = newValue;
								break;

							case TokenTypes.PLUSEQ:
								[cleanValue, error] =
									value.entries[<string>key].addedTo(newValue);
								break;

							case TokenTypes.MINUSEQ:
								[cleanValue, error] =
									value.entries[<string>key].subbedBy(newValue);
								break;

							case TokenTypes.MULEQ:
								[cleanValue, error] =
									value.entries[<string>key].multedBy(newValue);
								break;

							case TokenTypes.DIVEQ:
								[cleanValue, error] =
									value.entries[<string>key].divedBy(newValue);
								break;
						}

						if (error) res.failure(error);
						value.entries[<string>key] = cleanValue;
						context.symbolTable?.set(varName, value);
					}
				} else if (value instanceof List) {
					if (i < node.keys.length - 1) {
						if (<number>(<unknown>key) < value.elements.length) {
							value = value.elements[<number>(<unknown>key)];
						} else {
							return res.failure(
								new RTError(
									node.posStart,
									node.posEnd,
									"Index out of range",
									context
								)
							);
						}
					} else {
						let error = null;
						let cleanValue = null;

						switch (assignTok) {
							case TokenTypes.EQ:
								cleanValue = newValue;
								break;

							case TokenTypes.PLUSEQ:
								[cleanValue, error] =
									value.elements[<number>(<unknown>key)].addedTo(newValue);
								break;

							case TokenTypes.MINUSEQ:
								[cleanValue, error] =
									value.elements[<number>(<unknown>key)].subbedBy(newValue);
								break;

							case TokenTypes.MULEQ:
								[cleanValue, error] =
									value.elements[<number>(<unknown>key)].multedBy(newValue);
								break;

							case TokenTypes.DIVEQ:
								[cleanValue, error] =
									value.elements[<number>(<unknown>key)].divedBy(newValue);
								break;
						}

						if (error) res.failure(error);
						value.elements[<number>(<unknown>key)] = cleanValue;
						context.symbolTable?.set(varName, value);
					}
				} else {
					return res.failure(
						new RTError(
							node.posStart,
							node.posEnd,
							`The variable '${varName}' is not defined`,
							context
						)
					);
				}
			}
		} else {
			let error = null;
			let cleanValue = null;

			switch (assignTok) {
				case TokenTypes.EQ:
					cleanValue = newValue;
					break;

				case TokenTypes.PLUSEQ:
					[cleanValue, error] = value.addedTo(newValue);
					break;

				case TokenTypes.MINUSEQ:
					[cleanValue, error] = value.subbedBy(newValue);
					break;

				case TokenTypes.MULEQ:
					[cleanValue, error] = value.multedBy(newValue);
					break;

				case TokenTypes.DIVEQ:
					[cleanValue, error] = value.divedBy(newValue);
					break;
			}

			if (error) res.failure(error);
			context.symbolTable?.set(varName, cleanValue);
		}

		return res.success(newValue);
	}

	public async visit_BinOpNode(node: BinOpNode, context: Context) {
		const res = new RTResult();
		const left = res.register(await this.visit(node.leftNode, context));
		if (res.shouldReturn()) return res;

		const right = res.register(await this.visit(node.rightNode, context));
		if (res.shouldReturn()) return res;

		let error, result;
		if (node.opTok.type === TokenTypes.PLUS) {
			[result, error] = left.addedTo(right);
		} else if (node.opTok.type === TokenTypes.MINUS) {
			[result, error] = left.subbedBy(right);
		} else if (node.opTok.type === TokenTypes.MUL) {
			[result, error] = left.multedBy(right);
		} else if (node.opTok.type === TokenTypes.DIV) {
			[result, error] = left.divedBy(right);
		} else if (node.opTok.type === TokenTypes.MODULO) {
			[result, error] = left.moduledBy(right);
		} else if (node.opTok.type === TokenTypes.POW) {
			[result, error] = left.powedBy(right);
		} else if (node.opTok.type === TokenTypes.EE) {
			[result, error] = left.getComparisonEq(right);
		} else if (node.opTok.type === TokenTypes.NE) {
			[result, error] = left.getComparisonNe(right);
		} else if (node.opTok.type === TokenTypes.LT) {
			[result, error] = left.getComparisonLt(right);
		} else if (node.opTok.type === TokenTypes.GT) {
			[result, error] = left.getComparisonGt(right);
		} else if (node.opTok.type === TokenTypes.LTE) {
			[result, error] = left.getComparisonLte(right);
		} else if (node.opTok.type === TokenTypes.GTE) {
			[result, error] = left.getComparisonGte(right);
		} else if (node.opTok.type === TokenTypes.OR) {
			[result, error] = left.oredBy(right);
		} else if (node.opTok.type === TokenTypes.AND) {
			[result, error] = left.andedBy(right);
		}

		if (error) {
			return res.failure(error);
		} else {
			return res.success(result.setPos(node.posStart, node.posEnd));
		}
	}

	public async visit_UnaryOpNode(node: UnaryOpNode, context: Context) {
		const res = new RTResult();
		let number = res.register(await this.visit(node.node, context));
		if (res.shouldReturn()) return res;

		let error = null;
		switch (node.opTok.type) {
			case TokenTypes.MINUS:
				[number, error] = number.multedBy(new Number(-1));
				break;

			case TokenTypes.NOT:
				[number, error] = number.notted();
				break;
		}

		if (error) {
			return res.failure(error);
		} else {
			return res.success(number.setPos(node.posStart, node.posEnd));
		}
	}

	public async visit_IfNode(node: IfNode, context: Context) {
		const res = new RTResult();

		const condition = res.register(
			await this.visit(node.conditionNode, context)
		);
		if (res.shouldReturn()) return res;

		if (condition.value) {
			const result = res.register(await this.visit(node.ifBody, context));
			if (res.shouldReturn()) return res;

			if (!node.shouldReturnNull) {
				return res.success(result);
			}
		} else if (node.elseBody) {
			const result = res.register(await this.visit(node.elseBody, context));
			if (res.shouldReturn()) return res;

			if (!node.shouldReturnNull) {
				return res.success(result);
			}
		}

		return res.success(new Void(null));
	}

	public async visit_ForInNode(node: ForInNode, context: Context) {
		const res = new RTResult();
		const elements = [];

		const startValue = res.register(
			await this.visit(node.startValueNode, context)
		);
		if (res.shouldReturn()) return res;

		const endValue = res.register(await this.visit(node.endValueNode, context));
		if (res.shouldReturn()) return res;

		let stepValue: Number = new Number(1);
		if (node.stepValueNode) {
			stepValue = res.register(await this.visit(node.stepValueNode, context));
			if (res.shouldReturn()) return res;
		}

		let i = startValue.value;
		if (stepValue.value >= 0) {
			var condition = () => i < endValue.value;
		} else {
			var condition = () => i > endValue.value;
		}

		while (condition()) {
			context.symbolTable?.set(node.varNameTok.value, new Number(i));
			i += stepValue.value;

			const value = res.register(await this.visit(node.bodyNode, context));
			if (res.error && !res.loopShouldContinue && !res.loopShouldBreak)
				return res;

			if (res.loopShouldContinue) continue;
			if (res.loopShouldBreak) break;

			elements.push(value);
		}

		return res.success(
			node.shouldReturnNull
				? new Void(null)
				: new List(elements)
						.setContext(context)
						.setPos(node.posStart, node.posEnd)
		);
	}

	public async visit_ForOfNode(node: ForOfNode, context: Context) {
		const res = new RTResult();
		const elements = [];
		const browseElements = res.register(
			await this.visit(node.listNode, context)
		);

		if (browseElements instanceof List) {
			for (const browseElement of browseElements.elements) {
				context.symbolTable?.set(node.varNameTok.value, browseElement);

				const value = res.register(await this.visit(node.bodyNode, context));
				if (res.error && !res.loopShouldContinue && !res.loopShouldBreak)
					return res;

				if (res.loopShouldContinue) continue;
				if (res.loopShouldBreak) break;

				elements.push(value);
			}
		} else if (browseElements instanceof String) {
			for (const browseElement of browseElements.value) {
				context.symbolTable?.set(
					node.varNameTok.value,
					new String(browseElement)
				);

				const value = res.register(await this.visit(node.bodyNode, context));
				if (res.error && !res.loopShouldContinue && !res.loopShouldBreak)
					return res;

				if (res.loopShouldContinue) continue;
				if (res.loopShouldBreak) break;

				elements.push(value);
			}
		}

		return res.success(
			node.shouldReturnNull
				? new Void(null)
				: new List(elements)
						.setContext(context)
						.setPos(node.posStart, node.posEnd)
		);
	}

	public async visit_WhileNode(node: WhileNode, context: Context) {
		const res = new RTResult();
		const elements = [];

		while (true) {
			const condition = res.register(
				await this.visit(node.conditionNode, context)
			);

			if (res.shouldReturn()) return res;
			if (!condition.isTrue()) break;

			const value = res.register(await this.visit(node.bodyNode, context));
			if (res.error && !res.loopShouldContinue && !res.loopShouldBreak)
				return res;

			if (res.loopShouldContinue) continue;
			if (res.loopShouldBreak) break;

			elements.push(value);
		}

		return res.success(
			node.shouldReturnNull
				? new Void(null)
				: new List(elements)
						.setContext(context)
						.setPos(node.posStart, node.posEnd)
		);
	}

	public visit_FuncDefNode(node: FuncDefNode, context: Context) {
		const funcName = node.varNameTok?.value || null;
		const bodyNode = node.bodyNode;
		const argNames = node.argNameToks.map((argName) => argName.value);

		const funcValue = new Function(
			funcName,
			bodyNode,
			argNames,
			node.shouldAutoReturn,
			this.rootPath,
			this.config
		)
			.setContext(context)
			.setPos(node.posStart, node.posEnd);

		if (node.varNameTok && context.symbolTable) {
			context.symbolTable.set(funcName, funcValue);
		}

		return new RTResult().success(funcValue);
	}

	public async visit_CallNode(node: CallNode, context: Context) {
		const res = new RTResult();
		const args = [];

		let valueToCall = res.register(await this.visit(node.nodeToCall, context));
		if (res.shouldReturn()) return res;

		if (
			!(
				valueToCall instanceof Function ||
				valueToCall instanceof BuiltInFunction
			)
		) {
			return res.failure(
				new RTError(
					node.posStart,
					node.posEnd,
					`'${valueToCall}' is not a function`,
					context
				)
			);
		}

		valueToCall = valueToCall.copy().setPos(node.posStart, node.posEnd);

		for (const argNode of node.argNodes) {
			args.push(res.register(await this.visit(argNode, context)));
			if (res.shouldReturn()) return res;
		}

		const returnValue = res.register(await valueToCall.execute(args));
		if (res.shouldReturn()) return res;

		return res.success(
			returnValue.copy().setPos(node.posStart, node.posEnd).setContext(context)
		);
	}

	public async visit_ReturnNode(node: ReturnNode, context: Context) {
		const res = new RTResult();
		let value = new Void(null);

		if (node.nodeToReturn) {
			value = res.register(await this.visit(node.nodeToReturn, context));
			if (res.shouldReturn()) return res;
		}

		return res.successReturn(value);
	}

	public visit_ContinueNode() {
		return new RTResult().successContinue();
	}

	public visit_BreakNode() {
		return new RTResult().successBreak();
	}

	public async visit_TypeNode(node: TypeNode, context: Context) {
		const res = new RTResult();

		if (node.element instanceof BaseNode) {
			const value = res.register(await this.visit(node.element, context));
			if (res.shouldReturn()) return res;

			return res.success(
				new Type(value.constructor.name)
					.setContext(context)
					.setPos(node.posStart, node.posEnd)
			);
		} else {
			return res.success(
				new Type(node.element.value)
					.setContext(context)
					.setPos(node.posStart, node.posEnd)
			);
		}
	}

	public async visit_WaitNode(node: WaitNode, context: Context) {
		const res = new RTResult();

		const waitable = res.register(await this.visit(node.waitableNode, context));
		if (res.shouldReturn()) return res;

		if (!(waitable instanceof Waitable)) {
			return res.failure(
				new RTError(
					node.posStart,
					node.posEnd,
					`'${waitable}' should be a waitable`,
					context
				)
			);
		}

		if (node.executeNode) {
			const value = res.register(await this.visit(node.executeNode, context));
			if (res.shouldReturn()) return res;

			if (!(value instanceof Function || value instanceof BuiltInFunction)) {
				return res.failure(
					new RTError(
						node.posStart,
						node.posEnd,
						`'${value}' should be a function`,
						context
					)
				);
			}

			waitable.value.then((resolved: any) => {
				value.execute([resolved]);
			});

			return res.success(new Void(null));
		} else {
			return res.success(await waitable.value);
		}
	}

	public async visit_IncludeNode(node: IncludeNode, context: Context) {
		const res = new RTResult();
		const rawPath: String = res.register(
			await this.visit(node.pathNode, context)
		);
		if (rawPath.value.startsWith(".")) {
			const filePath = path.join(this.rootPath, rawPath.value);
			const file = Bun.file(filePath);
			const exists = await file.exists();

			if (!exists) {
				return res.failure(
					new RTError(
						node.posStart,
						node.posEnd,
						`The file '${filePath}' does not exist`,
						context
					)
				);
			}

			const ftxt = await file.text();
			if (!ftxt) return res.success(new Void(null));

			const rp = path.dirname(filePath);
			const fn = path.basename(filePath);
			const lexer = new Lexer(fn, ftxt, this.config);

			const { tokens, error } = lexer.makeToken();
			if (error) return res.failure(error);

			const parser = new Parser(tokens, this.config);
			const ast = parser.parse();
			if (ast.error) return res.failure(ast.error);

			const interpreter = new Interpreter(rp, this.config);
			res.register(await interpreter.visit(ast.node, context));
			if (res.shouldReturn() && res.funcReturnValue === null) return res;

			return res.success(res.funcReturnValue || new Void(null));
		} else {
			const libraries: { [key: string]: any } = Object.freeze({
				math: Math,
				text: Text,
				random: Random,
				file: File,
				request: Request,
			});

			if (!(rawPath.value in libraries)) {
				return res.failure(
					new RTError(
						node.posStart,
						node.posEnd,
						`The library '${rawPath.value}' is undefined`,
						context
					)
				);
			}

			return res.success(
				libraries[rawPath.value]
					.setPos(node.posStart, node.posEnd)
					.setContext(context)
			);
		}
	}
}
