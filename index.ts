import load from "./load";
import init from "./init";
import highlight from "./highlight";
import shell from "./shell";
import chalk from "chalk";

const option = process.argv[2];
const args = process.argv.slice(3);

const Options = Object.freeze({
	SHELL: undefined,
	LOAD: "load",
	INIT: "init",
	HIGHLIGHT: "highlight",
});

switch (option) {
	case Options.SHELL: {
		shell();
		break;
	}

	case Options.LOAD: {
		load(args[0]);
		break;
	}

	case Options.INIT: {
		init(args);
		break;
	}

	case Options.HIGHLIGHT: {
		highlight(args[0]);
		break;
	}

	default: {
		console.log(chalk.red("\u2718 ") + `Invalid option '${option}'.`);
		break;
	}
}
