// Generated by dts-bundle-generator v6.2.0

/// <reference types="emscripten" />
/// <reference types="node" />

export declare type FFTWModuleFactory = EmscriptenModuleFactory<FFTWModule>;
export interface FFTWModule extends EmscriptenModule {
	ccall: typeof ccall;
	cwrap: typeof cwrap;
}
export interface FFT {
	forward(arr: ArrayLike<number>): Float32Array;
	inverse(arr: ArrayLike<number>): Float32Array;
	dispose(): void;
}
export declare class FFTW {
	c2c: {
		FFT1D: new (size: number) => FFT;
		FFT2D: new (n0: number, n1: number) => FFT;
	};
	r2c: {
		FFT1D: new (size: number) => FFT;
	};
	r2r: {
		FFT1D: new (size: number) => FFT;
		DCT1D: new (size: number) => FFT;
		DST1D: new (size: number) => FFT;
		FFT2D: new (n0: number, n1: number) => FFT;
		DCT2D: new (n0: number, n1: number) => FFT;
		DST2D: new (n0: number, n1: number) => FFT;
	};
	constructor(fftwModule: FFTWModule);
}
export declare const LibFFTW: FFTWModuleFactory;
declare const url: Uint8Array;
declare const instantiateFFTW: (FFTWIn?: typeof FFTW, LibFFTWIn?: FFTWModuleFactory, wasmBinaryIn?: Uint8Array) => Promise<FFTW>;
export default instantiateFFTW;

export {
	url as wasmBinary,
};

export {};
