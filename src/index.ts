import type { Plugin } from "vite";

export interface ControlAddInOptions {
	name: string;
	lines?: string[];
}

const VIRTUAL_MODULE_ID = "virtual:my-module";
const RESOLVED_VIRTUAL_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`;

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
						fileName: `assets/${name},`,
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
						const callbacks = this.#eventCallbacks.get(event) ?? new Set();
						callbacks.add(callback);
						this.#eventCallbacks.set(event, callbacks);
						if (!Object.hasOwn(globalThis, event)) {
							Object.assign(globalThis, {
								[event]: (...args) => {
									const eventCallbacks = this.#eventCallbacks.get(event);
									if (eventCallbacks) {
										for (const cb of eventCallbacks) {
											cb(...args);
										}
									}
								}
							});
						}
						return () => {
							const eventCallbacks = this.#eventCallbacks.get(event);
							if (eventCallbacks) {
								eventCallbacks.delete(callback);
								if (eventCallbacks.size === 0) {
									this.#eventCallbacks.delete(event);
									if (Object.hasOwn(globalThis, event)) {
										delete globalThis[event];
									}
								}
							}
						};
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
					`\tScripts = './assets/${name}.js';`,
					`\tStyleSheets = './assets/${name}.css';`,
					...lines.map((meta) => `\t${meta}`),
					"}",
				].join("\n"),
			});
		},
	};
}
