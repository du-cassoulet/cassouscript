import { getattr } from "../utils";
import Flags from "../Constants/Flags";
import RTResult from "./RTResult";
import Errors from "./Errors";
import Number from "./Interpreter/Number";
import Function from "./Interpreter/Function";
import String from "./Interpreter/String";
import List from "./Interpreter/List";
import Object from "./Interpreter/Object";
import Boolean from "./Interpreter/Boolean";
import Void from "./Interpreter/Void";
import Type from "./Interpreter/Type";
import BaseNode from "./Nodes/BaseNode";
import Context from "./Context";
import VoidNode from "./Nodes/VoidNode";
import BooleanNode from "./Nodes/BooleanNode";
import NumberNode from "./Nodes/NumberNode";
import ListNode from "./Nodes/ListNode";
import ObjectNode from "./Nodes/ObjectNode";
import StringNode from "./Nodes/StringNode";
import EntryNode from "./Nodes/EntryNode";
import VarAccessNode from "./Nodes/VarAccessNode";
import VarAssignNode from "./Nodes/VarAssignNode";
import VarOperateNode from "./Nodes/VarOperateNode";
import VarReAssignNode from "./Nodes/VarReAssignNode";
import BinOpNode from "./Nodes/BinOpNode";
import UnaryOpNode from "./Nodes/UnaryOpNode";
import SwitchNode from "./Nodes/SwitchNode";
import IfNode from "./Nodes/IfNode";
import ForInNode from "./Nodes/ForInNode";
import ForOfNode from "./Nodes/ForOfNode";
import WhileNode from "./Nodes/WhileNode";
import FuncDefNode from "./Nodes/FuncDefNode";
import CallNode from "./Nodes/CallNode";
import ReturnNode from "./Nodes/ReturnNode";
import ContinueNode from "./Nodes/ContinueNode";
import BreakNode from "./Nodes/BreakNode";
import TypeNode from "./Nodes/TypeNode";
import Value from "./Interpreter/Value";

class Interpreter {
	constructor() {}

	/**
	 * Use the visit method to execute actions from a Node.
	 * @param {BaseNode} node
	 * @param {Context} context
	 * @returns {method<BaseNode, Context>}
	 */
	visit(node, context) {
		let methodName = `visit_${node.constructor.name}`;
		let method = getattr(this, methodName, this.noVisitMethod);

		return method(node, context);
	}

	/**
	 * The error that will be displayed if a node doesn't exist.
	 * @param {BaseNode} node
	 */
	noVisitMethod(node) {
		throw new Error(`No visit_${node.constructor.name} method defined`);
	}

	/**
	 * Create a Void value from a void keyword.
	 * @param {VoidNode} node
	 * @param {Context} context
	 * @returns {RTResult}
	 */
	visit_VoidNode(node, context) {
		let value = null;
		if (node.tok.value === "NaN") value = NaN;

		return new RTResult().success(
			new Void(value).setContext(context).setPos(node.posStart, node.posEnd)
		);
	}

	/**
	 * Create a Boolean value from a boolean keyword.
	 * @param {BooleanNode} node
	 * @param {Context} context
	 * @returns {RTResult}
	 */
	visit_BooleanNode(node, context) {
		let bool = false;
		if (node.tok.value === "true") bool = true;

		return new RTResult().success(
			new Boolean(bool).setContext(context).setPos(node.posStart, node.posEnd)
		);
	}

	/**
	 * Create a Number value from an int or a float.
	 * @param {NumberNode} node
	 * @param {Context} context
	 * @returns {RTResult}
	 */
	visit_NumberNode(node, context) {
		return new RTResult().success(
			new Number(node.tok.value)
				.setContext(context)
				.setPos(node.posStart, node.posEnd)
		);
	}

	/**
	 * Create a List value from a list Node.
	 * @param {ListNode} node
	 * @param {Context} context
	 * @returns {RTResult}
	 */
	visit_ListNode(node, context) {
		let res = new RTResult();
		let elements = [];

		for (const elementNode of node.elementNodes) {
			elements.push(res.register(this.visit(elementNode, context)));
			if (res.shouldReturn()) return res;
		}

		return res.success(
			new List(elements).setContext(context).setPos(node.posStart, node.posEnd)
		);
	}

