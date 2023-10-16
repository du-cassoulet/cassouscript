import BuiltInFunction from "../Interpreter/BuiltInFunction";
import Dictionary from "../Interpreter/Dictionary";

export default new Dictionary({
	get: BuiltInFunction.get_request,
	post: BuiltInFunction.post_request,
	put: BuiltInFunction.put_request,
	delete: BuiltInFunction.delete_request,
	patch: BuiltInFunction.patch_request,
});
