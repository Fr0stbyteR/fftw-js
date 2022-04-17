import factoryFn from "../libfftw3-wasm/libfftw3.cjs";
import wasmBinary from "../libfftw3-wasm/libfftw3.wasm";

export const FFTWModuleFactoryFn = factoryFn;
export const FFTWModuleFactoryWasm = wasmBinary;

/**
 * Instantiate EMCC Module using bundled binaries. Module constructor and files can be overriden.
 */
const instantiateFFTWModule = async (ModuleFactoryIn = factoryFn, wasmBinaryIn = wasmBinary) => {
    const g = globalThis as any;
    if (g.AudioWorkletGlobalScope) {
        g.importScripts = () => {};
        g.self = { location: { href: "" } };
    }
    const module = await ModuleFactoryIn({
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