	/**
	 * Create an Object value from an object Node.
	 * @param {ObjectNode} node
	 * @param {Context} context
	 * @returns {RTResult}
	 */
	visit_ObjectNode(node, context) {
		let res = new RTResult();
		let elements = [];

		for (const elementNode of node.elementNodes) {
			elements.push(res.register(this.visit(elementNode, context)));
			if (res.shouldReturn()) return res;
		}

		return res.success(
			new Object(elements)
				.setContext(context)
				.setPos(node.posStart, node.posEnd)
		);
	}

	/**
	 * Create a String value from a string Node.
	 * @param {StringNode} node
	 * @param {Context} context
	 * @returns {RTResult}
	 */
	visit_StringNode(node, context) {
		return new RTResult().success(
			new String(node.tok.value)
				.setContext(context)
				.setPos(node.posStart, node.posEnd)
		);
	}

	/**
	 * Create an List element from an entry in an Object.
	 * @param {EntryNode} node
	 * @param {Context} context
	 * @returns {RTResult}
	 */
	visit_EntryNode(node, context) {
		let res = new RTResult();
		let keyName = this.visit(node.keyTok, context);

		if (keyName.value instanceof Number) {
			return res.failure(
				new Errors.RTError(
					node.posStart,
					node.posEnd,
					`The key is not a string`,
					context
				)
			);
		}

		let value = res.register(this.visit(node.valueNode, context));
		if (res.shouldReturn()) return res;

		return res.success(
			new List([keyName.value, value])
				.setContext(context)
				.setPos(node.posStart, node.posEnd)
		);
	}

	/**
	 * Get the value of a variable from it's name.
	 * @param {VarAccessNode} node
	 * @param {Context} context
	 * @returns {RTResult}
	 */
	visit_VarAccessNode(node, context) {
		let res = new RTResult();
		let varName = node.varNameTok.value;
		let value = context.symbolTable.get(varName);

		if (!value) {
			return res.failure(
				new Errors.RTError(
					node.posStart,
					node.posEnd,
					`'${varName}' is not defined`,
					context
				)
			);
		}

		for (let i in node.path) {
			i = parseInt(i);
			let { value: e } = this.visit(node.path[i], context);

			if (value instanceof Object) {
				if (e instanceof Number) {
					return res.failure(
						new Errors.RTError(
							node.posStart,
							node.posEnd,
							`You can't use a number to index an object.`,
							context
						)
					);
				}

				value = value.elements.find((x) => {
					if (x.elements[0]?.value !== undefined) {
						return x.elements[0].value === e.value;
					} else {
						x.elements[0] === e.value;
					}
				}).elements[1];
			} else if (value instanceof List) {
				if (e instanceof String) {
					return res.failure(
						new Errors.RTError(
							node.posStart,
							node.posEnd,
							`You can't use a string to index a list.`,
							context
						)
					);
				}

				value = value.elements[e.value];
			} else if (value instanceof String) {
				if (e instanceof String) {
					return res.failure(
						new Errors.RTError(
							node.posStart,
							node.posEnd,
							`You can't use a string to index a string.`,
							context
						)
					);
				}

				value = new String(value.value[e.value]);
			}
		}

		if (!value) {
			return res.failure(
				new Errors.RTError(
					node.posStart,
					node.posEnd,
					`'${varName}' is not defined`,
					context
				)
			);
		}

		value = value.copy().setContext(context).setPos(node.posStart, node.posEnd);
		return res.success(value);
	}

	/**
	 * Assign a new value to a variable name in a specific context.
	 * @param {VarAssignNode} node
	 * @param {Context} context
	 * @returns {RTResult}
	 */
	visit_VarAssignNode(node, context) {
		let res = new RTResult();
		let varName = node.varNameTok.value;
		let value = res.register(this.visit(node.valueNode, context));
		if (res.shouldReturn()) return res;

		context.symbolTable.set(varName, value);
		return res.success(value);
	}

