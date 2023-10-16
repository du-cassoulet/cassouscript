import BuiltInFunction from "../Interpreter/BuiltInFunction";
import Dictionary from "../Interpreter/Dictionary";
import Number from "../Interpreter/Number";

export default new Dictionary({
	pi: new Number(Math.PI),
	e: new Number(Math.E),
	tau: new Number(Math.PI * 2),
	floor: BuiltInFunction.floor_math,
	ceil: BuiltInFunction.ceil_math,
	round: BuiltInFunction.round_math,
	sin: BuiltInFunction.sin_math,
	cos: BuiltInFunction.cos_math,
	tan: BuiltInFunction.tan_math,
});
