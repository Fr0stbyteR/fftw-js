//@ts-check
// import { cpSync, rmSync } from "./fileutils.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// @ts-ignore
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// @ts-ignore
const __filename = fileURLToPath(import.meta.url);

const distPath = path.join(__dirname, "./dist/cjs");
const distEsmPath = path.join(__dirname, "./dist/esm");
const distBundlePath = path.join(__dirname, "./dist/cjs-bundle");
const distEsmBundlePath = path.join(__dirname, "./dist/esm-bundle");
fs.copyFileSync(path.join(distPath, "index.d.ts"), path.join(distEsmPath, "index.d.ts"));
fs.copyFileSync(path.join(distBundlePath, "index.d.ts"), path.join(distEsmBundlePath, "index.d.ts"));

console.log("dts files copied.")
