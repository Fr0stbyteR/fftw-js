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
    const { FFTW, instantiateFFTWModuleFromFile } = await import("../../dist/esm/index.js");
    const fftModuleUri = "../../libfftw3-wasm/libfftw3.js";
    const fftwModule = await instantiateFFTWModuleFromFile(fftModuleUri);
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
    const injector = async () => {
        /** @type {typeof import("../../dist/esm-bundle/index.js")} */
        const { FFTW, instantiateFFTWModule } = fftwwasm;
        const fftwModule = await instantiateFFTWModule();
        const fftw = new FFTW(fftwModule);
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
(${injector.toString()})();
`;
    const blob = new Blob([str], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    await ctx.audioWorklet.addModule("../../dist/cjs-bundle/index.js");
    await ctx.audioWorklet.addModule(url);
})();
