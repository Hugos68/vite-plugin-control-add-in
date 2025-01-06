import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
	name: "vite-plugin-control-add-in",
	entries: ["src/index"],
	outDir: "dist",
	clean: true,
	declaration: true,
	rollup: {
		emitCJS: true,
	},
	externals: ["vite"],
});
