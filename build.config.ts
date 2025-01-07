import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
	name: "vite-plugin-control-add-in",
	entries: ["./src/index", "./src/service"],
	clean: true,
	declaration: true,
	rollup: {
		emitCJS: true,
	},
});
