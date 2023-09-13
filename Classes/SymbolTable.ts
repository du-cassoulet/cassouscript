class SymbolTable {
	constructor(parent = null) {
		this.symbols = {};
		this.parent = parent;
	}

	/**
	 * To get a value from the symbol table and it's parent(s).
	 * @param {string} name
	 * @returns {any}
	 */
	get(name) {
		let value = this.symbols[name];
		if (!value && this.parent) {
			return this.parent.get(name);
		}

		return value;
	}

	/**
	 * To edit or create a value in the symbol table.
	 * @param {string} name
	 * @param {any} value
	 */
	set(name, value) {
		this.symbols[name] = value;
	}

	/**
	 * To remove an element from the symbol table.
	 * @param {string} name
	 */
	remove(name) {
		delete this.symbols[name];
	}
}

export default SymbolTable;