	/**
	 * Assign a new value to a variable name in a specific context based on the already existing data.
	 * @param {VarOperateNode} node
	 * @param {Context} context
	 * @returns {RTResult}
	 */
	visit_VarOperateNode(node, context) {
		let res = new RTResult();
		let varName = node.varNameTok.value;
		let varValue = context.symbolTable.get(varName);

		let value = res.register(this.visit(node.newValueNode, context));
		if (res.shouldReturn()) return res;

		let result, error;

		/**
		 * Returns the new value of the base Node (val1).
		 * @param {Value} val1
		 * @param {Value} val2
		 * @returns {Value}
		 */
		function getResult(val1, val2) {
			if (node.operatorTok.type === Flags.TT_PLE) {
				return val1.addedTo(val2);
			} else if (node.operatorTok.type === Flags.TT_MIE) {
				return val1.subbedBy(val2);
			} else if (node.operatorTok.type === Flags.TT_MUE) {
				return val1.multedBy(val2);
			} else if (node.operatorTok.type === Flags.TT_DIE) {
				return val1.divedBy(val2);
			}
		}

		if (context.symbolTable.get(varName)) {
			if (node.path.length < 1) {
				[result, error] = getResult(varValue, value);
				context.symbolTable.set(varName, result);
			} else {
				let baseNode = context.symbolTable.get(varName);
				let newNode = baseNode;

				for (let i in node.path) {
					i = parseInt(i);
					let { value: e } = this.visit(node.path[i], context);

					if (newNode instanceof Object) {
						if (e instanceof Number) {
							return res.failure(
								new Errors.RTError(
									node.posStart,
									node.posEnd,
									`You can't use a number to index an object.`,
									context
								)
							);
						}

						let ei = newNode.elements.findIndex(
							(x) => x.elements[0].value === e.value
						);

						if (ei + 1 === 0) {
							return res.failure(
								new Errors.RTError(
									node.posStart,
									node.posEnd,
									"Invalid assignment"
								)
							);
						} else {
							if (i + 1 === node.path.length) {
								[result, error] = getResult(
									newNode.elements[ei].elements[1],
									value
								);

								newNode.elements[ei].elements[1] = result;
							} else {
								newNode = newNode.elements[ei].elements[1];
							}
						}
					} else if (newNode instanceof List) {
						if (e instanceof String) {
							return res.failure(
								new Errors.RTError(
									node.posStart,
									node.posEnd,
									`You can't use a string to index a list.`,
									context
								)
							);
						}

						if (i + 1 === node.path.length) {
							if (e.value > newNode.elements.length) {
								return res.failure(
									new Errors.IllegalCharError(
										node.posStart,
										node.posEnd,
										`Invalid index '${e.value}' in list`
									)
								);
							}

							[result, error] = getResult(newNode.elements[e.value], value);

							newNode.elements[e.value] = result;
						} else {
							newNode = newNode.elements[e.value];
						}
					}
				}

				context.symbolTable.set(varName, baseNode);
			}
		}

		if (error) {
			return res.failure(error);
		} else {
			return res.success(result.setPos(node.posStart, node.posEnd));
		}
	}

	/**
	 * Re-assign a value to a variable name in a specific context.
	 * @param {VarReAssignNode} node
	 * @param {Context} context
	 * @returns {RTResult}
	 */
	visit_VarReAssignNode(node, context) {
		let res = new RTResult();
		let varName = node.varNameTok.value;
		let value = res.register(this.visit(node.newValueNode, context));
		if (res.error) return res;

		if (context.symbolTable.get(varName)) {
			if (!node.path.length) {
				context.symbolTable.set(varName, value);
			} else {
				let baseNode = context.symbolTable.get(varName);
				let newNode = baseNode;

				for (let i in node.path) {
					i = parseInt(i);
					let { value: e } = this.visit(node.path[i], context);

					if (newNode instanceof Object) {
						if (e instanceof Number) {
							return res.failure(
								new Errors.RTError(
									node.posStart,
									node.posEnd,
									`You can't use a number to index an object.`,
									context
								)
							);
						}

						let ei = newNode.elements.findIndex(
							(x) => x.elements[0].value === e.value
						);

						if (ei + 1 === 0) {
							if (i + 1 === node.path.length) {
								newNode.elements.push(
									new List([e.value, value])
										.setContext(context)
										.setPos(node.posStart, node.posEnd)
								);
							} else {
								return res.failure(
									new Errors.RTError(
										node.posStart,
										node.posEnd,
										"Invalid assignment"
									)
								);
							}
						} else {
							if (i + 1 === node.path.length) {
								newNode.elements[ei].elements[1] = value;
							} else {
								newNode = newNode.elements[ei].elements[1];
							}
						}
					} else if (newNode instanceof List) {
						if (e instanceof String) {
							return res.failure(
								new Errors.RTError(
									node.posStart,
									node.posEnd,
									`You can't use a string to index a list.`,
									context
								)
							);
						}

						if (i + 1 === node.path.length) {
							if (e.value > newNode.elements.length) {
								return res.failure(
									new Errors.IllegalCharError(
										node.posStart,
										node.posEnd,
										`Invalid index '${e.value}' in list`
									)
								);
							}

							newNode.elements[e.value] = value;
						} else {
							newNode = newNode.elements[e.value];
						}
					} else if (newNode instanceof String) {
						if (e instanceof String) {
							return res.failure(
								new Errors.RTError(
									node.posStart,
									node.posEnd,
									`You can't use a string to index a string.`,
									context
								)
							);
						}

						if (i + 1 === node.path.length) {
							if (e.value > newNode.value.length) {
								return res.failure(
									new Errors.IllegalCharError(
										node.posStart,
										node.posEnd,
										`Invalid index '${e.value}' in string`
									)
								);
							}

							newNode.value =
								newNode.value.slice(0, e.value) +
								value +
								newNode.value.slice(e.value + 1);
						} else {
							newNode = newNode.value[e.value];
						}
					}
				}

				context.symbolTable.set(varName, baseNode);
			}
		}

		if (res.error) return res;
		return res.success(value);
	}

