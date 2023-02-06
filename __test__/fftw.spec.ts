import * as fs from "fs";
import * as path from "path";
import { instantiateFFTWModule, FFTW } from "../dist/esm-bundle/index.js";
import type { FFTWModule } from "../src/types";
import A2_1024 from "./audioBuffer.js";

const fftModuleJsPath = path.join(__dirname, "../libfftw3-wasm/libfftw3.js");
const testVectorsFilePath = path.join(__dirname, "test_vectors.json");
let testVectors: number[];

const scaleTransform = (trans: Float32Array, size: number) => {
    let i = 0, bSi = 1.0 / size, x = trans;
    while (i < x.length) {
        x[i] *= bSi; i++;
    }
    return x;
};

const getMiscRealBuffer = (size: number) => {
    const result = new Float32Array(size);
    for (let i = 0; i < result.length; i++)
        result[i] = (i % 2) / 4.0;
    return result;
}

const getMiscComplexBuffer = (size: number) => {
    const result = new Float32Array(2 * size);
    for (let i = 0; i < size; i++) {
        // result[2*i] = i
        // result[2*i + 1] = i
        result[2 * i] = Math.random();
        result[2 * i + 1] = Math.random();
    }
    return result;
}

const reorganizeNumpyRealOutput = (a: number[]) => {
    const b = new Array(a.length);
    b.fill(0);
    b[0] = a[0];
    b[a.length / 2] = a[a.length - 1];
    for (let i = 1; i < a.length / 2; i++) {
        b[i] = a[2 * i - 1];
        b[a.length - i] = a[2 * i];
    }
    return b;
}

let Module: FFTWModule;
let fftw: FFTW;

beforeAll(async () => {
    Module = await instantiateFFTWModule();
    testVectors = JSON.parse(fs.readFileSync(testVectorsFilePath, { encoding: "utf-8" }));
    fftw = new FFTW(Module);
});

