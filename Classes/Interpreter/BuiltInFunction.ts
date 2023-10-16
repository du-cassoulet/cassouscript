import { getattr, nodesToJSON } from "../../utils";
import RTResult from "../RTResult";
import BaseFunction from "./BaseFunction";
import Void from "./Void";
import Context from "../Context";
import Value from "./Value";
import { TypingError } from "../Errors";
import Position from "../Position";
import String from "./String";
import chalk from "chalk";
import Number from "./Number";
import List from "./List";
import fs from "fs";
import Boolean from "./Boolean";
import Promise from "./Waitable";
import { JSONToNodes } from "../../utils";

export default class BuiltInFunction extends BaseFunction {
	public static log = new BuiltInFunction("log");
	public static ask = new BuiltInFunction("ask");
	public static clear = new BuiltInFunction("clear");
	public static write = new BuiltInFunction("write");
	public static sqrt = new BuiltInFunction("sqrt");
	public static upper_text = new BuiltInFunction("upper_text");
	public static lower_text = new BuiltInFunction("lower_text");
	public static cap_text = new BuiltInFunction("cap_text");
	public static floor_math = new BuiltInFunction("floor_math");
	public static ceil_math = new BuiltInFunction("ceil_math");
	public static round_math = new BuiltInFunction("round_math");
	public static seed_random = new BuiltInFunction("seed_random");
	public static pick_random = new BuiltInFunction("pick_random");
	public static trim_text = new BuiltInFunction("trim_text");
	public static create_file = new BuiltInFunction("create_file");
	public static write_file = new BuiltInFunction("write_file");
	public static delete_file = new BuiltInFunction("delete_file");
	public static exists_file = new BuiltInFunction("exists_file");
	public static get_request = new BuiltInFunction("get_request");
	public static post_request = new BuiltInFunction("post_request");
	public static put_request = new BuiltInFunction("put_request");
	public static patch_request = new BuiltInFunction("patch_request");
	public static delete_request = new BuiltInFunction("delete_request");
	public static sin_math = new BuiltInFunction("sin_math");
	public static cos_math = new BuiltInFunction("cos_math");
	public static tan_math = new BuiltInFunction("tan_math");
	public static color = new BuiltInFunction("color");

	public args_log = ["value"];
	public args_ask = ["value"];
	public args_clear = [];
	public args_write = ["value"];
	public args_sqrt = ["value"];
	public args_upper_text = ["value"];
	public args_lower_text = ["value"];
	public args_cap_text = ["value"];
	public args_floor_math = ["value"];
	public args_ceil_math = ["value"];
	public args_round_math = ["value"];
	public args_seed_random = [];
	public args_pick_random = ["list"];
	public args_trim_text = ["value"];
	public args_create_file = ["path"];
	public args_write_file = ["path", "content"];
	public args_delete_file = ["path"];
	public args_exists_file = ["path"];
	public args_get_request = ["url"];
	public args_post_request = ["url", "body"];
	public args_put_request = ["url", "body"];
	public args_patch_request = ["url", "body"];
	public args_delete_request = ["url"];
	public args_sin_math = ["value"];
	public args_cos_math = ["value"];
	public args_tan_math = ["value"];
	public args_color = ["color", "value"];

	constructor(name: string) {
		super(name);
	}

	// @ts-ignore
	public async execute(args: Value[]) {
		const res = new RTResult();
		const execCtx = this.generateNewContext();

		const methodName = `execute_${this.name}`;
		const methodArgs = `args_${this.name}`;
		const method = getattr(<{}>this, methodName, this.noVisitMethod);

		// @ts-ignore
		res.register(this.checkAndPopulateArgs(this[methodArgs], args, execCtx));
		if (res.shouldReturn()) return res;

		const returnValue = res.register(await method(execCtx));
		if (res.shouldReturn()) return res;
		return res.success(returnValue);
	}

	public noVisitMethod() {
		throw new Error(`No execute_${this.name} method defined`);
	}

	public copy() {
		const copy = new BuiltInFunction(this.name);
		copy.setContext(this.context);
		copy.setPos(this.posStart, this.posEnd);

		return copy;
	}

	public toString() {
		return chalk.blue(`<built-in function ${this.name}>`);
	}

