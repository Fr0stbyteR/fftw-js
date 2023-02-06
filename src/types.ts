export type FFTWModuleFactory = EmscriptenModuleFactory<FFTWModule>;

export interface FFTWModule extends EmscriptenModule {
    ccall: typeof ccall;
    cwrap: typeof cwrap;
    _fftwf_plan_dft_r2c_1d: (n: number, $in: number, $out: number, flags: number) => number,
    _fftwf_plan_dft_c2r_1d: (n: number, $in: number, $out: number, flags: number) => number,
    _fftwf_plan_r2r_1d: (n: number, $in: number, $out: number, kind: number, flags: number) => number,
    _fftwf_plan_r2r_2d: (n0: number, n1: number, $in: number, $out: number, kind0: number, kind1: number, flags: number) => number,
    _fftwf_plan_dft_1d: (n: number, $in: number, $out: number, sign: number, flags: number) => number,
    _fftwf_plan_dft_2d: (n0: number, n1: number, $in: number, $out: number, sign: number, flags: number) => number,
    _fftwf_execute: ($plan: number) => void,
    _fftwf_destroy_plan: ($plan: number) => void,
    _fftwf_free: ($: number) => void,
    _fftwf_malloc: (size: number) => number
}

export interface FFT {
    forward(arr: ArrayLike<number>): Float32Array;
    inverse(arr: ArrayLike<number>): Float32Array;
    dispose(): void;
}
