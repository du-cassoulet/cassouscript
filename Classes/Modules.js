import Http from "./Interpreter/Modules/Http.js";
import Colors from "./Interpreter/Modules/Colors.js";
import Database from "./Interpreter/Modules/Database.js";
import FileSystem from "./Interpreter/Modules/FileSystem.js";

class Modules {
	constructor() {
		this["csc-http"] = Http;
		this["csc-colors"] = Colors;
		this["csc-database"] = Database;
		this["csc-filesystem"] = FileSystem;
	}
}

export default Modules;