	/**
	 * To realise a binay operation between two nodes.
	 * @param {BinOpNode} node
	 * @param {Context} context
	 * @returns {RTResult}
	 */
	visit_BinOpNode(node, context) {
		let res = new RTResult();
		let left = res.register(this.visit(node.leftNode, context));
		if (res.shouldReturn()) return res;
		let right = res.register(this.visit(node.rightNode, context));
		if (res.shouldReturn()) return res;

		let error, result;

		if (node.opTok.type === Flags.TT_PLUS) {
			[result, error] = left.addedTo(right);
		} else if (node.opTok.type === Flags.TT_MINUS) {
			[result, error] = left.subbedBy(right);
		} else if (node.opTok.type === Flags.TT_MUL) {
			[result, error] = left.multedBy(right);
		} else if (node.opTok.type === Flags.TT_DIV) {
			[result, error] = left.divedBy(right);
		} else if (node.opTok.type === Flags.TT_MODULO) {
			[result, error] = left.moduledBy(right);
		} else if (node.opTok.type === Flags.TT_POW) {
			[result, error] = left.powedBy(right);
		} else if (node.opTok.type === Flags.TT_EE) {
			[result, error] = left.getComparisonEq(right);
		} else if (node.opTok.type === Flags.TT_NE) {
			[result, error] = left.getComparisonNe(right);
		} else if (node.opTok.type === Flags.TT_LT) {
			[result, error] = left.getComparisonLt(right);
		} else if (node.opTok.type === Flags.TT_GT) {
			[result, error] = left.getComparisonGt(right);
		} else if (node.opTok.type === Flags.TT_LTE) {
			[result, error] = left.getComparisonLte(right);
		} else if (node.opTok.type === Flags.TT_GTE) {
			[result, error] = left.getComparisonGte(right);
		} else if (node.opTok.type === Flags.TT_OR) {
			[result, error] = left.oredBy(right);
		} else if (node.opTok.type === Flags.TT_AND) {
			[result, error] = left.andedBy(right);
		} else if (node.opTok.matches(Flags.TT_KEYWORD, "in")) {
			[result, error] = left.isIn(right);
		}

		if (error) {
			return res.failure(error);
		} else {
			return res.success(result.setPos(node.posStart, node.posEnd));
		}
	}

	/**
	 * To realise an unaty operation.
	 * @param {UnaryOpNode} node
	 * @param {Context} context
	 * @returns {RTResult}
	 */
	visit_UnaryOpNode(node, context) {
		let res = new RTResult();
		let number = res.register(this.visit(node.node, context));
		if (res.shouldReturn()) return res;

		let error = null;

		if (node.opTok.type === Flags.TT_MINUS) {
			[number, error] = number.multedBy(new Number(-1));
		} else if (node.opTok.type === Flags.TT_NOT) {
			[number, error] = number.notted();
		}

		if (error) {
			return res.failure(error);
		} else {
			return res.success(number.setPos(node.posStart, node.posEnd));
		}
	}

