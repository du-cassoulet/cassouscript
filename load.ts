import { run } from "./index";

const filePath = process.argv[2];

if (filePath) {
	const file = Bun.file(filePath);
	const exists = await file.exists();
	if (!exists) throw new Error("File does not exist.");

	const ftxt = await file.text();
	const path = filePath.split(/\/|\\{2}/g);

	if (ftxt) {
		const { error } = run(path[path.length - 1], ftxt);

		if (error) {
			console.log(error.toString());
		}
	}
} else {
	console.log("You must specify a file path.");
}