describe("fftw-js", function () {
    describe("fftw.c2c.fft1d", function () {
        it("should compute same result as numpy", function () {
            const dataType = "c2c";
            const transformName = "FFT1D";
            const x = testVectors[dataType][transformName]["x"];
            const y = testVectors[dataType][transformName]["y"];
            const size = testVectors[dataType][transformName]["size"];
            const planConstructor = fftw[dataType][transformName];
            const plan = new planConstructor(size[0]);

            const test = plan.forward(x);

            for (let i = 0; i < y.length; i++) {
                expect(test[i]).toBeCloseTo(y[i], 4);
            }
            plan.dispose();
        })

        it("should successfully transform and invert complex input", function () {
            const size = 16;
            const randomComplex = getMiscComplexBuffer(size);
            const fftc2c = new fftw.c2c.FFT1D(size);
            const forward = fftc2c.forward(randomComplex);
            const backward = fftc2c.inverse(forward);
            const backwardScaled = scaleTransform(backward, size);

            for (let i = 0; i < size; i++) {
                // console.log(forward[i], backward[i])
                expect(randomComplex[2 * i]).toBeCloseTo(backwardScaled[2 * i], 4);
                expect(randomComplex[2 * i + 1]).toBeCloseTo(backwardScaled[2 * i + 1], 4);
            }
            fftc2c.dispose();
        })
    })

    describe("fftw.c2c.fft2d", function () {
        it("should compute same result as numpy", function () {
            const dataType = "c2c";
            const transformName = "FFT2D";
            const x = testVectors[dataType][transformName]["x"];
            const y = testVectors[dataType][transformName]["y"];
            const size = testVectors[dataType][transformName]["size"];
            const planConstructor = fftw[dataType][transformName];
            const plan = new planConstructor(size[0], size[1]);

            const test = plan.forward(x);

            for (let i = 0; i < y.length; i++) {
                expect(test[i]).toBeCloseTo(y[i], 0.5);
            }
            plan.dispose();
        })

        it("should successfully transform and invert complex 2d input", function () {
            const [n0, n1] = [16, 16];
            const size = n0 * n1;
            const randomComplex = getMiscComplexBuffer(size);
            const fftc2c = new fftw.c2c.FFT2D(n0, n1);
            const forward = fftc2c.forward(randomComplex);
            const backward = fftc2c.inverse(forward);
            const backwardScaled = scaleTransform(backward, size);

            for (let i = 0; i < size; i++) {
                // console.log(forward[i], backward[i])
                expect(randomComplex[2 * i]).toBeCloseTo(backwardScaled[2 * i], 4);
                expect(randomComplex[2 * i + 1]).toBeCloseTo(backwardScaled[2 * i + 1], 4);
            }
            fftc2c.dispose();
        })
    })

    describe("fftw.r2c.fft1d", function () {
        it("should compute same result as numpy", function () {
            const dataType = "r2c";
            const transformName = "FFT1D";
            const x = testVectors[dataType][transformName]["x"];
            const y = testVectors[dataType][transformName]["y"];
            const size = testVectors[dataType][transformName]["size"];
            const planConstructor = fftw[dataType][transformName];
            const plan = new planConstructor(size[0]);

            const test = plan.forward(x);

            for (let i = 0; i < y.length; i++) {
                expect(test[i]).toBeCloseTo(y[i], 4);
            }
            plan.dispose();
        })
    })

    describe("fftw.r2r.dct1d", function () {
        it("should compute same result as numpy", function () {
            const dataType = "r2r";
            const transformName = "DCT1D";
            const size = testVectors[dataType][transformName]["size"];
            const x = testVectors[dataType][transformName]["x"];
            const y = testVectors[dataType][transformName]["y"];
            // const scale = 2*Math.sqrt(size[0]/2)
            // y = y.map(i=>i * scale)
            // y[0] *= Math.sqrt(2)
            // const yShifted = reorganizeNumpyRealOutput(y)
            const planConstructor = fftw[dataType][transformName];
            const plan = new planConstructor(size[0]);

            const test = plan.forward(x);

            for (let i = 0; i < y.length; i++) {
                // console.log(test[i], y[i])
                expect(test[i]).toBeCloseTo(y[i], 4);
            }
            plan.dispose();
        })
    })

    describe("fftw.r2r.fft1d", function () {
        it("should compute same result as numpy", function () {
            const dataType = "r2r";
            const transformName = "FFT1D";
            const x = testVectors[dataType][transformName]["x"];
            const y = testVectors[dataType][transformName]["y"];
            // FFTW and numpy compute real fourier transform with different frequency ordering.
            // see http://www.fftw.org/fftw2_doc/fftw_2.html "Real One-dimensional Transforms Tutorial"
            // and https://docs.scipy.org/doc/scipy/reference/generated/scipy.fftpack.rfft.html#scipy.fftpack.rfft for scipy rfft ordering.
            const yShifted = reorganizeNumpyRealOutput(y);
            const size = testVectors[dataType][transformName]["size"];
            const planConstructor = fftw[dataType][transformName];
            const plan = new planConstructor(size[0]);

            const test = plan.forward(x);

            for (let i = 0; i < y.length; i++) {
                expect(test[i]).toBeCloseTo(yShifted[i], 4);
            }
            plan.dispose();
        })

        it("should successfully transform and invert real valued input buffer", function () {
            const size = A2_1024.length;
            const fftr = new fftw.r2r.FFT1D(size);
            const transform = fftr.forward(A2_1024);
            const transScaled = scaleTransform(transform, size);
            const a2_again = fftr.inverse(transScaled);
            for (let i = 0; i < size; i++) {
                expect(A2_1024[i]).toBeCloseTo(a2_again[i], 0.0000005);
            }
            // Clean up after you"re done - NOTE:: dispose will modify the transform array slightly,
            // so only dispose after any use of results are complete
            fftr.dispose();
        })

        it("should successfully transform and invert non-power-of-2 buffers", function () {
            const non2PowSize = 1536;  // 1.5 times test buffer size
            const buffer = getMiscRealBuffer(non2PowSize);
            const fftr = new fftw.r2r.FFT1D(non2PowSize);
            const transform = fftr.forward(buffer);
            const transScaled = scaleTransform(transform, non2PowSize);
            const backAgain = fftr.inverse(transScaled);

            for (let i = 0; i < non2PowSize; i++) {
                expect(buffer[i]).toBeCloseTo(backAgain[i], 0.0000005);
            }
            fftr.dispose();
        })
    })

})