	/**
	 * To build a switch statement from several nodes.
	 * @param {SwitchNode} node
	 * @param {Context} context
	 * @returns {RTResult}
	 */
	visit_SwitchNode(node, context) {
		let res = new RTResult();

		let condTok = res.register(this.visit(node.switchNode, context));
		for (const [condition, expr, shouldReturnNull] of node.cases) {
			let otherTok = res.register(this.visit(condition, context));
			if (res.shouldReturn()) return res;

			let [conditionValue, error] = condTok.getComparisonEq(otherTok);
			if (error) {
				return res.failure(error);
			}

			if (conditionValue.isTrue()) {
				let exprValue = res.register(this.visit(expr, context));
				if (res.shouldReturn()) return res;
				return res.success(shouldReturnNull ? new Void(null) : exprValue);
			}
		}

		if (node.defaultNode) {
			let [expr, shouldReturnNull] = node.defaultNode;
			let elseValue = res.register(this.visit(expr, context));
			if (res.shouldReturn()) return res;
			return res.success(shouldReturnNull ? new Void(null) : elseValue);
		}

		return res.success(new Void(null));
	}

	/**
	 * To build an if statement from several nodes.
	 * @param {IfNode} node
	 * @param {Context} context
	 * @returns {RTResult}
	 */
	visit_IfNode(node, context) {
		let res = new RTResult();

		for (const [condition, expr, shouldReturnNull] of node.cases) {
			let conditionValue = res.register(this.visit(condition, context));
			if (res.shouldReturn()) return res;

			if (conditionValue.isTrue()) {
				let exprValue = res.register(this.visit(expr, context));
				if (res.shouldReturn()) return res;
				return res.success(shouldReturnNull ? new Void(null) : exprValue);
			}
		}

		if (node.elseCase) {
			let [expr, shouldReturnNull] = node.elseCase;
			let elseValue = res.register(this.visit(expr, context));
			if (res.shouldReturn()) return res;
			return res.success(shouldReturnNull ? new Void(null) : elseValue);
		}

		return res.success(new Void(null));
	}

