import Http from "./Interpreter/Modules/Http";
import Colors from "./Interpreter/Modules/Colors";
import Database from "./Interpreter/Modules/Database";
import FileSystem from "./Interpreter/Modules/FileSystem";

class Modules {
	constructor() {
		this["csc-http"] = Http;
		this["csc-colors"] = Colors;
		this["csc-database"] = Database;
		this["csc-filesystem"] = FileSystem;
	}
}

export default Modules;
