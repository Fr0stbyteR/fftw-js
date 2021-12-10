var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/index.ts
__export(exports, {
  FFTW: () => FFTW_default,
  default: () => src_default,
  instantiateFFTWModule: () => instantiateFFTWModule_default
});

// src/fetchModule.ts
var global = globalThis;
var cache = global.fetchModuleCache || /* @__PURE__ */ new Map();
var fetchModule = async (url) => {
  const absoluteUrl = new URL(url, location.href).href;
  if (cache.has(absoluteUrl))
    return cache.get(absoluteUrl);
  let exported;
  const toExport = {};
  global.exports = toExport;
  global.module = { exports: toExport };
  const esm = await import(
    /* webpackIgnore: true */
    absoluteUrl
  );
  const esmKeys = Object.keys(esm);
  if (esmKeys.length)
    exported = esm;
  else
    exported = global.module.exports;
  delete global.exports;
  delete global.module;
  cache.set(absoluteUrl, exported);
  return exported;
};
if (!global.fetchModuleCache)
  global.fetchModuleCache = cache;
var fetchModule_default = fetchModule;

// src/instantiateFFTWModule.ts
var instantiateFFTWModule = async (jsFile, wasmFile = jsFile.replace(/c?js$/, "wasm")) => {
  let LibFFTW;
  try {
    LibFFTW = require(jsFile);
  } catch (error) {
    LibFFTW = await fetchModule_default(jsFile);
  }
  const locateFile = (url, scriptDirectory) => ({
    "libfftw3.wasm": wasmFile
  })[url] || scriptDirectory + url;
  const libFaust = await LibFFTW({ locateFile });
  return libFaust;
};
var instantiateFFTWModule_default = instantiateFFTWModule;

