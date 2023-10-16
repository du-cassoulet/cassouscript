import fs from "fs";
import path from "path";
import chalk from "chalk";
import Config from "./Classes/Config";

export function formatJSON(
	jsonData: string,
	entries: { [key: string]: string }
) {
	const regex = new RegExp(`%(${Object.keys(entries).join("|")})%`, "g");
	return jsonData.replace(regex, (_, key) => entries[key]);
}

export function copyDir(dirPath: string, destPath: string, config: Config) {
	if (!fs.existsSync(destPath)) {
		fs.mkdirSync(destPath);
	}

	const files = fs.readdirSync(dirPath);

	files.forEach((file) => {
		const filePath = path.join(dirPath, file);
		const destFilePath = path.join(destPath, file);

		if (fs.lstatSync(filePath).isDirectory()) {
			if (!fs.existsSync(destFilePath)) {
				fs.mkdirSync(destFilePath);
			}

			copyDir(filePath, destFilePath, config);
		} else {
			const fileContent = fs.readFileSync(filePath, "utf8");

			fs.writeFileSync(
				destFilePath,
				formatJSON(fileContent, { ...config.keywords, EXT: config.extension }),
				"utf8"
			);
		}
	});
}

export default function highlight(dest: string) {
	if (!fs.existsSync(dest)) {
		return console.log(
			chalk.red("\u2718 ") + "Destination folder does not exist"
		);
	}

	const curDir = path.dirname(import.meta.path);
	const inDir = path.join(curDir, "extension");
	const outDir = path.join(dest, "cassouscript");
	const config = new Config(path.join(curDir, ".config"));

	copyDir(inDir, outDir, config);

	console.log(
		chalk.green("\u2714 ") + "Successfully updated the language extension"
	);
}
