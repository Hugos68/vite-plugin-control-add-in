import { cpSync } from "node:fs";
import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
	name: "vite-plugin-control-add-in",
	entries: ["./src/index"],
	clean: true,
	declaration: true,
	rollup: {
		emitCJS: true,
	},
	hooks: {
		"build:done"() {
			cpSync("src/virtual.d.ts", "dist/virtual.d.ts");
		},
	},
	externals: ["vite"],
});