// src/FFTW.ts
var FFTW_ESTIMATE = 1 << 6;
var FFTW_R2HC = 0;
var FFTW_HC2R = 1;
var FFTW_REDFT10 = 5;
var FFTW_REDFT01 = 4;
var FFTW_RODFT10 = 9;
var FFTW_RODFT01 = 8;
var FFTW_FORWARD = -1;
var FFTW_BACKWARD = 1;
var FFTW = class {
  constructor(fftwModule) {
    const fftwf_plan_dft_r2c_1d = fftwModule.cwrap("fftwf_plan_dft_r2c_1d", "number", ["number", "number", "number", "number"]);
    const fftwf_plan_dft_c2r_1d = fftwModule.cwrap("fftwf_plan_dft_c2r_1d", "number", ["number", "number", "number", "number"]);
    const fftwf_plan_r2r_1d = fftwModule.cwrap("fftwf_plan_r2r_1d", "number", ["number", "number", "number", "number", "number"]);
    const fftwf_plan_r2r_2d = fftwModule.cwrap("fftwf_plan_r2r_2d", "number", ["number", "number", "number", "number", "number", "number", "number"]);
    const fftwf_plan_dft_1d = fftwModule.cwrap("fftwf_plan_dft_1d", "number", ["number", "number", "number", "number", "number"]);
    const fftwf_plan_dft_2d = fftwModule.cwrap("fftwf_plan_dft_2d", "number", ["number", "number", "number", "number", "number", "number"]);
    const fftwf_execute = fftwModule.cwrap("fftwf_execute", null, ["number"]);
    const fftwf_destroy_plan = fftwModule.cwrap("fftwf_destroy_plan", null, ["number"]);
    const fftwf_free = fftwModule.cwrap("fftwf_free", null, ["number"]);
    const fftwf_malloc = fftwModule.cwrap("fftwf_malloc", "number", ["number"]);
    class C2CFFT2D {
      constructor(n0, n1) {
        this.n0 = n0;
        this.n1 = n1;
        this.size = n0 * n1;
        this.c0ptr = fftwf_malloc(2 * 4 * this.size);
        this.c1ptr = fftwf_malloc(2 * 4 * this.size);
        this.c0 = new Float32Array(fftwModule.HEAPU8.buffer, this.c0ptr, 2 * this.size);
        this.c1 = new Float32Array(fftwModule.HEAPU8.buffer, this.c1ptr, 2 * this.size);
        this.fplan = fftwf_plan_dft_2d(this.n0, this.n1, this.c0ptr, this.c1ptr, FFTW_FORWARD, FFTW_ESTIMATE);
        this.iplan = fftwf_plan_dft_2d(this.n0, this.n1, this.c1ptr, this.c0ptr, FFTW_BACKWARD, FFTW_ESTIMATE);
      }
      forward(cpx) {
        this.c0.set(cpx);
        fftwf_execute(this.fplan);
        return new Float32Array(fftwModule.HEAPU8.buffer, this.c1ptr, 2 * this.size);
      }
      inverse(cpx) {
        this.c1.set(cpx);
        fftwf_execute(this.iplan);
        return new Float32Array(fftwModule.HEAPU8.buffer, this.c0ptr, 2 * this.size);
      }
      dispose() {
        fftwf_destroy_plan(this.fplan);
        fftwf_destroy_plan(this.iplan);
        fftwf_free(this.c0ptr);
        fftwf_free(this.c1ptr);
      }
    }
    class C2CFFT1D {
      constructor(size) {
        this.size = size;
        this.c0ptr = fftwf_malloc(2 * 4 * this.size);
        this.c1ptr = fftwf_malloc(2 * 4 * this.size);
        this.c0 = new Float32Array(fftwModule.HEAPU8.buffer, this.c0ptr, 2 * size);
        this.c1 = new Float32Array(fftwModule.HEAPU8.buffer, this.c1ptr, 2 * size);
        this.fplan = fftwf_plan_dft_1d(size, this.c0ptr, this.c1ptr, FFTW_FORWARD, FFTW_ESTIMATE);
        this.iplan = fftwf_plan_dft_1d(size, this.c1ptr, this.c0ptr, FFTW_BACKWARD, FFTW_ESTIMATE);
      }
      forward(cpx) {
        this.c0.set(cpx);
        fftwf_execute(this.fplan);
        return new Float32Array(fftwModule.HEAPU8.buffer, this.c1ptr, 2 * this.size);
      }
      inverse(cpx) {
        this.c1.set(cpx);
        fftwf_execute(this.iplan);
        return new Float32Array(fftwModule.HEAPU8.buffer, this.c0ptr, 2 * this.size);
      }
      dispose() {
        fftwf_destroy_plan(this.fplan);
        fftwf_destroy_plan(this.iplan);
        fftwf_free(this.c0ptr);
        fftwf_free(this.c1ptr);
      }
    }
    class R2CFFT1D {
      constructor(size) {
        this.size = size;
        this.rptr = fftwf_malloc(size * 4 + (size + 2) * 4);
        this.cptr = this.rptr + size * 4;
        this.r = new Float32Array(fftwModule.HEAPU8.buffer, this.rptr, size);
        this.c = new Float32Array(fftwModule.HEAPU8.buffer, this.cptr, size + 2);
        this.fplan = fftwf_plan_dft_r2c_1d(size, this.rptr, this.cptr, FFTW_ESTIMATE);
        this.iplan = fftwf_plan_dft_c2r_1d(size, this.cptr, this.rptr, FFTW_ESTIMATE);
      }
      forward(real) {
        this.r.set(real);
        fftwf_execute(this.fplan);
        return new Float32Array(fftwModule.HEAPU8.buffer, this.cptr, this.size + 2);
      }
      inverse(cpx) {
        this.c.set(cpx);
        fftwf_execute(this.iplan);
        return new Float32Array(fftwModule.HEAPU8.buffer, this.rptr, this.size);
      }
      dispose() {
        fftwf_destroy_plan(this.fplan);
        fftwf_destroy_plan(this.iplan);
        fftwf_free(this.rptr);
      }
    }
    const r2r1dFactory = (forwardType, inverseType) => {
      return class R2RFFT1D {
        constructor(size) {
          this.size = size;
          this.rptr = fftwf_malloc(size * 4 + size * 4);
          this.cptr = this.rptr;
          this.r = new Float32Array(fftwModule.HEAPU8.buffer, this.rptr, size);
          this.c = new Float32Array(fftwModule.HEAPU8.buffer, this.cptr, size);
          this.fplan = fftwf_plan_r2r_1d(size, this.rptr, this.cptr, forwardType, FFTW_ESTIMATE);
          this.iplan = fftwf_plan_r2r_1d(size, this.cptr, this.rptr, inverseType, FFTW_ESTIMATE);
        }
        forward(real) {
          this.r.set(real);
          fftwf_execute(this.fplan);
          return new Float32Array(fftwModule.HEAPU8.buffer, this.cptr, this.size);
        }
        inverse(cpx) {
          this.c.set(cpx);
          fftwf_execute(this.iplan);
          return new Float32Array(fftwModule.HEAPU8.buffer, this.rptr, this.size);
        }
        dispose() {
          fftwf_destroy_plan(this.fplan);
          fftwf_destroy_plan(this.iplan);
          fftwf_free(this.rptr);
        }
      };
    };
    const r2r2dFactory = (forwardType, inverseType) => {
      return class R2RFFT2D {
        constructor(n0, n1) {
          this.n0 = n0;
          this.n1 = n1;
          this.size = this.n0 * this.n1;
          this.rptr = fftwf_malloc(this.size * 4);
          this.cptr = fftwf_malloc(this.size * 4);
          this.r = new Float32Array(fftwModule.HEAPU8.buffer, this.rptr, this.size);
          this.c = new Float32Array(fftwModule.HEAPU8.buffer, this.cptr, this.size);
          this.fplan = fftwf_plan_r2r_2d(this.n0, this.n1, this.rptr, this.cptr, forwardType, forwardType, FFTW_ESTIMATE);
          this.iplan = fftwf_plan_r2r_2d(this.n0, this.n1, this.cptr, this.rptr, inverseType, inverseType, FFTW_ESTIMATE);
        }
        forward(real) {
          this.r.set(real);
          fftwf_execute(this.fplan);
          return new Float32Array(fftwModule.HEAPU8.buffer, this.cptr, this.size);
        }
        inverse(cpx) {
          this.c.set(cpx);
          fftwf_execute(this.iplan);
          return new Float32Array(fftwModule.HEAPU8.buffer, this.rptr, this.size);
        }
        dispose() {
          fftwf_destroy_plan(this.fplan);
          fftwf_destroy_plan(this.iplan);
          fftwf_free(this.rptr);
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

// src/index.ts
var src_default = {
  instantiateFFTWModule: instantiateFFTWModule_default,
  FFTW: FFTW_default
};
//# sourceMappingURL=index.js.map
