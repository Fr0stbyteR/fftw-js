import FFTW from "./FFTW";
import LibFFTW from "../libfftw3-wasm/libfftw3";
//@ts-ignore
import wasmFile from "../libfftw3-wasm/libfftw3.wasm";

const instantiateFFTWModule = async () => {
    const locateFile = (url: string, scriptDirectory: string) => ({
        "libfftw3.wasm": wasmFile
    }[url]) || scriptDirectory + url;
    const libFaust = await LibFFTW({ locateFile });
    return libFaust;
};

const instantiateFFTW = async () => {
    return new FFTW(await instantiateFFTWModule());
};

export default instantiateFFTW;
