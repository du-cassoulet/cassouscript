import Position from "./Classes/Position.js";

/**
 * @param {any} obj
 * @param {string} prop
 * @param {Function} defaultValue
 * @returns {any}
 */
export function getattr(obj, prop, defaultValue = null) {
	if (prop in obj) {
		let val = obj[prop];
		if (typeof val === "function") return val.bind(obj);
		return val;
	}

	if (arguments.length > 2) return defaultValue;

	throw new TypeError(`"${obj}" object has no attribute "${prop}"`);
}

/**
 * Display an error message with arrows pointing to the error.
 * @param {string} text
 * @param {Position} posStart
 * @param {Position} posEnd
 * @returns {string}
 */
export function stringWithArrows(text, posStart, posEnd) {
	let result = "";
	let idxStart = Math.max(text.lastIndexOf("\n", posStart.idx), 0);
	let idxEnd = text.indexOf("\n", idxStart + 1);

	if (idxEnd < 0) idxEnd = text.length;
	let lineCount = posEnd.ln - posStart.ln + 1;

	for (let i = 0; i < lineCount; i++) {
		let line = text.substring(idxStart, idxEnd);
		let colStart;

		if (i === 0) {
			colStart = posStart.col;
		} else {
			colStart = 0;
		}

		let colEnd;
		if (i === lineCount - 1) {
			colEnd = posEnd.col;
		} else {
			colEnd = line.length - 1;
		}

		result += line + "\n";
		result += " ".repeat(colStart);
		result += "^".repeat(colEnd - colStart);
		idxStart = idxEnd;
		idxEnd = text.indexOf("\n", idxStart + 1);
		if (idxEnd < 0) idxEnd = text.length;
	}

	return result;
}
