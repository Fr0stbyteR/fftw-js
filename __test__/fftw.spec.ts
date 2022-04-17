import * as fs from "fs";
import * as path from "path";
import { instantiateFFTWModule, FFTW } from "../dist/esm-bundle/index.js";
import type { FFTWModule } from "../src/types";
import A2_1024 from './audioBuffer.js';

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
    for (var i = 0; i < size; i++) {
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
    for (var i = 1; i < a.length / 2; i++) {
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

describe('fftw-js', function() {
    describe ('fftw.c2c.fft1d', function () {
      it ('should compute same result as numpy', function () {
        var dataType = 'c2c'
        var transformName = 'FFT1D'
        var x = testVectors[dataType][transformName]['x']
        var y = testVectors[dataType][transformName]['y']
        var size = testVectors[dataType][transformName]['size']
        var planConstructor = fftw[dataType][transformName]
        var plan = new planConstructor(size[0])

        var test = plan.forward(x)

        for (var i=0; i<y.length; i++) {
            expect(test[i]).toBeCloseTo(y[i], 4);
        }
        plan.dispose()
      })

      it('should successfully transform and invert complex input', function () {
        var size = 16
        var randomComplex = getMiscComplexBuffer(size)
        var fftc2c = new fftw.c2c.FFT1D(size)
        var forward = fftc2c.forward(randomComplex)
        var backward = fftc2c.inverse(forward)
        var backwardScaled = scaleTransform(backward, size)

        for(var i = 0; i < size; i++) {
          // console.log(forward[i], backward[i])
          expect(randomComplex[2*i]).toBeCloseTo(backwardScaled[2*i], 4);
          expect(randomComplex[2*i + 1]).toBeCloseTo(backwardScaled[2*i + 1], 4);
        }
        fftc2c.dispose();
      })
    })

    describe ('fftw.c2c.fft2d', function () {
      it ('should compute same result as numpy', function () {
        var dataType = 'c2c'
        var transformName = 'FFT2D'
        var x = testVectors[dataType][transformName]['x']
        var y = testVectors[dataType][transformName]['y']
        var size = testVectors[dataType][transformName]['size']
        var planConstructor = fftw[dataType][transformName]
        var plan = new planConstructor(size[0], size[1])

        var test = plan.forward(x)

        for (var i=0; i<y.length; i++) {
          expect(test[i]).toBeCloseTo(y[i], 0.5);
        }
        plan.dispose()
      })

      it('should successfully transform and invert complex 2d input', function () {
        var [n0, n1] = [16, 16]
        var size = n0*n1
        var randomComplex = getMiscComplexBuffer(size)
        var fftc2c = new fftw.c2c.FFT2D(n0, n1)
        var forward = fftc2c.forward(randomComplex)
        var backward = fftc2c.inverse(forward)
        var backwardScaled = scaleTransform(backward, size)

        for(var i = 0; i < size; i++) {
          // console.log(forward[i], backward[i])
          expect(randomComplex[2*i]).toBeCloseTo(backwardScaled[2*i], 4);
          expect(randomComplex[2*i + 1]).toBeCloseTo(backwardScaled[2*i + 1], 4);
        }
        fftc2c.dispose();
      })
    })

    describe ('fftw.r2c.fft1d', function () {
      it ('should compute same result as numpy', function () {
        var dataType = 'r2c'
        var transformName = 'FFT1D'
        var x = testVectors[dataType][transformName]['x']
        var y = testVectors[dataType][transformName]['y']
        var size = testVectors[dataType][transformName]['size']
        var planConstructor = fftw[dataType][transformName]
        var plan = new planConstructor(size[0])

        var test = plan.forward(x)

        for (var i=0; i<y.length; i++) {
          expect(test[i]).toBeCloseTo(y[i], 4);
        }
        plan.dispose()
      })
    })

    describe ('fftw.r2r.dct1d', function () {
      it ('should compute same result as numpy', function () {
        var dataType = 'r2r'
        var transformName = 'DCT1D'
        var size = testVectors[dataType][transformName]['size']
        var x = testVectors[dataType][transformName]['x']
        var y = testVectors[dataType][transformName]['y']
        // var scale = 2*Math.sqrt(size[0]/2)
        // y = y.map(i=>i * scale)
        // y[0] *= Math.sqrt(2)
        // var yShifted = reorganizeNumpyRealOutput(y)
        var planConstructor = fftw[dataType][transformName]
        var plan = new planConstructor(size[0])

        var test = plan.forward(x)

        for (var i=0; i<y.length; i++) {
          // console.log(test[i], y[i])
          expect(test[i]).toBeCloseTo(y[i], 4);
        }
        plan.dispose()
      })
    })

    describe ('fftw.r2r.fft1d', function () {
      it ('should compute same result as numpy', function () {
        var dataType = 'r2r'
        var transformName = 'FFT1D'
        var x = testVectors[dataType][transformName]['x']
        var y = testVectors[dataType][transformName]['y']
        // FFTW and numpy compute real fourier transform with different frequency ordering.
        // see http://www.fftw.org/fftw2_doc/fftw_2.html "Real One-dimensional Transforms Tutorial"
        // and https://docs.scipy.org/doc/scipy/reference/generated/scipy.fftpack.rfft.html#scipy.fftpack.rfft for scipy rfft ordering.
        var yShifted = reorganizeNumpyRealOutput(y)
        var size = testVectors[dataType][transformName]['size']
        var planConstructor = fftw[dataType][transformName]
        var plan = new planConstructor(size[0])

        var test = plan.forward(x)

        for (var i=0; i<y.length; i++) {
          expect(test[i]).toBeCloseTo(yShifted[i], 4);
        }
        plan.dispose()
      })

      it('should successfully transform and invert real valued input buffer', function() {
          var size = A2_1024.length;
          var fftr = new fftw.r2r.FFT1D(size);
          var transform = fftr.forward(A2_1024);
          var transScaled = scaleTransform(transform, size);
          var a2_again = fftr.inverse(transScaled);
          for(var i = 0; i < size; i++) {
              expect(A2_1024[i]).toBeCloseTo(a2_again[i], 0.0000005);
          }
          // Clean up after you're done - NOTE:: dispose will modify the transform array slightly,
          // so only dispose after any use of results are complete
          fftr.dispose();
      })

      it('should successfully transform and invert non-power-of-2 buffers', function() {
          var non2PowSize = 1536;  // 1.5 times test buffer size
          var buffer = getMiscRealBuffer(non2PowSize);
          var fftr = new fftw.r2r.FFT1D(non2PowSize);
          var transform = fftr.forward(buffer);
          var transScaled = scaleTransform(transform, non2PowSize);
          var backAgain = fftr.inverse(transScaled);

          for(var i = 0; i < non2PowSize; i++) {
              expect(buffer[i]).toBeCloseTo(backAgain[i], 0.0000005);
          }
          fftr.dispose();
      })
    })

})