	public execute_log(execCtx: Context) {
		console.log(execCtx.symbolTable?.get("value").toString());
		return new RTResult().success(new Void(null));
	}

	public async execute_ask(execCtx: Context) {
		const res = new RTResult();
		const value = execCtx.symbolTable?.get("value");

		if (!(value instanceof String)) {
			return res.failure(
				new TypingError(
					<Position>this.posStart,
					<Position>this.posEnd,
					"The value should be a string"
				)
			);
		}

		let response = "";
		process.stdout.write(value.value);
		for await (const line of console) {
			response = line;
			break;
		}

		return res.success(new String(response));
	}

	public execute_clear() {
		console.clear();
		return new RTResult().success(new Void(null));
	}

	public execute_write(execCtx: Context) {
		const res = new RTResult();
		const value = execCtx.symbolTable?.get("value");

		process.stdout.write(value.toString());
		return res.success(new Void(null));
	}

	public execute_sqrt(execCtx: Context) {
		const res = new RTResult();
		const value = execCtx.symbolTable?.get("value");

		if (!(value instanceof Number)) {
			return res.failure(
				new TypingError(
					<Position>this.posStart,
					<Position>this.posEnd,
					"The value should be a number"
				)
			);
		}

		return res.success(new Number(Math.sqrt(value.value)));
	}

	public execute_upper_text(execCtx: Context) {
		const res = new RTResult();
		const value = execCtx.symbolTable?.get("value");

		if (!(value instanceof String)) {
			return res.failure(
				new TypingError(
					<Position>this.posStart,
					<Position>this.posEnd,
					"The value should be a string"
				)
			);
		}

		return res.success(new String(value.value.toUpperCase()));
	}

	public execute_lower_text(execCtx: Context) {
		const res = new RTResult();
		const value = execCtx.symbolTable?.get("value");

		if (!(value instanceof String)) {
			return res.failure(
				new TypingError(
					<Position>this.posStart,
					<Position>this.posEnd,
					"The value should be a string"
				)
			);
		}

		return res.success(new String(value.value.toLowerCase()));
	}

	public execute_cap_text(execCtx: Context) {
		const res = new RTResult();
		const value = execCtx.symbolTable?.get("value");

		if (!(value instanceof String)) {
			return res.failure(
				new TypingError(
					<Position>this.posStart,
					<Position>this.posEnd,
					"The value should be a string"
				)
			);
		}

		return res.success(
			new String(
				value.value.replace(/(?:^|[.?!]\s+)\w/g, (c) => c.toUpperCase())
			)
		);
	}

	public execute_floor_math(execCtx: Context) {
		const res = new RTResult();
		const value = execCtx.symbolTable?.get("value");

		if (!(value instanceof Number)) {
			return res.failure(
				new TypingError(
					<Position>this.posStart,
					<Position>this.posEnd,
					"The value should be a number"
				)
			);
		}

		return res.success(new Number(Math.floor(value.value)));
	}

	public execute_ceil_math(execCtx: Context) {
		const res = new RTResult();
		const value = execCtx.symbolTable?.get("value");

		if (!(value instanceof Number)) {
			return res.failure(
				new TypingError(
					<Position>this.posStart,
					<Position>this.posEnd,
					"The value should be a number"
				)
			);
		}

		return res.success(new Number(Math.ceil(value.value)));
	}

	public execute_round_math(execCtx: Context) {
		const res = new RTResult();
		const value = execCtx.symbolTable?.get("value");

		if (!(value instanceof Number)) {
			return res.failure(
				new TypingError(
					<Position>this.posStart,
					<Position>this.posEnd,
					"The value should be a number"
				)
			);
		}

		return res.success(new Number(Math.round(value.value)));
	}

	public execute_seed_random() {
		return new RTResult().success(new Number(Math.random()));
	}

	public execute_pick_random(execCtx: Context) {
		const res = new RTResult();
		const list = execCtx.symbolTable?.get("list");

		if (!(list instanceof List)) {
			return res.failure(
				new TypingError(
					<Position>this.posStart,
					<Position>this.posEnd,
					"The list should be a list"
				)
			);
		}

		return res.success(
			list.elements[Math.floor(Math.random() * list.elements.length)]
		);
	}

