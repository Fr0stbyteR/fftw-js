import FFTW from "./FFTW";
import LibFFTW from "../libfftw3-wasm/libfftw3";
import wasmBinary from "../libfftw3-wasm/libfftw3.wasm";

const instantiateFFTW = async (FFTWIn = FFTW, LibFFTWIn = LibFFTW, wasmBinaryIn = wasmBinary) => {
    const instantiateFFTWModule = async () => {
        
        const libFaust = await LibFFTWIn({ wasmBinary: wasmBinaryIn });
        return libFaust;
    };
    return new FFTWIn(await instantiateFFTWModule());
};

export { FFTW, LibFFTW, wasmBinary };

export default instantiateFFTW;
