import BuiltInFunction from "../Interpreter/BuiltInFunction";
import Dictionary from "../Interpreter/Dictionary";

export default new Dictionary({
	create: BuiltInFunction.create_file,
	write: BuiltInFunction.write_file,
	delete: BuiltInFunction.delete_file,
	exists: BuiltInFunction.exists_file,
});
