// src/instantiateFFTWModuleFromFile.ts
var instantiateFFTWModuleFromFile = async (jsFile, wasmFile = jsFile.replace(/c?js$/, "wasm"), dataFile = jsFile.replace(/c?js$/, "data")) => {
  var _a, _b;
  let Module;
  let wasmBinary;
  const jsCodeHead = /var (.+) = \(\(\) => \{/;
  if (typeof globalThis.fetch === "function") {
    let jsCode = await (await fetch(jsFile)).text();
    jsCode = `${jsCode}
export default ${(_a = jsCode.match(jsCodeHead)) == null ? void 0 : _a[1]};
`;
    const jsFileMod = URL.createObjectURL(new Blob([jsCode], { type: "text/javascript" }));
    Module = (await import(
      /* webpackIgnore: true */
      jsFileMod
    )).default;
    wasmBinary = new Uint8Array(await (await fetch(wasmFile)).arrayBuffer());
  } else {
    const { promises: fs } = await import("fs");
    const { pathToFileURL } = await import("url");
    let jsCode = await fs.readFile(jsFile, { encoding: "utf-8" });
    jsCode = `
import process from "process";
import * as path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const __filename = fileURLToPath(import.meta.url);
const require = createRequire(import.meta.url);

${jsCode}

export default ${(_b = jsCode.match(jsCodeHead)) == null ? void 0 : _b[1]};
`;
    const jsFileMod = jsFile.replace(/c?js$/, "mjs");
    await fs.writeFile(jsFileMod, jsCode);
    Module = (await import(
      /* webpackIgnore: true */
      pathToFileURL(jsFileMod).href
    )).default;
    await fs.unlink(jsFileMod);
    wasmBinary = (await fs.readFile(wasmFile)).buffer;
  }
  const module = await Module({
    wasmBinary
  });
  return module;
};
var instantiateFFTWModuleFromFile_default = instantiateFFTWModuleFromFile;

// src/FFTW.ts
var FFTW = class {
  constructor(fftwModule) {
    const FFTW_ESTIMATE = 1 << 6;
    const FFTW_R2HC = 0;
    const FFTW_HC2R = 1;
    const FFTW_DHT = 2;
    const FFTW_REDFT00 = 3;
    const FFTW_REDFT10 = 5;
    const FFTW_REDFT01 = 4;
    const FFTW_REDFT11 = 6;
    const FFTW_RODFT00 = 7;
    const FFTW_RODFT10 = 9;
    const FFTW_RODFT01 = 8;
    const FFTW_RODFT11 = 10;
    const FFTW_FORWARD = -1;
    const FFTW_BACKWARD = 1;
    const {
      _fftwf_plan_dft_r2c_1d,
      _fftwf_plan_dft_c2r_1d,
      _fftwf_plan_r2r_1d,
      _fftwf_plan_r2r_2d,
      _fftwf_plan_dft_1d,
      _fftwf_plan_dft_2d,
      _fftwf_execute,
      _fftwf_destroy_plan,
      _fftwf_free,
      _fftwf_malloc
    } = fftwModule;
    class C2CFFT2D {
      constructor(n0, n1) {
        this.n0 = n0;
        this.n1 = n1;
        this.size = n0 * n1;
        this.c0ptr = _fftwf_malloc(2 * 4 * this.size);
        this.c1ptr = _fftwf_malloc(2 * 4 * this.size);
        this.c0 = new Float32Array(fftwModule.HEAPU8.buffer, this.c0ptr, 2 * this.size);
        this.c1 = new Float32Array(fftwModule.HEAPU8.buffer, this.c1ptr, 2 * this.size);
        this.fplan = _fftwf_plan_dft_2d(this.n0, this.n1, this.c0ptr, this.c1ptr, FFTW_FORWARD, FFTW_ESTIMATE);
        this.iplan = _fftwf_plan_dft_2d(this.n0, this.n1, this.c1ptr, this.c0ptr, FFTW_BACKWARD, FFTW_ESTIMATE);
      }
      forward(cpx) {
        if (typeof cpx === "function")
          cpx(this.c0);
        else
          this.c0.set(cpx);
        _fftwf_execute(this.fplan);
        return this.c1;
      }
      inverse(cpx) {
        if (typeof cpx === "function")
          cpx(this.c1);
        else
          this.c1.set(cpx);
        _fftwf_execute(this.iplan);
        return this.c0;
      }
      dispose() {
        _fftwf_destroy_plan(this.fplan);
        _fftwf_destroy_plan(this.iplan);
        _fftwf_free(this.c0ptr);
        _fftwf_free(this.c1ptr);
      }
    }
    class C2CFFT1D {
      constructor(size) {
        this.size = size;
        this.c0ptr = _fftwf_malloc(2 * 4 * size);
        this.c1ptr = _fftwf_malloc(2 * 4 * size);
        this.c0 = new Float32Array(fftwModule.HEAPU8.buffer, this.c0ptr, 2 * size);
        this.c1 = new Float32Array(fftwModule.HEAPU8.buffer, this.c1ptr, 2 * size);
        this.fplan = _fftwf_plan_dft_1d(size, this.c0ptr, this.c1ptr, FFTW_FORWARD, FFTW_ESTIMATE);
        this.iplan = _fftwf_plan_dft_1d(size, this.c1ptr, this.c0ptr, FFTW_BACKWARD, FFTW_ESTIMATE);
      }
      forward(cpx) {
        if (typeof cpx === "function")
          cpx(this.c0);
        else
          this.c0.set(cpx);
        _fftwf_execute(this.fplan);
        return this.c1;
      }
      inverse(cpx) {
        if (typeof cpx === "function")
          cpx(this.c1);
        else
          this.c1.set(cpx);
        _fftwf_execute(this.iplan);
        return this.c0;
      }
      dispose() {
        _fftwf_destroy_plan(this.fplan);
        _fftwf_destroy_plan(this.iplan);
        _fftwf_free(this.c0ptr);
        _fftwf_free(this.c1ptr);
      }
    }
    class R2CFFT1D {
      constructor(size) {
        this.size = size;
        this.rptr = _fftwf_malloc(size * 4 + (size + 2) * 4);
        this.cptr = this.rptr + size * 4;
        this.r = new Float32Array(fftwModule.HEAPU8.buffer, this.rptr, size);
        this.c = new Float32Array(fftwModule.HEAPU8.buffer, this.cptr, size + 2);
        this.fplan = _fftwf_plan_dft_r2c_1d(size, this.rptr, this.cptr, FFTW_ESTIMATE);
        this.iplan = _fftwf_plan_dft_c2r_1d(size, this.cptr, this.rptr, FFTW_ESTIMATE);
      }
      forward(real) {
        if (typeof real === "function")
          real(this.r);
        else
          this.r.set(real);
        _fftwf_execute(this.fplan);
        return this.c;
      }
      inverse(cpx) {
        if (typeof cpx === "function")
          cpx(this.c);
        else
          this.c.set(cpx);
        _fftwf_execute(this.iplan);
        return this.r;
      }
      dispose() {
        _fftwf_destroy_plan(this.fplan);
        _fftwf_destroy_plan(this.iplan);
        _fftwf_free(this.rptr);
      }
    }
    const r2r1dFactory = (forwardType, inverseType) => {
      return class R2RFFT1D {
        constructor(size) {
          this.size = size;
          this.rptr = _fftwf_malloc(size * 4 + size * 4);
          this.cptr = this.rptr;
          this.r = new Float32Array(fftwModule.HEAPU8.buffer, this.rptr, size);
          this.c = new Float32Array(fftwModule.HEAPU8.buffer, this.cptr, size);
          this.fplan = _fftwf_plan_r2r_1d(size, this.rptr, this.cptr, forwardType, FFTW_ESTIMATE);
          this.iplan = _fftwf_plan_r2r_1d(size, this.cptr, this.rptr, inverseType, FFTW_ESTIMATE);
        }
        forward(real) {
          if (typeof real === "function")
            real(this.r);
          else
            this.r.set(real);
          _fftwf_execute(this.fplan);
          return this.c;
        }
        inverse(cpx) {
          if (typeof cpx === "function")
            cpx(this.c);
          else
            this.c.set(cpx);
          _fftwf_execute(this.iplan);
          return this.r;
        }
        dispose() {
          _fftwf_destroy_plan(this.fplan);
          _fftwf_destroy_plan(this.iplan);
          _fftwf_free(this.rptr);
        }
      };
    };
    const r2r2dFactory = (forwardType, inverseType) => {
      return class R2RFFT2D {
        constructor(n0, n1) {
          this.n0 = n0;
          this.n1 = n1;
          this.size = this.n0 * this.n1;
          this.rptr = _fftwf_malloc(this.size * 4);
          this.cptr = _fftwf_malloc(this.size * 4);
          this.r = new Float32Array(fftwModule.HEAPU8.buffer, this.rptr, this.size);
          this.c = new Float32Array(fftwModule.HEAPU8.buffer, this.cptr, this.size);
          this.fplan = _fftwf_plan_r2r_2d(this.n0, this.n1, this.rptr, this.cptr, forwardType, forwardType, FFTW_ESTIMATE);
          this.iplan = _fftwf_plan_r2r_2d(this.n0, this.n1, this.cptr, this.rptr, inverseType, inverseType, FFTW_ESTIMATE);
        }
        forward(real) {
          if (typeof real === "function")
            real(this.r);
          else
            this.r.set(real);
          _fftwf_execute(this.fplan);
          return this.c;
        }
        inverse(cpx) {
          if (typeof cpx === "function")
            cpx(this.c);
          else
            this.c.set(cpx);
          _fftwf_execute(this.iplan);
          return this.r;
        }
        dispose() {
          _fftwf_destroy_plan(this.fplan);
          _fftwf_destroy_plan(this.iplan);
          _fftwf_free(this.rptr);
        }
      };
    };
    this.c2c = {
      FFT1D: C2CFFT1D,
      FFT2D: C2CFFT2D
    };
    this.r2c = {
      FFT1D: R2CFFT1D
    };
    this.r2r = {
      FFT1D: r2r1dFactory(FFTW_R2HC, FFTW_HC2R),
      DCT1D: r2r1dFactory(FFTW_REDFT10, FFTW_REDFT01),
      DST1D: r2r1dFactory(FFTW_RODFT10, FFTW_RODFT01),
      FFT2D: r2r2dFactory(FFTW_R2HC, FFTW_HC2R),
      DCT2D: r2r2dFactory(FFTW_REDFT10, FFTW_REDFT01),
      DST2D: r2r2dFactory(FFTW_RODFT10, FFTW_RODFT01)
    };
  }
};
var FFTW_default = FFTW;
export {
  FFTW_default as FFTW,
  instantiateFFTWModuleFromFile_default as instantiateFFTWModuleFromFile
};
//# sourceMappingURL=index.js.map
