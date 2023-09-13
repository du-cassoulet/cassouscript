import PromptSync from "prompt-sync";
import fs from "fs";
import path from "path";
import axios from "axios";
import { fileURLToPath } from "url";
import { getattr } from "../../utils";
import Errors from "../Errors";
import RTResult from "../RTResult";
import BaseFunction from "./BaseFunction";
import Number from "./Number";
import String from "./String";
import List from "./List";
import ObjectClass from "./Object";
import Void from "./Void";
import { run } from "../../index";
import Converter from "../Converter";
import PromiseClass from "./Promise";
import Function from "./Function";
import Value from "./Value";
import Modules from "../Modules";
import Context from "../Context";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prompt = PromptSync({ sigint: true });

class BuiltInFunction extends BaseFunction {
	static log = new BuiltInFunction("log");
	static ask = new BuiltInFunction("ask");
	static clear = new BuiltInFunction("clear");
	static import = new BuiltInFunction("import");
	static random = new BuiltInFunction("random");
	static round = new BuiltInFunction("round");
	static floor = new BuiltInFunction("floor");
	static ceil = new BuiltInFunction("ceil");
	static join = new BuiltInFunction("join");
	static size = new BuiltInFunction("size");
	static integer = new BuiltInFunction("integer");
	static float = new BuiltInFunction("float");
	static string = new BuiltInFunction("string");
	static fetch = new BuiltInFunction("fetch");
	static waitfor = new BuiltInFunction("waitfor");
	static timeout = new BuiltInFunction("timeout");
	static keys = new BuiltInFunction("keys");
	static values = new BuiltInFunction("values");
	static entries = new BuiltInFunction("entries");

	/**
	 *
	 * @param {string} name
	 */
	constructor(name) {
		super(name);

		this.args_log = ["value"];
		this.args_ask = ["value"];
		this.args_clear = [];
		this.args_import = ["fn"];
		this.args_random = [];
		this.args_round = ["value"];
		this.args_floor = ["value"];
		this.args_ceil = ["value"];
		this.args_join = ["join", "array"];
		this.args_size = ["element"];
		this.args_integer = ["val"];
		this.args_float = ["val"];
		this.args_string = ["val"];
		this.args_fetch = ["request"];
		this.args_waitfor = ["promises", "callback"];
		this.args_timeout = ["ms"];
		this.args_keys = ["object"];
		this.args_values = ["object"];
		this.args_entries = ["object"];
	}

	/**
	 * @param {Value} args
	 * @returns {RTResult}
	 */
	execute(args) {
		let res = new RTResult();
		let execCtx = this.generateNewContext();

		let methodName = `execute_${this.name}`;
		let methodArgs = `args_${this.name}`;
		let method = getattr(this, methodName, this.noVisitMethod);

		res.register(this.checkAndPopulateArgs(this[methodArgs], args, execCtx));
		if (res.shouldReturn()) return res;

		let returnValue = res.register(method(execCtx));
		if (res.shouldReturn()) return res;
		return res.success(returnValue);
	}

	noVisitMethod() {
		throw new Error(`No execute_${this.name} method defined`);
	}

	copy() {
		let copy = new BuiltInFunction(this.name);
		copy.setContext(this.context);
		copy.setPos(this.posStart, this.posEnd);
		return copy;
	}

	toString() {
		return `<built-in function ${this.name}>`.cyan;
	}

	/**
	 * @param {Context} execCtx
	 * @returns {RTResult}
	 */
	execute_log(execCtx) {
		console.log(execCtx.symbolTable.get("value").toString());
		return new RTResult().success(new Void(null));
	}

	/**
	 * @param {Context} execCtx
	 * @returns {RTResult}
	 */
	execute_ask(execCtx) {
		const value = execCtx.symbolTable.get("value");

		if (value instanceof String) {
			const input = prompt(value.value);
			return new RTResult().success(new String(input));
		} else {
			return new RTResult().failure(
				new Errors.TypingError(
					value.posStart,
					value.posEnd,
					"Ask value must be a string"
				)
			);
		}
	}

	/**
	 * @param {Context} execCtx
	 * @returns {RTResult}
	 */
	execute_keys(execCtx) {
		const object = execCtx.symbolTable.get("object");

		if (object instanceof ObjectClass) {
			return new RTResult().success(
				new List(object.elements.map((e) => new String(e.elements[0])))
			);
		} else {
			return new RTResult().failure(
				new Errors.TypingError(
					object.posStart,
					object.posEnd,
					"Ask value must be an object"
				)
			);
		}
	}

	/**
	 * @param {Context} execCtx
	 * @returns {RTResult}
	 */
	execute_values(execCtx) {
		const object = execCtx.symbolTable.get("object");

		if (object instanceof ObjectClass) {
			return new RTResult().success(
				new List(object.elements.map((e) => e.elements[1]))
			);
		} else {
			return new RTResult().failure(
				new Errors.TypingError(
					object.posStart,
					object.posEnd,
					"Ask value must be an object"
				)
			);
		}
	}

