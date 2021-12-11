import type { FFT, FFTWModule } from "./types";

class FFTW {
    c2c: { FFT1D: new (size: number) => FFT; FFT2D: new (n0: number, n1: number) => FFT; };
    r2c: { FFT1D: new (size: number) => FFT; };
    r2r: { FFT1D: new (size: number) => FFT; DCT1D: new (size: number) => FFT; DST1D: new (size: number) => FFT; FFT2D: new (n0: number, n1: number) => FFT; DCT2D: new (n0: number, n1: number) => FFT; DST2D: new (n0: number, n1: number) => FFT; };
    constructor(fftwModule: FFTWModule) {
        const FFTW_ESTIMATE = (1 << 6);
        
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
        
        const fftwf_plan_dft_r2c_1d = fftwModule.cwrap(
            "fftwf_plan_dft_r2c_1d", "number", ["number", "number", "number", "number"]
        );

        const fftwf_plan_dft_c2r_1d = fftwModule.cwrap(
            "fftwf_plan_dft_c2r_1d", "number", ["number", "number", "number", "number"]
        );

        // fftw_plan fftw_plan_r2r_1d(int n, double *in, double *out,
        //                            fftw_r2r_kind kind, unsigned flags);
        const fftwf_plan_r2r_1d = fftwModule.cwrap(
            "fftwf_plan_r2r_1d", "number", ["number", "number", "number", "number", "number"]
        );

        // fftw_plan fftw_plan_r2r_2d(int n0, int n1, double *in, double *out,
        //                            fftw_r2r_kind kind0, fftw_r2r_kind kind1,
        //                            unsigned flags);
        const fftwf_plan_r2r_2d = fftwModule.cwrap(
            "fftwf_plan_r2r_2d", "number", ["number", "number", "number", "number", "number", "number", "number"]
        );
        // fftw_plan fftw_plan_dft_1d(int n, fftw_complex *in, fftw_complex *out,
        //                            int sign, unsigned flags)
        const fftwf_plan_dft_1d = fftwModule.cwrap(
            "fftwf_plan_dft_1d", "number", ["number", "number", "number", "number", "number"]
        );

        // fftw_plan fftw_plan_dft_2d(int n0, int n1,
        //                            fftw_complex *in, fftw_complex *out,
        //                            int sign, unsigned flags)
        const fftwf_plan_dft_2d = fftwModule.cwrap(
            "fftwf_plan_dft_2d", "number", ["number", "number", "number", "number", "number", "number"]
        );

        const fftwf_execute = fftwModule.cwrap(
            "fftwf_execute", null, ["number"]
        );

        const fftwf_destroy_plan = fftwModule.cwrap(
            "fftwf_destroy_plan", null, ["number"]
        );

        const fftwf_free = fftwModule.cwrap(
            "fftwf_free", null, ["number"]
        );

        const fftwf_malloc = fftwModule.cwrap(
            "fftwf_malloc", "number", ["number"]
        );

        class C2CFFT2D implements FFT {
            n0: number;
            n1: number;
            size: number;
            c0ptr: number;
            c1ptr: number;
            c0: Float32Array;
            c1: Float32Array;
            fplan: number;
            iplan: number;
            constructor(n0: number, n1: number) {
                this.n0 = n0;
                this.n1 = n1;

                this.size = n0 * n1;
                this.c0ptr = fftwf_malloc(2 * 4 * this.size);
                this.c1ptr = fftwf_malloc(2 * 4 * this.size);

                this.c0 = new Float32Array(fftwModule.HEAPU8.buffer, this.c0ptr, 2 * this.size); // two for complex
                this.c1 = new Float32Array(fftwModule.HEAPU8.buffer, this.c1ptr, 2 * this.size);

                this.fplan = fftwf_plan_dft_2d(this.n0, this.n1, this.c0ptr, this.c1ptr, FFTW_FORWARD, FFTW_ESTIMATE);
                this.iplan = fftwf_plan_dft_2d(this.n0, this.n1, this.c1ptr, this.c0ptr, FFTW_BACKWARD, FFTW_ESTIMATE);
            }

            forward(cpx: ArrayLike<number>) {
                this.c0.set(cpx);
                fftwf_execute(this.fplan);
                return new Float32Array(fftwModule.HEAPU8.buffer, this.c1ptr, 2 * this.size);
            }

            inverse(cpx: ArrayLike<number>) {
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

        class C2CFFT1D implements FFT {
            size: number;
            c0ptr: number;
            c1ptr: number;
            c0: Float32Array;
            c1: Float32Array;
            fplan: number;
            iplan: number;
            constructor(size: number) {
                this.size = size;
                // this.c0ptr = fftwf_malloc(2*4*size + 2*4*size);
                // this.c1ptr = this.c0ptr;
                this.c0ptr = fftwf_malloc(2 * 4 * this.size);
                this.c1ptr = fftwf_malloc(2 * 4 * this.size);

                this.c0 = new Float32Array(fftwModule.HEAPU8.buffer, this.c0ptr, 2 * size);
                this.c1 = new Float32Array(fftwModule.HEAPU8.buffer, this.c1ptr, 2 * size);

                this.fplan = fftwf_plan_dft_1d(size, this.c0ptr, this.c1ptr, FFTW_FORWARD, FFTW_ESTIMATE);
                this.iplan = fftwf_plan_dft_1d(size, this.c1ptr, this.c0ptr, FFTW_BACKWARD, FFTW_ESTIMATE);
            }

            forward(cpx: ArrayLike<number>) {
                this.c0.set(cpx);
                fftwf_execute(this.fplan);
                return new Float32Array(fftwModule.HEAPU8.buffer, this.c1ptr, 2 * this.size);
            }

            inverse(cpx: ArrayLike<number>) {
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

        class R2CFFT1D implements FFT {
            size: number;
            rptr: number;
            cptr: number;
            r: Float32Array;
            c: Float32Array;
            fplan: number;
            iplan: number;
            constructor(size: number) {
                this.size = size;
                this.rptr = fftwf_malloc(size * 4 + (size + 2) * 4);
                this.cptr = this.rptr + size * 4;

                this.r = new Float32Array(fftwModule.HEAPU8.buffer, this.rptr, size);
                this.c = new Float32Array(fftwModule.HEAPU8.buffer, this.cptr, size + 2);

                this.fplan = fftwf_plan_dft_r2c_1d(size, this.rptr, this.cptr, FFTW_ESTIMATE);
                this.iplan = fftwf_plan_dft_c2r_1d(size, this.cptr, this.rptr, FFTW_ESTIMATE);
            }

            forward(real: ArrayLike<number>) {
                this.r.set(real);
                fftwf_execute(this.fplan);
                return new Float32Array(fftwModule.HEAPU8.buffer, this.cptr, this.size + 2);
            }

            inverse(cpx: ArrayLike<number>) {
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

        const r2r1dFactory = (forwardType: number, inverseType: number) => {
            return class R2RFFT1D implements FFT {
                size: number;
                rptr: number;
                cptr: number;
                r: Float32Array;
                c: Float32Array;
                fplan: number;
                iplan: number;
                constructor(size: number) {
                    this.size = size;
                    this.rptr = fftwf_malloc(size * 4 + size * 4);

                    this.cptr = this.rptr;
                    this.r = new Float32Array(fftwModule.HEAPU8.buffer, this.rptr, size);
                    this.c = new Float32Array(fftwModule.HEAPU8.buffer, this.cptr, size);

                    this.fplan = fftwf_plan_r2r_1d(size, this.rptr, this.cptr, forwardType, FFTW_ESTIMATE);
                    this.iplan = fftwf_plan_r2r_1d(size, this.cptr, this.rptr, inverseType, FFTW_ESTIMATE);
                }

                forward(real: ArrayLike<number>) {
                    this.r.set(real);
                    fftwf_execute(this.fplan);
                    return new Float32Array(fftwModule.HEAPU8.buffer, this.cptr, this.size);
                }

                inverse(cpx: ArrayLike<number>) {
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
        };

        const r2r2dFactory = (forwardType: number, inverseType: number) => {
            return class R2RFFT2D implements FFT {
                n0: number;
                n1: number;
                size: number;
                rptr: number;
                cptr: number;
                r: Float32Array;
                c: Float32Array;
                fplan: number;
                iplan: number;
                constructor(n0: number, n1: number) {
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
                
                forward(real: ArrayLike<number>) {
                    this.r.set(real);
                    fftwf_execute(this.fplan);
                    return new Float32Array(fftwModule.HEAPU8.buffer, this.cptr, this.size);
                }

                inverse(cpx: ArrayLike<number>) {
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
        }
    }
}

export default FFTW;
