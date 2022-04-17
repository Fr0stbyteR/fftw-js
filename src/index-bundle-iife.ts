import * as fftwwasm from "./exports-bundle";
// export default fftwwasm;
// Bug with dts-bundle-generator

export * from "./exports-bundle";

(globalThis as any).fftwwasm = fftwwasm;
