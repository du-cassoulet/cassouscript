import path from "path";
import { run } from "./runner";

export default async function load(rawPath: string) {
	if (!rawPath) return console.log("You must specify a file path.");

	const filePath = path.join(path.dirname(import.meta.path), rawPath);
	const file = Bun.file(filePath);
	const exists = await file.exists();
	if (!exists) return console.log("File does not exist.");

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
