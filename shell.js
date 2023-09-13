import PromptSync from "prompt-sync";
import { run } from "./index.js";

const prompt = PromptSync({ sigint: true });

while (true) {
	let text = prompt("Csc >> ");
	if (text.trim() === "") continue;
	let [result, error] = run("<stdin>", text);

	if (error) {
		console.log(error.asString());
	} else if (result) {
		if (result.elements.length === 1) {
			console.log(result.elements[0].toString());
		} else {
			console.log(result.toString());
		}
	}
}
