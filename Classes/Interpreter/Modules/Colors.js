import colors from "colors";
import RTResult from "../../RTResult.js";
import BuiltInFunction from "../BuiltInFunction.js";
import List from "../List.js";
import ObjectClass from "../Object.js";
import String from "../String.js";

class Colors {
	constructor() {
		this.name = "csc-colors";
	}

	value_colorify() {
		BuiltInFunction.prototype.args_colorify = ["str", "color"];
		BuiltInFunction.prototype.execute_colorify = function (execCtx) {
			let str = execCtx.symbolTable.get("str");
			let color = execCtx.symbolTable.get("color");

			let newString = str.value[color.value];
			return new RTResult().success(new String(newString));
		};
	}

	run() {
		this.value_colorify();
		return new ObjectClass([
			new List(["colorify", new BuiltInFunction("colorify")]),
			new List(["styles", new List(Object.keys(colors.styles))]),
		]);
	}
}

export default Colors;
