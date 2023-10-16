import fs from "fs";
import chalk from "chalk";

async function ask(
	question: string,
	regex: RegExp,
	defaultValue: string,
	errorMsg: string
) {
	process.stdout.write(`${question} (${defaultValue}): `);
	for await (const line of console) {
		if (!line) return defaultValue;
		if (!regex.test(line)) {
			console.log(errorMsg);
			process.stdout.write(`${question} (${defaultValue}): `);
			continue;
		}

		return line;
	}
}

export default async function init(options: string[]) {
	const defaultName = import.meta.dir
		.slice(import.meta.dir.lastIndexOf("/") + 1)
		.replace(/-/g, " ")
		.replace(/(?:^|\s)\S/g, (a) => a.toUpperCase())
		.replace(/\s/g, "");

	const defaultVersion = "1.0.0";

	if (options.includes("-y") || options.includes("--yes")) {
		return fs.writeFileSync(
			".config",
			`@name ${defaultName};\n@version ${defaultVersion};`,
			"utf-8"
		);
	} else {
		const name = await (<Promise<string>>(
			ask(
				chalk.blue("\u2022") + " Project name",
				/^[a-zA-Z0-9_-]+$/,
				defaultName,
				"The project name should only include letters, numbers, '_' and '-'."
			)
		));

		const version = await (<Promise<string>>(
			ask(
				chalk.blue("\u2022") + " Project version",
				/^[0-9]+\.[0-9]+\.[0-9]+$/,
				defaultVersion,
				"The project version should be in the format 'x.x.x'."
			)
		));

		fs.writeFileSync(
			".config",
			`@name ${name};\n@version ${version};`,
			"utf-8"
		);
	}

	return console.log(chalk.green("\u2714 ") + "Config file created.");
}
