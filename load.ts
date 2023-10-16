import path from "path";
import { run } from "./runner";
import chalk from "chalk";
import Config from "./Classes/Config";

export default async function load(rawPath: string) {
	if (!rawPath)
		return console.log(chalk.red("\u2718 ") + "You must specify a file path.");

	let filePath = path.join(path.dirname(import.meta.path), rawPath);
	const config = new Config(path.join(path.dirname(filePath), ".config"));
	if (config.error) return console.log(config.error);

	let file = Bun.file(filePath);
	if (!(await file.exists()) && !path.extname(filePath)) {
		filePath += "." + config.extension;
		file = Bun.file(filePath);
	}

	if (!(await file.exists()))
		return console.log(chalk.red("\u2718 ") + `File '${filePath}' not found.`);

	const ftxt = await file.text();
	if (!ftxt) return;

	const { error } = await run(
		path.dirname(filePath),
		path.basename(filePath),
		ftxt,
		true
	);

	if (error) console.log(error.toString());
}
