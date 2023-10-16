import BuiltInFunction from "../Interpreter/BuiltInFunction";
import Dictionary from "../Interpreter/Dictionary";

export default new Dictionary({
	seed: BuiltInFunction.seed_random,
	pick: BuiltInFunction.pick_random,
});
