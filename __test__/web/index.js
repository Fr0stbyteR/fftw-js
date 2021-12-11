//@ts-check
(async () => {
    const size = 1024;
    const signal = new Float32Array(size);
    const sampleRate = 48000;
    const freq = 440;
    for (let i = 0; i < signal.length; i++) {
        signal[i] = Math.sin(i / sampleRate * Math.PI * 2 * freq);
    }
    console.log(signal);
    const { FFTW, instantiateFFTWModule } = await import("../../dist/esm/index.js");
    const fftModuleUri = "../../libfftw3-wasm/libfftw3.js";
    const fftwModule = await instantiateFFTWModule(fftModuleUri);
    const fftw = new FFTW(fftwModule);
    const fft = new fftw.r2r.FFT1D(size);
    const result = fft.forward(signal);
    /** @param {Float32Array} from */
    const fftw2Amp = (from) => {
        const { length } = from;
        const amps = new Float32Array(length / 2);
        for (let i = 0; i < length / 2; i++) {
            const real = from[i];
            const imag = (i === 0 || i === length / 2 - 1) ? 0 : from[length - i];
            amps[i] = (real * real + imag * imag) ** 0.5 / length;
        }
        return amps;
    };
    console.log(fftw2Amp(result));
})();

(async () => {
    const { FFTW, wasmBinary, LibFFTW, default: instantiateLibFFTW } = await import("../../dist/esm-bundle/index.js");
    /**
     * @param {typeof instantiateLibFFTW} instantiateLibFFTWIn
     * @param {typeof FFTW} FFTWIn
     * @param {typeof LibFFTW} LibFFTWIn
     * @param {Uint8Array} wasmBinaryIn
     */
    const injector = async (instantiateLibFFTWIn, FFTWIn, LibFFTWIn, wasmBinaryIn) => {
        const needWindow = !globalThis.window;
        if (needWindow) {
            // @ts-ignore
            globalThis.window = {};
            globalThis._scriptDir = "";
        }
        const fftw = await instantiateLibFFTWIn(FFTWIn, LibFFTWIn, wasmBinaryIn);
        if (needWindow) {
            delete globalThis.window;
            delete globalThis._scriptDir;
        }
        const sampleRate = globalThis.sampleRate || 48000;
        const size = 1024;
        const signal = new Float32Array(size);
        const freq = 440;
        for (let i = 0; i < signal.length; i++) {
            signal[i] = Math.sin(i / sampleRate * Math.PI * 2 * freq);
        }
        console.log(signal);
        const fft = new fftw.r2r.FFT1D(size);
        const result = fft.forward(signal);
        /** @param {Float32Array} from */
        const fftw2Amp = (from) => {
            const { length } = from;
            const amps = new Float32Array(length / 2);
            for (let i = 0; i < length / 2; i++) {
                const real = from[i];
                const imag = (i === 0 || i === length / 2 - 1) ? 0 : from[length - i];
                amps[i] = (real * real + imag * imag) ** 0.5 / length;
            }
            return amps;
        };
        console.log(fftw2Amp(result));
    };
    const ctx = new AudioContext();
    const str = `
(${injector.toString()})(
    ${instantiateLibFFTW.toString()},
    ${FFTW.toString()},
    ${LibFFTW.toString()},
    new Uint8Array([${wasmBinary.toString()}])
);
`;
    const blob = new Blob([str], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    await ctx.audioWorklet.addModule(url);
})();
