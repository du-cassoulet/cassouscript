import fs from "fs";
import ObjectClass from "../Object.js";
import List from "../List.js";
import BuiltInFunction from "../BuiltInFunction.js";
import RTResult from "../../RTResult.js";
import Void from "../Void.js";
import path from "path";
import { fileURLToPath } from "url";
import String from "../String.js";

const __dirname = path.dirname(
	path.join(fileURLToPath(import.meta.url), "../../../")
);

class FileSystem {
	constructor() {
		this.name = "csc-filesystem";
	}

	value_writeFile() {
		BuiltInFunction.prototype.args_writeFile = [
			"fileName",
			"value",
			"encodage",
		];
		BuiltInFunction.prototype.execute_writeFile = function (execCtx) {
			const fileName = execCtx.symbolTable.get("fileName");
			const value = execCtx.symbolTable.get("value");
			const encodage = execCtx.symbolTable.get("encodage");

			fs.writeFileSync(
				path.join(__dirname, process.argv[2], fileName.value),
				value.value,
				encodage.value
			);
			return new RTResult().success(new Void(null));
		};
	}

	value_readFile() {
		BuiltInFunction.prototype.args_readFile = ["fileName", "encodage"];
		BuiltInFunction.prototype.execute_readFile = function (execCtx) {
			const fileName = execCtx.symbolTable.get("fileName");
			const encodage = execCtx.symbolTable.get("encodage");

			const value = fs.readFileSync(
				path.join(__dirname, process.argv[2], fileName.value),
				encodage.value
			);
			return new RTResult().success(new String(value));
		};
	}

	run() {
		this.value_writeFile();
		this.value_readFile();

		return new ObjectClass([
			new List(["writeFile", new BuiltInFunction("writeFile")]),
			new List(["readFile", new BuiltInFunction("readFile")]),
		]);
	}
}

export default FileSystem;
