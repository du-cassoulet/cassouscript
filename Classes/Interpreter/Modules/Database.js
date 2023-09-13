import { QuickDB } from "quick.db";
import RTResult from "../../RTResult.js";
import BuiltInFunction from "../BuiltInFunction.js";
import List from "../List.js";
import ObjectClass from "../Object.js";
import PromiseClass from "../Promise.js";
import Converter from "../../Converter.js";

class Colors {
	constructor() {
		this.name = "csc-database";
	}

	value_get() {
		BuiltInFunction.prototype.args_get = ["path"];
		BuiltInFunction.prototype.execute_get = function (execCtx) {
			let converter = new Converter();
			let db = new QuickDB({ filePath: "./scripts/data.sqlite" });
			let path = execCtx.symbolTable.get("path");

			let prom = new Promise(async (resolve) => {
				const res = await db.get(path.value);
				resolve(converter.valueToNode(res));
			});

			return new RTResult().success(new PromiseClass(prom));
		};
	}

	value_set() {
		BuiltInFunction.prototype.args_set = ["path", "val"];
		BuiltInFunction.prototype.execute_set = function (execCtx) {
			let converter = new Converter();
			let db = new QuickDB({ filePath: "./scripts/data.sqlite" });
			let path = execCtx.symbolTable.get("path");
			let val = execCtx.symbolTable.get("val");

			let prom = new Promise(async (resolve) => {
				const res = await db.set(path.value, val.value);
				resolve(converter.valueToNode(res));
			});

			return new RTResult().success(new PromiseClass(prom));
		};
	}

	value_add() {
		BuiltInFunction.prototype.args_add = ["path", "val"];
		BuiltInFunction.prototype.execute_add = function (execCtx) {
			let converter = new Converter();
			let db = new QuickDB({ filePath: "./scripts/data.sqlite" });
			let path = execCtx.symbolTable.get("path");
			let val = execCtx.symbolTable.get("val");

			let prom = new Promise(async (resolve) => {
				const res = await db.add(path.value, val.value);
				resolve(converter.valueToNode(res));
			});

			return new RTResult().success(new PromiseClass(prom));
		};
	}

	value_push() {
		BuiltInFunction.prototype.args_push = ["path", "val"];
		BuiltInFunction.prototype.execute_push = function (execCtx) {
			let converter = new Converter();
			let db = new QuickDB({ filePath: "./scripts/data.sqlite" });
			let path = execCtx.symbolTable.get("path");
			let val = execCtx.symbolTable.get("val");

			let prom = new Promise(async (resolve) => {
				const res = await db.push(path.value, val.value);
				resolve(converter.valueToNode(res));
			});

			return new RTResult().success(new PromiseClass(prom));
		};
	}

	value_pull() {
		BuiltInFunction.prototype.args_pull = ["path", "val"];
		BuiltInFunction.prototype.execute_pull = function (execCtx) {
			let converter = new Converter();
			let db = new QuickDB({ filePath: "./scripts/data.sqlite" });
			let path = execCtx.symbolTable.get("path");
			let val = execCtx.symbolTable.get("val");

			let prom = new Promise(async (resolve) => {
				const res = await db.pull(path.value, val.value);
				resolve(converter.valueToNode(res));
			});

			return new RTResult().success(new PromiseClass(prom));
		};
	}

	value_all() {
		BuiltInFunction.prototype.args_all = [];
		BuiltInFunction.prototype.execute_all = function () {
			let converter = new Converter();
			let db = new QuickDB({ filePath: "./scripts/data.sqlite" });

			let prom = new Promise(async (resolve) => {
				const res = await db.all();
				resolve(converter.valueToNode(res));
			});

			return new RTResult().success(new PromiseClass(prom));
		};
	}

	run() {
		this.value_get();
		this.value_set();
		this.value_add();
		this.value_push();
		this.value_pull();
		this.value_all();

		return new ObjectClass([
			new List(["get", new BuiltInFunction("get")]),
			new List(["set", new BuiltInFunction("set")]),
			new List(["add", new BuiltInFunction("add")]),
			new List(["push", new BuiltInFunction("push")]),
			new List(["pull", new BuiltInFunction("pull")]),
			new List(["all", new BuiltInFunction("all")]),
		]);
	}
}

export default Colors;
