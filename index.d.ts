/// <reference path="./dist/index.d.ts" />

declare module "virtual:control-add-in" {
	const controlAddInService: {
		on: (event: string, callback: (...args: unknown[]) => void) => void;
		invoke: (procedure: string, ...args: unknown[]) => void;
	};
	export { controlAddInService };
}
