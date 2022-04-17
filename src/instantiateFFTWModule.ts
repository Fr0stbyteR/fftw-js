import LibFFTWIn from "../libfftw3-wasm/libfftw3.cjs";
import wasmBinary from "../libfftw3-wasm/libfftw3.wasm";

export const LibFFTW = LibFFTWIn;
export const LibFFTWWasm = wasmBinary;

/**
 * Instantiate EMCC Module using bundled binaries. Module constructor and files can be overriden.
 */
const instantiateFFTWModule = async (ModuleIn = LibFFTW, wasmBinaryIn = wasmBinary) => {
    const g = globalThis as any;
    if (g.AudioWorkletGlobalScope) {
        g.importScripts = () => {};
        g.self = { location: { href: "" } };
    }
    const module = await ModuleIn({
        wasmBinary: wasmBinaryIn/*,
        getPreloadedPackage: (remotePackageName: string, remotePackageSize: number) => {
            if (remotePackageName === "libfaust-wasm.data") return dataBinaryIn.buffer;
            return new ArrayBuffer(0);
        }*/
    });
    if (g.AudioWorkletGlobalScope) {
		delete g.importScripts;
		delete g.self;
    }
    return module;
};

export default instantiateFFTWModule;
