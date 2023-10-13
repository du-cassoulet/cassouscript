export function getattr(
	obj: { [key: string]: Function },
	prop: string,
	defaultValue: any = null
) {
	if (prop in obj) {
		const val = obj[prop];
		if (typeof val === "function") return val.bind(obj);
		return val;
	}

	if (defaultValue) return defaultValue;

	throw new TypeError(`"${obj}" object has no attribute "${prop}"`);
}
