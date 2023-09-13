import List from "./List.js";
import Value from "./Value.js";

class Object extends Value {
	/**
	 * @param {List[]} elements
	 */
	constructor(elements) {
		super();
		this.elements = elements;
	}

	copy() {
		let copy = new Object([...this.elements]);
		copy.setPos(this.posStart, this.posEnd);
		copy.setContext(this.context);
		return copy;
	}

	/**
	 * @param {Value} other
	 * @returns {[Value, Errors.BaseError]}
	 */
	addedTo(other) {
		if (other instanceof Object) {
			return [new Object([...this.elements, ...other.elements]), null];
		} else {
			return [null, this.illegalOperation(this.posStart, this.posEnd)];
		}
	}

	/**
	 * @param {number} tabNum
	 * @returns {string}
	 */
	toString(tabNum = 0) {
		let tab = "";
		for (let i = 0; i < tabNum; i++) tab += " ";

		if (this.elements.length === 0) {
			return "{}".gray;
		}

		return (
			"{".gray +
			"\n" +
			this.elements
				.map((e) => {
					return (
						"  " +
						tab +
						"'".green +
						e.elements[0].toString().green +
						"'".green +
						": ".gray +
						e.elements[1].toString(tabNum + 2)
					);
				})
				.join(",\n") +
			"\n" +
			tab +
			"}".gray
		);
	}
}

export default Object;
