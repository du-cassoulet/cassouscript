import chalk from "chalk";
import Value from "./Value";
import BuiltInFunction from "./BuiltInFunction";

export default class Dictionary extends Value {
	public static std = new Dictionary({
		log: BuiltInFunction.log,
		ask: BuiltInFunction.ask,
	});

	public entries: { [key: string]: any };

	constructor(entries: { [key: string]: any }) {
		super();
		this.entries = entries;
	}

	public isTrue() {
		return Object.keys(this.entries).length > 0;
	}

	public copy() {
		const copy = new Dictionary({ ...this.entries });
		copy.setPos(this.posStart, this.posEnd);
		copy.setContext(this.context);

		return copy;
	}

	public toString(tabNum: number = 0) {
		if (Object.keys(this.entries).length === 0) return chalk.black("{}");

		return (
			chalk.black("{") +
			"\n" +
			Object.entries(this.entries)
				.map(
					([key, value]) =>
						" ".repeat(tabNum + 2) +
						key +
						chalk.black(":") +
						" " +
						value.toString(tabNum + 2)
				)
				.join(chalk.black(",") + "\n") +
			"\n" +
			" ".repeat(tabNum) +
			chalk.black("}")
		);
	}
}
