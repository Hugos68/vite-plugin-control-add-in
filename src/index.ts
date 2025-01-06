import type { Plugin } from "vite";

export type ApplicationLanguageType = "Text" | "Integer" | "Boolean";

export interface ApplicationLanguageArgument {
	name: string;
	type: ApplicationLanguageType;
}

export interface ApplicationLanguageMethod {
	type: "procedure" | "event";
	name: string;
	arguments: ApplicationLanguageArgument[];
}

export interface ControlAddInOptions {
	name: string;
	methods?: ApplicationLanguageMethod[];
	meta?: string[];
}

const VIRTUAL_MODULE_ID = 'virtual:my-module'
const RESOLVED_VIRTUAL_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`

export default function (options: ControlAddInOptions): Plugin {
	const name = options.name;
	const methods = options.methods ?? [];
	const meta = options.meta ?? [];
	return {
		name: "control-add-in",
		config() {
			return {
				build: {
					lib: {
						entry: "src/index.ts",
						fileName: name,
						formats: ["es"],
					},
				},
			};
		},
		resolveId(id) {
			if (id !== VIRTUAL_MODULE_ID) {
				return;
			}
			return RESOLVED_VIRTUAL_MODULE_ID;
		},
		load(id) {
			if (id !== RESOLVED_VIRTUAL_MODULE_ID) {
				return;
			}
			return `
				class ControlAddInService {
					#eventCallbacks = new Set();
					
					on(event, callback) {
						const callbacks = this.eventCallbacks.get(event) ?? [];
						callbacks.add(callback);
						this.#eventCallbacks.set(event, callback);
						if (Object.hasOwn(globalThis, event)) {
							return;
						}
						Object.assign(globalThis, {
							[event]: (...args) => {
								for (const callback of callbacks) {
									callback(...args);
								}
							}
						});
					}
					
					invoke(procedure, ...args) {
						Microsoft.Dynamics.NAV.InvokeExtensibilityMethod(procedure, args, false);
					}
				}
				
				export const controlAddInService = new ControlAddInService();
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
					`\tScripts = './${name}.js';`,
					`\tStyleSheets = './${name}.css';`,
					...methods.map((method) => {
						const args = method.arguments
							.map((argument) => {
								return `${argument.name}: ${argument.type}`;
							})
							.join(";");
						return `\t${method.type} ${method.name}(${args});`;
					}),
					...meta.map((meta) => `\t${meta}`),
					"}",
				].join("\n"),
			});
		},
	};
}
