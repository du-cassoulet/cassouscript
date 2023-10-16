import load from "./load";
import init from "./init";
import update from "./update";
import shell from "./shell";

const option = process.argv[2];
const args = process.argv.slice(3);

const Options = Object.freeze({
	SHELL: undefined,
	LOAD: "load",
	INIT: "init",
	UPDATE: "update",
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

	case Options.UPDATE: {
		update(args[0]);
		break;
	}
}
