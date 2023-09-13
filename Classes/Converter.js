import Boolean from "./Interpreter/Boolean.js";
import List from "./Interpreter/List.js";
import Number from "./Interpreter/Number.js";
import ObjClass from "./Interpreter/Object.js";
import String from "./Interpreter/String.js";
import Void from "./Interpreter/Void.js";

class Converter {
	constructor() {
		this.traversedProps = new Set();
	}

	/**
	 * Translates any values to a node object.
	 * @param {any} value
	 * @returns {any}
	 */
	valueToNode(value) {
		switch (typeof value) {
			case "string":
				return new String(value);

			case "number":
				return new Number(value);

			case "boolean":
				return new Boolean(value);

			case "object":
				return this.JSONToNodes(value);

			default:
				return new Void(null);
		}
	}

	/**
	 * Translates any JSON values to a node object.
	 * @param {any} json
	 * @returns {any}
	 */
	JSONToNodes(json) {
		let elements = [];
		if (this.traversedProps.has(json)) return new List([]);
		this.traversedProps.add(json);

		if (json instanceof Array) {
			if (json)
				json.forEach((value) => {
					switch (typeof value) {
						case "string":
							elements.push(new String(value));
							break;

						case "number":
							elements.push(new Number(value));
							break;

						case "boolean":
							elements.push(new Boolean(value));
							break;

						case "object":
							elements.push(this.JSONToNodes(value));
							break;

						default:
							elements.push(new Void(null));
					}
				});

			var obj = new List(elements);
		} else {
			if (json) {
				Object.entries(json).forEach(([key, value]) => {
					switch (typeof value) {
						case "string":
							elements.push(new List([key, new String(value)]));
							break;

						case "number":
							elements.push(new List([key, new Number(value)]));
							break;

						case "boolean":
							elements.push(new List([key, new Boolean(value)]));
							break;

						case "object":
							elements.push(new List([key, this.JSONToNodes(value)]));
							break;

						default:
							elements.push(new List([key, new Void(null)]));
					}
				});
			}

			var obj = new ObjClass(elements);
		}

		return obj;
	}

	/**
	 * Translates any node to a JSON object.
	 * @param {any} node
	 * @returns {any}
	 */
	nodeToValue(node) {
		if (node === undefined) return undefined;

		if (node instanceof ObjClass) {
			let obj = {};
			node.elements.forEach((e) => {
				if (e.elements) {
					obj[e.elements[0]] = this.nodeToValue(e.elements[1]);
				} else {
					obj[e[0]] = this.nodeToValue(e[1]);
				}
			});
			return obj;
		} else if (node instanceof List) {
			if (node.elements) {
				return node.elements.map(this.nodeToValue);
			} else {
				return node.map(this.nodeToValue);
			}
		} else {
			return node.value;
		}
	}
}

export default Converter;
