import { run } from "./runner";
import chalk from "chalk";

export default async function shell() {
	const prefix = chalk.black(">> ");
	process.stdout.write(prefix);
	for await (const line of console) {
		if (!line) {
			process.stdout.write(prefix);
			continue;
		}

		if (line === ".exit") break;

		const { error, value } = await run(process.cwd(), "shell", line, false);

		if (error) {
			console.log(error.toString());
			process.stdout.write(prefix);
			continue;
		} else {
			console.log(value.elements[0].toString());
			process.stdout.write(prefix);
		}
	}
}
