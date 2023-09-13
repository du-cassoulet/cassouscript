import Position from "./Position.js";
import SymbolTable from "./SymbolTable.js";

class Context {
	/**
	 * Building the block context, where the variables and else will be displayed.
	 * @param {string} displayName
	 * @param {Context | null} parent
	 * @param {Position | null} parentEntryPos
	 * @param {SymbolTable | null} symbolTable
	 */
	constructor(
		displayName,
		parent = null,
		parentEntryPos = null,
		symbolTable = null
	) {
		this.displayName = displayName;
		this.parent = parent;
		this.parentEntryPos = parentEntryPos;
		this.symbolTable = symbolTable;
	}
}

export default Context;
