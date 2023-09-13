import chalk from "chalk";
import Context from "../Context";
import { RTError } from "../Errors";
import Position from "../Position";
import Number from "./Number";
import Value from "./Value";

export default class List extends Value {
	public elements: Value[];

	constructor(elements: Value[]) {
		super();
		this.elements = elements;
	}

	public addedTo(other: Value): any {
		const newList = this.copy();
		newList.elements.push(other);

		return [newList, null];
	}

	public subbedBy(other: Value): any {
		if (other instanceof Number) {
			let newList = this.copy();
			try {
				newList.elements.splice(other.value, 1);
				return [newList, null];
			} catch {
				return [
					null,
					new RTError(
						<Position>other.posStart,
						<Position>other.posEnd,
						"<ERROR>",
						<Context>this.context
					),
				];
			}
		} else {
			return [null, this.illegalOperation(other)];
		}
	}

	public isTrue() {
		return this.elements.length > 0;
	}

	public copy() {
		const copy = new List([...this.elements]);
		copy.setPos(this.posStart, this.posEnd);
		copy.setContext(this.context);

		return copy;
	}

	public toString() {
		if (this.elements.length === 0) return chalk.black("[]");

		return (
			chalk.black("[") +
			this.elements.map((e) => e.toString()).join(chalk.black(", ")) +
			chalk.black("]")
		);
	}
}
