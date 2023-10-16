import Boolean from "./Classes/Interpreter/Boolean";
import Dictionary from "./Classes/Interpreter/Dictionary";
import List from "./Classes/Interpreter/List";
import Number from "./Classes/Interpreter/Number";
import String from "./Classes/Interpreter/String";
import Void from "./Classes/Interpreter/Void";

export function getattr(
	obj: { [key: string]: Function },
	prop: string,
	defaultValue: any = null
) {
	if (prop in obj) {
		const val = obj[prop];
		if (typeof val === "function") return val.bind(obj);
		return val;
	}

	if (defaultValue) return defaultValue;

	throw new TypeError(`"${obj}" object has no attribute "${prop}"`);
}

export function JSONToNodes(val: any): any {
	if (val === null) return new Void(null);
	if (typeof val === "string") return new String(val);
	if (typeof val === "number") return new Number(val);
	if (typeof val === "boolean") return new Boolean(val);
	if (Array.isArray(val)) return new List(val.map(JSONToNodes));
	if (typeof val === "object") {
		return new Dictionary(
			Object.fromEntries(
				Object.entries(val).map(([key, value]) => {
					return [key, JSONToNodes(value)];
				})
			)
		);
	}

	throw new Error("Cannot convert value");
}

export function nodesToJSON(val: any): any {
	if (val instanceof Void) return null;
	if (val instanceof String) return val.value;
	if (val instanceof Number) return val.value;
	if (val instanceof Boolean) return val.value;
	if (val instanceof List) return val.elements.map(nodesToJSON);
	if (val instanceof Dictionary) {
		return Object.fromEntries(
			Object.entries(val.entries).map(([key, value]) => {
				return [key, nodesToJSON(value)];
			})
		);
	}

	throw new Error("Cannot convert value");
}
