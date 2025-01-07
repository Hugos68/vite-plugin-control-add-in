import type { Plugin } from "vite";

export interface ControlAddInOptions {
	name: string;
	lines?: string[];
}

export default function (options: ControlAddInOptions): Plugin {
	const name = options.name;
	const lines = options.lines ?? [];
	return {
		name: "control-add-in",
		config() {
			return {
				build: {
					lib: {
						entry: "src/index.ts",
						fileName: `assets/${name}`,
						formats: ["es"],
					},
				},
			};
		},
		generateBundle() {
			this.emitFile({
				type: "prebuilt-chunk",
				fileName: `${name}.al`,
				code: [
					`controladdin ${name}`,
					"{",
					`\tScripts = './assets/${name}.js';`,
					`\tStyleSheets = './assets/${name}.css';`,
					...lines.map((meta) => `\t${meta}`),
					"}",
				].join("\n"),
			});
		},
	};
}
