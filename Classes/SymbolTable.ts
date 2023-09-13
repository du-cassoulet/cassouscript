export default class SymbolTable {
	public symbols: { [key: string]: any };
	public parent: SymbolTable | null;

	constructor(parent: SymbolTable | null = null) {
		this.symbols = {};
		this.parent = parent;
	}

	public get(name: string): any {
		const value = this.symbols[name];
		if (!value && this.parent) {
			return this.parent.get(name);
		}

		return value;
	}

	public has(name: string): boolean {
		const exists = name in this.symbols;
		if (!exists && this.parent) {
			return this.parent.has(name);
		}

		return exists;
	}

	public set(name: string, value: any) {
		this.symbols[name] = value;
	}

	public remove(name: string) {
		delete this.symbols[name];
	}
}
