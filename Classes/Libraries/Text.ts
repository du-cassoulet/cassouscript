import BuiltInFunction from "../Interpreter/BuiltInFunction";
import Dictionary from "../Interpreter/Dictionary";
import String from "../Interpreter/String";

export default new Dictionary({
	alphabet: new Dictionary({
		lower: new String("abcdefghijklmnopqrstuvwxyz"),
		upper: new String("ABCDEFGHIJKLMNOPQRSTUVWXYZ"),
	}),
	numbers: new String("0123456789"),
	upper: BuiltInFunction.upper_text,
	lower: BuiltInFunction.lower_text,
	cap: BuiltInFunction.cap_text,
	trim: BuiltInFunction.trim_text,
});
