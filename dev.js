import esbuild from "esbuild";
import { buildOptions } from "./buildOptions.js";



async function build() {
    await esbuild.build(buildOptions);

    console.log("Initial build complete.");

    const ctx = await esbuild.context(buildOptions);

    await ctx.watch();

    console.log("Watching for changes...");
}

build().catch((error) => {
    console.error(error);
    process.exit(1);
});