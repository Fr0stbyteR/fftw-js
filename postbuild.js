//@ts-check
const path = require("path");
const fs = require("fs");

/**
 * @param {string} src
 * @param {string} dest
 */
const cpSync = (src, dest) => {
    if (!fs.existsSync(src)) return;
    if (fs.lstatSync(src).isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest);
        fs.readdirSync(src).forEach(child => cpSync(path.join(src, child), path.join(dest, child)));
    } else {
        fs.copyFileSync(src, dest);
    }
};

/**
 * @param {string} dir
 */
 const rmSync = (dir) => {
    if (!fs.existsSync(dir)) return;
    if (fs.lstatSync(dir).isDirectory()) {
        fs.readdirSync(dir).forEach(child => rmSync(path.join(dir, child)));
        fs.rmdirSync(dir);
    } else {
        fs.unlinkSync(dir);
    }
};

const fftwWasmDistPath = path.join(__dirname, "./dist");
const fftwWasmDistEsmPath = path.join(__dirname, "./dist/esm");

fs.copyFileSync(path.join(fftwWasmDistPath, "index.d.ts"), path.join(fftwWasmDistEsmPath, "index.d.ts"));

module.exports = { cpSync, rmSync };