	/**
	 * @param {Context} execCtx
	 * @returns {RTResult}
	 */
	execute_entries(execCtx) {
		const object = execCtx.symbolTable.get("object");

		if (object instanceof ObjectClass) {
			return new RTResult().success(
				new List(
					object.elements.map(
						(e) => new List([new String(e.elements[0]), e.elements[1]])
					)
				)
			);
		} else {
			return new RTResult().failure(
				new Errors.TypingError(
					object.posStart,
					object.posEnd,
					"Ask value must be an object"
				)
			);
		}
	}

	execute_clear() {
		console.clear();
		return new RTResult().success(new Void(null));
	}

	execute_random() {
		return new RTResult().success(new Number(Math.random()));
	}

	/**
	 * @param {Context} execCtx
	 * @returns {RTResult}
	 */
	execute_round(execCtx) {
		const value = execCtx.symbolTable.get("value");

		if (value instanceof Number) {
			return new RTResult().success(new Number(Math.round(value.value)));
		} else {
			return new RTResult().failure(
				new Errors.TypingError(
					value.posStart,
					value.posEnd,
					"Ask value must be a number"
				)
			);
		}
	}

	/**
	 * @param {Context} execCtx
	 * @returns {RTResult}
	 */
	execute_floor(execCtx) {
		const value = execCtx.symbolTable.get("value");

		if (value instanceof Number) {
			return new RTResult().success(new Number(Math.floor(value.value)));
		} else {
			return new RTResult().failure(
				new Errors.TypingError(
					value.posStart,
					value.posEnd,
					"Ask value must be a number"
				)
			);
		}
	}

	/**
	 * @param {Context} execCtx
	 * @returns {RTResult}
	 */
	execute_ceil(execCtx) {
		const value = execCtx.symbolTable.get("value");

		if (value instanceof Number) {
			return new RTResult().success(new Number(Math.ceil(value.value)));
		} else {
			return new RTResult().failure(
				new Errors.TypingError(
					value.posStart,
					value.posEnd,
					"Ask value must be a number"
				)
			);
		}
	}

	/**
	 * @param {Context} execCtx
	 * @returns {RTResult}
	 */
	execute_import(execCtx) {
		let fn = execCtx.symbolTable.get("fn");

		if (!(fn instanceof String)) {
			return new RTResult().failure(
				new Errors.RTError(
					this.posStart,
					this.posEnd,
					"Argument must be a string",
					execCtx
				)
			);
		}

		if (fn.value.startsWith("@")) {
			const moduleName = fn.value.slice(1);
			const modules = new Modules();
			const module = new modules[moduleName]();

			const result = module.run();
			return new RTResult().success(result);
		} else {
			let file = path.join(__dirname, "../../", process.argv[2], fn.value);

			if (!fs.existsSync(file)) {
				file = path.join(
					__dirname,
					"../../",
					process.argv[2],
					fn.value + ".csc"
				);
			}

			if (!fs.existsSync(file)) {
				file = path.join(
					__dirname,
					"../../",
					process.argv[2],
					fn.value,
					"index.csc"
				);
			}

			try {
				const script = fs.readFileSync(file, "utf-8");
				if (file.endsWith(".json")) {
					let data = JSON.parse(script);
					let converter = new Converter();
					return new RTResult().success(converter.JSONToNodes(data));
				} else {
					let [result, error] = run(file, script);

					if (error) {
						return new RTResult().failure(
							new Errors.RTError(
								this.posStart,
								this.posEnd,
								`Failed to load script "${file}"\n${error.asString()}`,
								execCtx
							)
						);
					}

					return new RTResult().success(result);
				}
			} catch (e) {
				return new RTResult().failure(
					new Errors.RTError(
						this.posStart,
						this.posEnd,
						`Failed to load script "${file}"\n${e}`,
						execCtx
					)
				);
			}
		}
	}

	/**
	 * @param {Context} execCtx
	 * @returns {RTResult}
	 */
	execute_join(execCtx) {
		let join = execCtx.symbolTable.get("join");
		let array = execCtx.symbolTable.get("array");

		if (!(join instanceof String)) {
			return new RTResult().failure(
				new Errors.RTError(
					this.posStart,
					this.posEnd,
					"Argument must be a string",
					execCtx
				)
			);
		}

		if (!(array instanceof List)) {
			return new RTResult().failure(
				new Errors.RTError(
					this.posStart,
					this.posEnd,
					"Argument must be a list",
					execCtx
				)
			);
		}

		return new RTResult().success(
			new String(array.elements.map((e) => e.toString()).join(join.value))
		);
	}

