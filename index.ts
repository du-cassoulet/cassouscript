import load from "./load";
import init from "./init";

const option = process.argv[2];
const args = process.argv.slice(3);

const Options = Object.freeze({
	LOAD: "load",
	INIT: "init",
});

switch (option) {
	case Options.LOAD: {
		load(args[0]);
		break;
	}

	case Options.INIT: {
		init(args);
		break;
	}
}
