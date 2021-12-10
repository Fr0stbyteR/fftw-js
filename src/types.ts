export type FFTWModuleFactory = EmscriptenModuleFactory<FFTWModule>;

export interface FFTWModule extends EmscriptenModule {
    ccall: typeof ccall;
    cwrap: typeof cwrap;
}

export interface FFT {
    forward(arr: ArrayLike<number>): Float32Array;
    inverse(arr: ArrayLike<number>): Float32Array;
    dispose(): void;
}
