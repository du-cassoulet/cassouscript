import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Keywords from "../Constants/Keywords.js";

const __dirname = path.dirname(
	path.join(fileURLToPath(import.meta.url), "../")
);

class ParserOptions {
	constructor() {
		this.configPath = path.join(__dirname, process.argv[2], ".cscconfig");
	}

	readKeywords() {
		let data = {};

		for (const keyword of Keywords) {
			data[keyword] = keyword;
		}

		if (fs.existsSync(this.configPath)) {
			const configTxt = fs.readFileSync(this.configPath, "utf-8");

			if (configTxt === "") return data;

			for (const line of configTxt.split(/\r?\n/)) {
				if (line.startsWith(">>")) continue;

				const { 1: keyword, 2: value } = line.match(
					/^KEYWORDS:(.*)\s*=\s*\"(.*)\"$/
				);

				data[keyword] = value;
			}
		}

		return data;
	}
}

export default ParserOptions;