	/**
	 * @param {Context} execCtx
	 * @returns {RTResult}
	 */
	execute_size(execCtx) {
		let element = execCtx.symbolTable.get("element");

		if (element instanceof List) {
			return new RTResult().success(new Number(element.elements.length));
		} else if (element instanceof String) {
			return new RTResult().success(new Number(element.value.length));
		} else {
			return new RTResult().failure(
				new Errors.RTError(
					this.posStart,
					this.posEnd,
					"Argument must be a list or a string",
					execCtx
				)
			);
		}
	}

	/**
	 * @param {Context} execCtx
	 * @returns {RTResult}
	 */
	execute_integer(execCtx) {
		let res = new RTResult();
		let val = execCtx.symbolTable.get("val");

		if (isNaN(parseInt(val.value))) {
			return res.success(new Void(NaN));
		}

		return res.success(new Number(parseInt(val.value)));
	}

	/**
	 * @param {Context} execCtx
	 * @returns {RTResult}
	 */
	execute_float(execCtx) {
		let res = new RTResult();
		let val = execCtx.symbolTable.get("val");

		if (isNaN(parseFloat(val.value))) {
			return res.success(new Void(NaN));
		}

		return res.success(new Number(parseFloat(val.value)));
	}

	/**
	 * @param {Context} execCtx
	 * @returns {RTResult}
	 */
	exeute_string(execCtx) {
		let val = execCtx.symbolTable.get("val");
		return new RTResult().success(new String(val.value.toString()));
	}

	/**
	 * @param {Context} execCtx
	 * @returns {RTResult}
	 */
	execute_fetch(execCtx) {
		let res = new RTResult();
		let converter = new Converter();
		let request = execCtx.symbolTable.get("request");

		let url = request.elements.find((e) => e.elements[0].value === "url")
			?.elements?.[1];
		let method = request.elements.find((e) => e.elements[0].value === "method")
			?.elements?.[1];
		let data = converter.nodeToValue(
			request.elements.find((e) => e.elements[0].value === "data")
				?.elements?.[1]
		);
		let headers = converter.nodeToValue(
			request.elements.find((e) => e.elements[0].value === "headers")
				?.elements?.[1]
		);

		if (!url) {
			return res.failure(
				new Errors.RTError(
					this.posStart,
					this.posEnd,
					"'url' argument is required",
					execCtx
				)
			);
		}

		return res.success(
			new PromiseClass(
				axios({
					url: url?.value,
					method: method?.value || "GET",
					data: data,
					headers: headers,
				})
			)
		);
	}

	/**
	 * @param {Context} execCtx
	 * @returns {RTResult}
	 */
	execute_waitfor(execCtx) {
		let res = new RTResult();
		let promises = execCtx.symbolTable.get("promises");
		let callback = execCtx.symbolTable.get("callback");

		let converter = new Converter();

		if (!(callback instanceof Function)) {
			return res.failure(
				new Errors.RTError(
					this.posStart,
					this.posEnd,
					"This value must be a function",
					execCtx
				)
			);
		}

		if (promises instanceof PromiseClass) {
			let resolveValue = new Promise((resolve) => {
				function useCallback(response) {
					if (response.constructor.prototype instanceof Value) {
						var responseData = response;
					} else {
						var responseData = converter.valueToNode(response);
					}

					let returnValue = callback.execute([responseData]);
					resolve(returnValue.value);
				}

				promises.value.then(useCallback);
			});

			return res.success(new PromiseClass(resolveValue));
		} else if (promises instanceof List) {
			let resolveValue = new Promise(async (resolve) => {
				let responses = [];
				function addCallback(response) {
					if (response.constructor.prototype instanceof Value) {
						var responseData = response;
					} else {
						var responseData = converter.valueToNode(response);
					}

					responses.push(responseData);
					if (responses.length === promises.elements.length) {
						let returnValue = callback.execute([new List(responses)]);
						resolve(returnValue.value);
					}
				}

				for (const promise of promises.elements) {
					await promise.value.then(addCallback);
				}
			});

			return res.success(new PromiseClass(resolveValue));
		} else {
			return res.failure(
				new Errors.RTError(
					this.posStart,
					this.posEnd,
					"This value must be a List or a Promise",
					execCtx
				)
			);
		}
	}

	/**
	 * @param {Context} execCtx
	 * @returns {RTResult}
	 */
	execute_timeout(execCtx) {
		let res = new RTResult();
		let ms = execCtx.symbolTable.get("ms");

		if (!(ms instanceof Number)) {
			return res.failure(
				new Errors.RTError(
					this.posStart,
					this.posEnd,
					"This value must be a number",
					execCtx
				)
			);
		}

		let promise = new Promise((resolve) => setTimeout(resolve, ms));
		return res.success(new PromiseClass(promise));
	}
}

export default BuiltInFunction;
