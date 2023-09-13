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

export default class Interpreter {
	constructor() {}

	public visit(node: BaseNode, context: Context): RTResult {
		const methodName = `visit_${node.constructor.name}`;
		const method = getattr(this, methodName, this.noVisitMethod);

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

	public visit_ListNode(node: ListNode, context: Context) {
		const res = new RTResult();
		const elements: any[] = [];

		for (const elementNode of node.elementNodes) {
			elements.push(res.register(this.visit(elementNode, context)));
			if (res.shouldReturn()) return res;
		}

		return res.success(
			new List(elements).setContext(context).setPos(node.posStart, node.posEnd)
		);
	}

	public visit_DictionaryNode(node: DictionaryNode, context: Context) {
		const res = new RTResult();
		const entries: { [key: string]: Value } = {};

		for (const [key, valueNode] of Object.entries(node.entryNodes)) {
			entries[key] = res.register(this.visit(valueNode, context));
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

	public visit_VarAccessNode(node: VarAccessNode, context: Context) {
		const res = new RTResult();
		const varName = node.varNameTok.value;
		let value = context.symbolTable?.get(varName);

		for (let key of node.keys) {
			if (value instanceof Dictionary) {
				if (!value?.entries) {
					return res.failure(
						new RTError(node.posStart, node.posEnd, "<ERROR>", context)
					);
				}

				if (key in value.entries) {
					value = value.entries[key];
				} else {
					return res.success(new Void(null));
				}
			} else {
				return res.failure(
					new RTError(node.posStart, node.posEnd, "<ERROR>", context)
				);
			}
		}

		if (!value) {
			return res.failure(
				new RTError(node.posStart, node.posEnd, "<ERROR>", context)
			);
		}

		return res.success(
			value.copy().setContext(context).setPos(node.posStart, node.posEnd)
		);
	}

	public visit_VarAssignNode(node: VarAssignNode, context: Context) {
		const res = new RTResult();
		const varName = node.varNameTok.value;
		const value = res.register(this.visit(node.valueNode, context));
		if (res.shouldReturn()) return res;

		context.symbolTable?.set(varName, value);
		return res.success(value);
	}

	public visit_VarReAssignNode(node: VarReAssignNode, context: Context) {
		const res = new RTResult();
		const varName = node.varNameTok.value;
		const value = res.register(this.visit(node.newValueNode, context));
		if (res.error) return res;

		if (context.symbolTable?.has(varName)) {
			context.symbolTable.set(varName, value);
		}

		if (res.error) return res;
		return res.success(value);
	}

	public visit_BinOpNode(node: BinOpNode, context: Context) {
		const res = new RTResult();
		const left = res.register(this.visit(node.leftNode, context));
		if (res.shouldReturn()) return res;

		const right = res.register(this.visit(node.rightNode, context));
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

	public visit_UnaryOpNode(node: UnaryOpNode, context: Context) {
		const res = new RTResult();
		let number = res.register(this.visit(node.node, context));
		if (res.shouldReturn()) return res;

		let error = null;
		if (node.opTok.type === TokenTypes.MINUS) {
			[number, error] = number.multedBy(new Number(-1));
		} else if (node.opTok.type === TokenTypes.NOT) {
			[number, error] = number.notted();
		}

		if (error) {
			return res.failure(error);
		} else {
			return res.success(number.setPos(node.posStart, node.posEnd));
		}
	}

	public visit_IfNode(node: IfNode, context: Context) {
		const res = new RTResult();

		const condition = res.register(this.visit(node.conditionNode, context));
		if (res.shouldReturn()) return res;

		if (condition.value) {
			const result = res.register(this.visit(node.ifBody, context));
			if (res.shouldReturn()) return res;

			if (!node.shouldReturnNull) {
				return res.success(result);
			}
		} else if (node.elseBody) {
			const result = res.register(this.visit(node.elseBody, context));
			if (res.shouldReturn()) return res;

			if (!node.shouldReturnNull) {
				return res.success(result);
			}
		}

		return res.success(new Void(null));
	}

	public visit_ForInNode(node: ForInNode, context: Context) {
		const res = new RTResult();
		const elements = [];

		const startValue = res.register(this.visit(node.startValueNode, context));
		if (res.shouldReturn()) return res;

		const endValue = res.register(this.visit(node.endValueNode, context));
		if (res.shouldReturn()) return res;

		let stepValue: Number = new Number(1);
		if (node.stepValueNode) {
			stepValue = res.register(this.visit(node.stepValueNode, context));
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

			const value = res.register(this.visit(node.bodyNode, context));
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

	public visit_ForOfNode(node: ForOfNode, context: Context) {
		const res = new RTResult();
		const elements = [];
		const browseElements = res.register(this.visit(node.listNode, context));

		if (browseElements instanceof List) {
			for (const browseElement of browseElements.elements) {
				context.symbolTable?.set(node.varNameTok.value, browseElement);

				const value = res.register(this.visit(node.bodyNode, context));
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

				const value = res.register(this.visit(node.bodyNode, context));
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

	public visit_WhileNode(node: WhileNode, context: Context) {
		const res = new RTResult();
		const elements = [];

		while (true) {
			const condition = res.register(this.visit(node.conditionNode, context));
			if (res.shouldReturn()) return res;

			if (!condition.isTrue()) break;

			const value = res.register(this.visit(node.bodyNode, context));
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
			node.shouldAutoReturn
		)
			.setContext(context)
			.setPos(node.posStart, node.posEnd);

		if (node.varNameTok && context.symbolTable) {
			context.symbolTable.set(funcName, funcValue);
		}

		return new RTResult().success(funcValue);
	}

	public visit_CallNode(node: CallNode, context: Context) {
		const res = new RTResult();
		const args = [];

		let valueToCall = res.register(this.visit(node.nodeToCall, context));
		if (res.shouldReturn()) return res;
		valueToCall = valueToCall.copy().setPos(node.posStart, node.posEnd);

		for (const argNode of node.argNodes) {
			args.push(res.register(this.visit(argNode, context)));
			if (res.shouldReturn()) return res;
		}

		const returnValue = res.register(valueToCall.execute(args));
		if (res.shouldReturn()) return res;

		return res.success(
			returnValue.copy().setPos(node.posStart, node.posEnd).setContext(context)
		);
	}

	public visit_ReturnNode(node: ReturnNode, context: Context) {
		const res = new RTResult();
		let value = new Void(null);

		if (node.nodeToReturn) {
			value = res.register(this.visit(node.nodeToReturn, context));
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
}
