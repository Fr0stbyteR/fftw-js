const global = globalThis;

const cache = global.fetchModuleCache || new Map();

const fetchModule = async (url) => {
	const absoluteUrl = new URL(url, location.href).href;
	if (cache.has(absoluteUrl)) return cache.get(absoluteUrl);
	let exported;
	const toExport = {};
	global.exports = toExport;
	global.module = { exports: toExport };
	const esm = await import(/* webpackIgnore: true */absoluteUrl);
	const esmKeys = Object.keys(esm);
	if (esmKeys.length) exported = esm;
	else exported = global.module.exports;
	delete global.exports;
	delete global.module;
	cache.set(absoluteUrl, exported);
	return exported;
};

if (!global.fetchModuleCache) global.fetchModuleCache = cache;

export default fetchModule;