	public execute_trim_text(execCtx: Context) {
		const res = new RTResult();
		const value = execCtx.symbolTable?.get("value");

		if (!(value instanceof String)) {
			return res.failure(
				new TypingError(
					<Position>this.posStart,
					<Position>this.posEnd,
					"The value should be a string"
				)
			);
		}

		return res.success(new String(value.value.trim()));
	}

	public execute_create_file(execCtx: Context) {
		const res = new RTResult();
		const path = execCtx.symbolTable?.get("path");

		if (!(path instanceof String)) {
			return res.failure(
				new TypingError(
					<Position>this.posStart,
					<Position>this.posEnd,
					"The path should be a string"
				)
			);
		}

		fs.appendFileSync(path.value, "");

		return res.success(new Void(null));
	}

	public execute_write_file(execCtx: Context) {
		const res = new RTResult();
		const path = execCtx.symbolTable?.get("path");
		const content = execCtx.symbolTable?.get("content");

		if (!(path instanceof String)) {
			return res.failure(
				new TypingError(
					<Position>this.posStart,
					<Position>this.posEnd,
					"The path should be a string"
				)
			);
		}

		if (!(content instanceof String)) {
			return res.failure(
				new TypingError(
					<Position>this.posStart,
					<Position>this.posEnd,
					"The content should be a string"
				)
			);
		}

		if (!fs.existsSync(path.value)) {
			return res.failure(
				new TypingError(
					<Position>this.posStart,
					<Position>this.posEnd,
					`No file found at path '${path.value}'`
				)
			);
		}

		fs.writeFileSync(path.value, content.value);

		return res.success(new Void(null));
	}

	public execute_delete_file(execCtx: Context) {
		const res = new RTResult();
		const path = execCtx.symbolTable?.get("path");

		if (!(path instanceof String)) {
			return res.failure(
				new TypingError(
					<Position>this.posStart,
					<Position>this.posEnd,
					"The path should be a string"
				)
			);
		}

		if (!fs.existsSync(path.value)) {
			return res.failure(
				new TypingError(
					<Position>this.posStart,
					<Position>this.posEnd,
					`No file found at path '${path.value}'`
				)
			);
		}

		fs.unlinkSync(path.value);

		return res.success(new Void(null));
	}

	public execute_exists_file(execCtx: Context) {
		const res = new RTResult();
		const path = execCtx.symbolTable?.get("path");

		if (!(path instanceof String)) {
			return res.failure(
				new TypingError(
					<Position>this.posStart,
					<Position>this.posEnd,
					"The path should be a string"
				)
			);
		}

		return res.success(new Boolean(fs.existsSync(path.value)));
	}

	public execute_get_request(execCtx: Context) {
		const res = new RTResult();
		const url = execCtx.symbolTable?.get("url");

		if (!(url instanceof String)) {
			return res.failure(
				new TypingError(
					<Position>this.posStart,
					<Position>this.posEnd,
					"The url should be a string"
				)
			);
		}

		return res.success(
			new Promise(
				(async () => {
					let content = null;
					const response = await fetch(url.value, { method: "GET" });

					if (
						response.headers.get("content-type")?.includes("application/json")
					) {
						content = await response.json();
					} else {
						content = await response.text();
					}

					return JSONToNodes({
						status: response.status,
						url: response.url,
						data: content,
					});
				})()
			)
		);
	}

	public execute_post_request(execCtx: Context) {
		const res = new RTResult();
		const url = execCtx.symbolTable?.get("url");
		const body = execCtx.symbolTable?.get("body");

		if (!(url instanceof String)) {
			return res.failure(
				new TypingError(
					<Position>this.posStart,
					<Position>this.posEnd,
					"The url should be a string"
				)
			);
		}

		return res.success(
			new Promise(
				(async () => {
					let content = null;
					const response = await fetch(url.value, {
						method: "POST",
						body: nodesToJSON(body),
					});

					if (
						response.headers.get("content-type")?.includes("application/json")
					) {
						content = await response.json();
					} else {
						content = await response.text();
					}

					return JSONToNodes({
						status: response.status,
						url: response.url,
						data: content,
					});
				})()
			)
		);
	}

