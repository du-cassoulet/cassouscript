import fs from "fs";
import { run } from "./index.js";
import path from "path";
import { fileURLToPath } from "url";

const file = process.argv[2];
const __dirname = path.dirname(fileURLToPath(import.meta.url));

let code = null;

if (
	fs.lstatSync(path.join(__dirname, file)).isFile() &&
	fs.existsSync(path.join(__dirname, file))
) {
	code = fs.readFileSync(path.join(__dirname, file), "utf-8");
} else if (
	fs.lstatSync(path.join(__dirname, file)).isFile() &&
	fs.existsSync(path.join(__dirname, file) + ".csc")
) {
	code = fs.readFileSync(path.join(__dirname, file) + ".csc", "utf-8");
} else if (
	fs.lstatSync(path.join(__dirname, file)).isDirectory() &&
	fs.existsSync(path.join(__dirname, file, "index.csc"))
) {
	code = fs.readFileSync(path.join(__dirname, file, "index.csc"), "utf-8");
}

if (!code && code !== "") throw new Error("Invalid file");
let [_, error] = run(file, code);

if (error) {
	console.log(error.asString());
}
