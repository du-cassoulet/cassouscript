import { run } from "./index";
import { createInterface } from "readline";

function listen() {
	const readline = createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	readline.on("SIGINT", () => {
		readline.close();
		process.stdout.write("^C\n");
	});

	readline.question("Csc >> ", (text: string) => {
		if (text === ".exit") return readline.close();
		const { value, error } = run("<stdin>", text);

		if (error) {
			console.log(error.toString());
		} else if (value) {
			if (value.elements.length === 1) {
				console.log(value.elements[0].toString());
			} else {
				console.log(value.toString());
			}
		}

		readline.removeAllListeners("SIGINT");
		readline.close();
		return listen();
	});
}

listen();