	/**
	 * To build a for in statement from several nodes.
	 * @param {ForInNode} node
	 * @param {Context} context
	 * @returns {RTResult}
	 */
	visit_ForInNode(node, context) {
		let res = new RTResult();
		let elements = [];

		let startValue = res.register(this.visit(node.startValueNode, context));
		if (res.shouldReturn()) return res;

		let endValue = res.register(this.visit(node.endValueNode, context));
		if (res.shouldReturn()) return res;

		if (node.stepValueNode) {
			var stepValue = res.register(this.visit(node.stepValueNode, context));
			if (res.shouldReturn()) return res;
		} else {
			var stepValue = new Number(1);
		}

		let i = startValue.value;
		if (stepValue.value >= 0) {
			var condition = () => i < endValue.value;
		} else {
			var condition = () => i > endValue.value;
		}

		while (condition()) {
			context.symbolTable.set(node.varNameTok.value, new Number(i));
			i += stepValue.value;

			let value = res.register(this.visit(node.bodyNode, context));
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

	/**
	 * To build a for of statement from several nodes.
	 * @param {ForOfNode} node
	 * @param {Context} context
	 * @returns {RTResult}
	 */
	visit_ForOfNode(node, context) {
		let res = new RTResult();
		let elements = [];

		let browseElements = res.register(this.visit(node.listNode, context));

		if (browseElements instanceof List) {
			for (const browseElement of browseElements.elements) {
				context.symbolTable.set(node.varNameTok.value, browseElement);

				let value = res.register(this.visit(node.bodyNode, context));
				if (res.error && !res.loopShouldContinue && !res.loopShouldBreak)
					return res;

				if (res.loopShouldContinue) continue;
				if (res.loopShouldBreak) break;

				elements.push(value);
			}
		} else if (browseElements instanceof String) {
			for (const browseElement of browseElements.value) {
				context.symbolTable.set(
					node.varNameTok.value,
					new String(browseElement)
				);

				let value = res.register(this.visit(node.bodyNode, context));
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

	/**
	 * To build a while statement from several nodes.
	 * @param {WhileNode} node
	 * @param {Context} context
	 * @returns {RTResult}
	 */
	visit_WhileNode(node, context) {
		let res = new RTResult();
		let elements = [];

		while (true) {
			let condition = res.register(this.visit(node.conditionNode, context));
			if (res.shouldReturn()) return res;

			if (!condition.isTrue()) break;

			let value = res.register(this.visit(node.bodyNode, context));
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

	/**
	 * To define a function with several nodes.
	 * @param {FuncDefNode} node
	 * @param {Context} context
	 * @returns {RTResult}
	 */
	visit_FuncDefNode(node, context) {
		let funcName = node.varNameTok?.value || null;
		let bodyNode = node.bodyNode;
		let typeTok = node.typeTok;
		let argNames = node.argNameToks.map((argName) => argName.value);
		let funcValue = new Function(
			funcName,
			bodyNode,
			argNames,
			typeTok?.value || null,
			node.shouldAutoReturn
		)
			.setContext(context)
			.setPos(node.posStart, node.posEnd);

		if (node.varNameTok) {
			context.symbolTable.set(funcName, funcValue);
		}

		return new RTResult().success(funcValue);
	}

	/**
	 * To call a function with several nodes.
	 * @param {CallNode} node
	 * @param {Context} context
	 * @returns {RTResult}
	 */
	visit_CallNode(node, context) {
		let res = new RTResult();
		let args = [];

		let valueToCall = res.register(this.visit(node.nodeToCall, context));
		if (res.shouldReturn()) return res;
		valueToCall = valueToCall.copy().setPos(node.posStart, node.posEnd);

		if (node.isTypeMethod) {
			let parent = res.register(this.visit(node.argNodes[0]));

			if (!valueToCall.type) {
				return res.failure(
					new Errors.InvalidSyntaxError(
						node.posStart,
						node.posEnd,
						`Methodic call on a basic function`
					)
				);
			}

			if (parent.constructor.name !== valueToCall.type) {
				return res.failure(
					new Errors.InvalidSyntaxError(
						node.posStart,
						node.posEnd,
						`Invalid parent type, '${valueToCall.type}' required`
					)
				);
			}

			args.push(parent);
			if (res.shouldReturn()) return res;

			for (const argNode of node.argNodes.slice(1)) {
				args.push(res.register(this.visit(argNode, context)));
				if (res.shouldReturn()) return res;
			}
		} else {
			if (valueToCall.type) {
				return res.failure(
					new Errors.InvalidSyntaxError(
						node.posStart,
						node.posEnd,
						"Basic call on a method function"
					)
				);
			}

			for (const argNode of node.argNodes) {
				args.push(res.register(this.visit(argNode, context)));
				if (res.shouldReturn()) return res;
			}
		}

		let returnValue = res.register(valueToCall.execute(args));
		if (res.shouldReturn()) return res;

		returnValue = returnValue
			.copy()
			.setPos(node.posStart, node.posEnd)
			.setContext(context);

		return res.success(returnValue);
	}

	/**
	 * To specify the value to return in a function call.
	 * @param {ReturnNode} node
	 * @param {Context} context
	 * @returns {RTResult}
	 */
	visit_ReturnNode(node, context) {
		let res = new RTResult();

		if (node.nodeToReturn) {
			var value = res.register(this.visit(node.nodeToReturn, context));
			if (res.shouldReturn()) return res;
		} else {
			var value = new Void(null);
		}

		return res.successReturn(value);
	}

	/**
	 * The continue keyword in loops.
	 * @param {ContinueNode} node
	 * @param {Context} context
	 * @returns {RTResult}
	 */
	visit_ContinueNode() {
		return new RTResult().successContinue();
	}

	/**
	 * The break keyword in loops.
	 * @param {BreakNode} node
	 * @param {Context} context
	 * @returns {RTResult}
	 */
	visit_BreakNode() {
		return new RTResult().successBreak();
	}

	/**
	 * Specifies the type of the value of a node.
	 * @param {TypeNode} node
	 * @param {Context} context
	 * @returns {RTResult}
	 */
	visit_TypeNode(node, context) {
		let res = new RTResult();

		if (node.nodeElement !== null) {
			let value = res.register(this.visit(node.nodeElement, context));

			if (!value) {
				return res.failure(
					new Errors.IllegalCharError(
						node.posStart,
						node.posEnd,
						`Cannot read '${node.nodeElement.varNameTok.value}' of null`
					)
				);
			}

			return res.success(new Type(value.constructor.name));
		} else if (node.typeTok !== null) {
			return res.success(new Type(node.typeTok.value));
		} else {
			return res.failure(
				new Errors.InvalidSyntaxError(
					node.posStart,
					node.posEnd,
					"Invalid element"
				)
			);
		}
	}
}

export default Interpreter;
