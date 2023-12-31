import chalk from "chalk";
import Context from "../Context";
import { RTError } from "../Errors";
import Position from "../Position";
import Number from "./Number";
import Value from "./Value";

export default class List extends Value {
	public static methods: { [key: string]: any } = {
		size: (list: List) => new Number(list.elements.length),
	};

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
						"Index out of range",
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

	public toString(tabNum: number = 0) {
		if (this.elements.length === 0) return chalk.black("[]");

		return (
			chalk.black("[") +
			"\n" +
			this.elements
				.map((e) => " ".repeat(tabNum + 2) + e.toString(tabNum + 2))
				.join(chalk.black(",") + "\n") +
			"\n" +
			" ".repeat(tabNum) +
			chalk.black("]")
		);
	}
}