	public execute_delete_request(execCtx: Context) {
		const res = new RTResult();
		const url = execCtx.symbolTable?.get("url");

		if (!(url instanceof String)) {
			return res.failure(
				new TypingError(
					<Position>this.posStart,
					<Position>this.posEnd,
					"The url should be a string"
				)
			);
		}

		return res.success(
			new Promise(
				(async () => {
					let content = null;
					const response = await fetch(url.value, {
						method: "DELETE",
					});

					if (
						response.headers.get("content-type")?.includes("application/json")
					) {
						content = await response.json();
					} else {
						content = await response.text();
					}

					return JSONToNodes({
						status: response.status,
						url: response.url,
						data: content,
					});
				})()
			)
		);
	}

	public execute_put_request(execCtx: Context) {
		const res = new RTResult();
		const url = execCtx.symbolTable?.get("url");
		const body = execCtx.symbolTable?.get("body");

		if (!(url instanceof String)) {
			return res.failure(
				new TypingError(
					<Position>this.posStart,
					<Position>this.posEnd,
					"The url should be a string"
				)
			);
		}

		return res.success(
			new Promise(
				(async () => {
					let content = null;
					const response = await fetch(url.value, {
						method: "PUT",
						body: nodesToJSON(body),
					});

					if (
						response.headers.get("content-type")?.includes("application/json")
					) {
						content = await response.json();
					} else {
						content = await response.text();
					}

					return JSONToNodes({
						status: response.status,
						url: response.url,
						data: content,
					});
				})()
			)
		);
	}

	public execute_patch_request(execCtx: Context) {
		const res = new RTResult();
		const url = execCtx.symbolTable?.get("url");
		const body = execCtx.symbolTable?.get("body");

		if (!(url instanceof String)) {
			return res.failure(
				new TypingError(
					<Position>this.posStart,
					<Position>this.posEnd,
					"The url should be a string"
				)
			);
		}

		return res.success(
			new Promise(
				(async () => {
					let content = null;
					const response = await fetch(url.value, {
						method: "PATCH",
						body: nodesToJSON(body),
					});

					if (
						response.headers.get("content-type")?.includes("application/json")
					) {
						content = await response.json();
					} else {
						content = await response.text();
					}

					return JSONToNodes({
						status: response.status,
						url: response.url,
						data: content,
					});
				})()
			)
		);
	}

	public execute_sin_math(execCtx: Context) {
		const res = new RTResult();
		const value = execCtx.symbolTable?.get("value");

		if (!(value instanceof Number)) {
			return res.failure(
				new TypingError(
					<Position>this.posStart,
					<Position>this.posEnd,
					"The value should be a number"
				)
			);
		}

		return res.success(new Number(Math.sin(value.value)));
	}

	public execute_cos_math(execCtx: Context) {
		const res = new RTResult();
		const value = execCtx.symbolTable?.get("value");

		if (!(value instanceof Number)) {
			return res.failure(
				new TypingError(
					<Position>this.posStart,
					<Position>this.posEnd,
					"The value should be a number"
				)
			);
		}

		return res.success(new Number(Math.cos(value.value)));
	}

	public execute_tan_math(execCtx: Context) {
		const res = new RTResult();
		const value = execCtx.symbolTable?.get("value");

		if (!(value instanceof Number)) {
			return res.failure(
				new TypingError(
					<Position>this.posStart,
					<Position>this.posEnd,
					"The value should be a number"
				)
			);
		}

		return res.success(new Number(Math.tan(value.value)));
	}

	public execute_color(execCtx: Context) {
		const res = new RTResult();
		const color = execCtx.symbolTable?.get("color");
		const value = execCtx.symbolTable?.get("value");

		const colors = [
			"blue",
			"green",
			"red",
			"yellow",
			"cyan",
			"magenta",
			"gray",
			"black",
			"white",
		];

		if (!(color instanceof String)) {
			return res.failure(
				new TypingError(
					<Position>this.posStart,
					<Position>this.posEnd,
					"The color should be a string"
				)
			);
		}

		if (!(value instanceof String)) {
			return res.failure(
				new TypingError(
					<Position>this.posStart,
					<Position>this.posEnd,
					"The value should be a string"
				)
			);
		}

		if (!colors.includes(color.value)) {
			return res.failure(
				new TypingError(
					<Position>this.posStart,
					<Position>this.posEnd,
					`Invalid color '${color.value}'`
				)
			);
		}

		// @ts-ignore
		const colorify = chalk[color.value];
		return res.success(new String(colorify(value.value)));
	}
}
