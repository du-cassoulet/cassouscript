import path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const EXT_PATH = "C:\\Users\\casso\\.vscode\\extensions";

const source = path.join(__dirname, "csc");
const destination = path.join(EXT_PATH, "cassouscript");

if (!fs.existsSync(destination)) {
	fs.mkdirSync(destination);
}

fs.copySync(source, destination);

console.log("Successfully exported the language highlight settings.");
