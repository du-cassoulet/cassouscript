import fs from "fs";
import path from "path";
import chalk from "chalk";

export default function update(dest: string) {
	if (!fs.existsSync(dest)) {
		return console.log(
			chalk.red("\u2718 ") + "Destination folder does not exist"
		);
	}

	fs.cpSync("./extension", path.join(dest, "cassouscript"), {
		recursive: true,
	});

	console.log(
		chalk.green("\u2714 ") + "Successfully updated the language extension !"
	);
}
