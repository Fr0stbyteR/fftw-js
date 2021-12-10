import fetchModule from "./fetchModule";
import type { FFTWModuleFactory } from "./types";

/**
 * Load fftw-wasm files, than instantiate fftw
 * @param jsFile path to `libfftw3.js`
 * @param wasmFile path to `libfftw3.wasm`
 */
const instantiateFFTWModule = async (jsFile: string, wasmFile = jsFile.replace(/c?js$/, "wasm")) => {
    let LibFFTW: FFTWModuleFactory;
    try {
        LibFFTW = require(jsFile);
    } catch (error) {
        LibFFTW = await fetchModule(jsFile);
    }
    const locateFile = (url: string, scriptDirectory: string) => ({
        "libfftw3.wasm": wasmFile
    }[url]) || scriptDirectory + url;
    const libFaust = await LibFFTW({ locateFile });
    return libFaust;
};

export default instantiateFFTWModule;
