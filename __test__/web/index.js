//@ts-check
/**
 * 
 * @param {string} to 
 * @param {Float32Array} array 
 */
const draw = (to, array) => {
    /** @type {HTMLCanvasElement} */
    // @ts-ignore
    const canvas = document.getElementById(to);
    const { width, height } = canvas;
    /** @type {CanvasRenderingContext2D} */
    // @ts-ignore
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "black";
    ctx.beginPath();
    for (let i = 0; i < array.length; i++) {
        const v = array[i];
        /** @type {[number, number]} */
        const coord = [i * width / array.length, (1 - v) * height / 2];
        if (!i) ctx.moveTo(...coord);
        else ctx.lineTo(...coord);
    }
    ctx.stroke();
    ctx.closePath();
}
(async () => {
    const size = 64;
    const signal = new Float32Array(new SharedArrayBuffer(size * Float32Array.BYTES_PER_ELEMENT));
    const sampleRate = 48000;
    const freq = 48000 / size;
    for (let i = 0; i < signal.length; i++) {
        signal[i] = -1;
        // signal[i] = Math.sin(i / sampleRate * Math.PI * 2 * freq);
        // signal[i] = Math.cos(i / sampleRate * Math.PI * 2 * freq);
        // signal[i] = (i % 2 * 2 - 1) * -1;
    }
    console.log(signal);
    draw("result1", signal);
    const { FFTW, instantiateFFTWModuleFromFile } = await import("../../dist/esm/index.js");
    const fftModuleUri = "../../libfftw3-wasm/libfftw3.js";
    const fftwModule = await instantiateFFTWModuleFromFile(fftModuleUri);
    const fftw = new FFTW(fftwModule);
    const fft = new fftw.r2r.FFT1D(size);
    const result = fft.forward(signal).map(v => v / size);
    console.log(result);
    draw("result2", result);
    /** @param {Float32Array} from */
    const fftw2Amp = (from) => {
        const { length } = from;
        const amps = new Float32Array(length / 2 + 1);
        const phases = new Float32Array(length / 2 + 1);
        for (let i = 0; i <= length / 2; i++) {
            const real = from[i];
            const imag = (i === 0 || i === length / 2) ? 0 : from[length - i];
            amps[i] = (real * real + imag * imag) ** 0.5;
            phases[i] = Math.atan2(imag, real) / Math.PI;
        }
        return [amps, phases];
    };
    const [amps, phases] = fftw2Amp(result);
    console.log(amps);
    console.log(phases);
    draw("result3", amps);
    draw("result4", phases);
    const ifft = fft.inverse(result);
    console.log(ifft);
    draw("result5", ifft);
})();

(async () => {
    const injector = async () => {
        /** @type {typeof import("../../dist/esm-bundle/index.js")} */
        // @ts-ignore
        const { FFTW, instantiateFFTWModule } = fftwwasm;
        const fftwModule = await instantiateFFTWModule();
        const fftw = new FFTW(fftwModule);
        const sampleRate = globalThis.sampleRate || 48000;
        const size = 128;
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
