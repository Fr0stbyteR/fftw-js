import type { FFTWModuleFactory } from "./types";

/**
 * Load emcc-wasm files, than instantiate it
 * @param jsFile path to `emcc-wasm.js`
 * @param wasmFile path to `emcc-wasm.wasm`
 * @param dataFile path to `emcc-wasm.data`
 */
const instantiateFFTWModuleFromFile = async (jsFile: string, wasmFile = jsFile.replace(/c?js$/, "wasm"), dataFile = jsFile.replace(/c?js$/, "data")) => {
    let Module: FFTWModuleFactory;
    // let dataBinary: ArrayBuffer;
    let wasmBinary: Uint8Array | ArrayBuffer;
    const jsCodeHead = /var (.+) = \(\(\) => \{/;
    if (typeof globalThis.fetch === "function") {
        let jsCode = await (await fetch(jsFile)).text();
        jsCode = `${jsCode}
export default ${jsCode.match(jsCodeHead)?.[1]};
`;
        const jsFileMod = URL.createObjectURL(new Blob([jsCode], { type: "text/javascript" }));
        Module = (await import(/* webpackIgnore: true */jsFileMod)).default;
        // dataBinary = await (await fetch(dataFile)).arrayBuffer();
        wasmBinary = new Uint8Array(await (await fetch(wasmFile)).arrayBuffer());
    } else {
        const { promises: fs } = await import("fs");
        const { pathToFileURL } = await import("url");
        let jsCode = (await fs.readFile(jsFile, { encoding: "utf-8" }));
        jsCode = `
import process from "process";
import * as path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const __filename = fileURLToPath(import.meta.url);
const require = createRequire(import.meta.url);

${jsCode}

export default ${jsCode.match(jsCodeHead)?.[1]};
`;
        const jsFileMod = jsFile.replace(/c?js$/, "mjs");
        await fs.writeFile(jsFileMod, jsCode);
        Module = (await import(/* webpackIgnore: true */pathToFileURL(jsFileMod).href)).default;
        await fs.unlink(jsFileMod);
        // dataBinary = (await fs.readFile(dataFile)).buffer;
        wasmBinary = (await fs.readFile(wasmFile)).buffer;
    }
    const module = await Module({
        wasmBinary/*,
        getPreloadedPackage: (remotePackageName: string, remotePackageSize: number) => {
            if (remotePackageName === "libfaust-wasm.data") return dataBinary;
            return new ArrayBuffer(0);
        }*/
    });
    return module;
};

export default instantiateFFTWModuleFromFile;
