import fs from "fs";
import Keywords from "../Constants/Keywords";
import Rules from "../Constants/Rules";

const NAME_REGEX = /^@name(?:\n|\s)+(?<value>[a-zA-Z0-9_-]+)$/;

const VERSION_REGEX = /^@version(?:\n|\s)+(?<value>[0-9]+(?:\.[0-9]+)*)$/;

const DESCRIPTION_REGEX = /^@description(?:\n|\s)+(?<value>.+)$/;

const KEYWORD_REGEX =
	/^@keyword(?:\n|\s)+(?<name>[A-Z]+)(?:\n|\s)*(?<value>[a-zA-Z][a-zA-Z0-9]*)$/;

const ROLE_REGEX =
	/^@rule(?:\n|\s)+(?<name>[A-Z_]+)(?:\n|\s)*(?<value>o(?:n|ff))$/;

export interface Package {
	name?: string;
	version?: string;
	description?: string;
}

export default class Config {
	private path: string;

	public keywords: { [key: string]: string };
	public rules: { [key: string]: boolean };
	public package: Package = {};

	constructor(path: string) {
		this.path = path;
		this.keywords = { ...Keywords };
		this.rules = { ...Rules };

		this.load();
	}

	private load() {
		const raw = fs.readFileSync(this.path, "utf-8");
		const declarations = raw.split(/(?<!\\);+/g);

		declarations.forEach((rawDeclaration) => {
			const declaration = rawDeclaration.trim();
			if (!declaration) return;

			if (NAME_REGEX.test(declaration)) {
				const match = declaration.match(NAME_REGEX);
				const value = match?.groups?.value?.trim();
				if (!value) throw new Error("Invalid declaration");

				this.package.name = value;
				return;
			}

			if (VERSION_REGEX.test(declaration)) {
				const match = declaration.match(VERSION_REGEX);
				const value = match?.groups?.value?.trim();
				if (!value) throw new Error("Invalid declaration");

				this.package.version = value;
				return;
			}

			if (DESCRIPTION_REGEX.test(declaration)) {
				const match = declaration.match(DESCRIPTION_REGEX);
				const value = match?.groups?.value?.trim().replace(/\\;/g, ";");
				if (!value) throw new Error("Invalid declaration");

				this.package.description = value;
				return;
			}

			if (KEYWORD_REGEX.test(declaration)) {
				const match = declaration.match(KEYWORD_REGEX);
				const name = match?.groups?.name?.trim();
				const value = match?.groups?.value?.trim();
				if (!name || !value) throw new Error("Invalid declaration");

				this.keywords[name] = value;
				return;
			}

			if (ROLE_REGEX.test(declaration)) {
				const match = declaration.match(ROLE_REGEX);
				const name = match?.groups?.name?.trim();
				const value = match?.groups?.value?.trim();
				if (!name || !value) throw new Error("Invalid declaration");

				this.rules[name] = value === "on";
				return;
			}

			throw new Error(`Invalid declaration for ${declaration}`);
		});
	}
}
