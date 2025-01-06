import type { Plugin } from "vite";

export type ApplicationLanguageType = "Text" | "Integer" | "Boolean";
export type ApplicationLanguageReturnType = ApplicationLanguageType | "void";

export interface ApplicationLanguageArgument {
	name: string;
	type: ApplicationLanguageType;
}

export interface ApplicationLanguageMethod {
	type: "procedure" | "event";
	name: string;
	arguments: ApplicationLanguageArgument[];
	returnType: ApplicationLanguageReturnType;
}

export interface ControlAddInOptions {
	name: string;
	methods?: ApplicationLanguageMethod[];
	meta?: string[];
}

export default function (options: ControlAddInOptions): Plugin {
	const name = options.name;
	const methods = options.methods ?? [];
	const meta = options.meta ?? [];

	const pluginName = "control-add-in";
	const virtualModuleId = `virtual:${pluginName}`;
	const resolvedVirtualModuleId = `\\0${virtualModuleId}`;

	return {
		name: pluginName,
		config(config) {
			return {
				...config,
				build: {
					...config.build,
					lib: {
						entry: "src/index.ts",
						fileName: "index",
						formats: ["es"],
					},
				},
			};
		},
		resolveId(id) {
			if (id !== virtualModuleId) {
				return;
			}
			return resolvedVirtualModuleId;
		},
		load(id) {
			if (id !== resolvedVirtualModuleId) {
				return;
			}
			// TODO: Create `on` and `invoke` methods to talk to the control add-in in a type safe way (Using the `options.methods` to create a type safe API).
			return `export const controlAddIn = {
                on(event: string, callback: () => void) {
                      
                },
                invoke(procedure: string, args: any[]) {
                
                },
            }`;
		},
		generateBundle() {
			this.emitFile({
				type: "prebuilt-chunk",
				fileName: `${name}.al`,
				code: [
					`controladdin ${name}`,
					"{",
					"\tHorizontalStretch = true;",
					"\tVerticalStretch = true;",
					"\tScripts = './index.js';",
					"\tStyleSheets = './index.css';",
					...methods.map((method) => {
						const args = method.arguments
							.map((argument) => {
								return `${argument.name}: ${argument.type}`;
							})
							.join(";");
						return `\t${method.type}  ${method.name}(${args}): ${method.returnType};`;
					}),
					...meta.map((meta) => `\t${meta}`),
					"}",
				].join("\n"),
			});
		},
	};
}
