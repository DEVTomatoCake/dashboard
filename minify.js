const fsPromises = require("node:fs").promises
const UglifyJS = require("uglify-js")

const nameCache = {}
const defaultOptions = {
	compress: {
		passes: 2,
		unsafe: true,
		unsafe_Function: true,
		unsafe_math: true,
		unsafe_proto: true,
		unsafe_regexp: true
	}
}

const results = []
const minifyFile = async (path, options = {}) => {
	const filename = path.split("/").pop()
	const content = await fsPromises.readFile(path, "utf8")

	const result = UglifyJS.minify({
		[path]: content
	}, {
		sourceMap: {
			root: "https://tomatenkuchen.com/assets/js/",
			filename,
			url: filename + ".map"
		},
		warnings: "verbose",
		parse: {
			shebang: false
		},
		nameCache,
		mangle: true,
		...defaultOptions,
		...options
	})

	if (result.error) throw result.error
	if (result.warnings && result.warnings.length > defaultOptions.compress.passes) console.log(path, result.warnings)

	if (process.env.MINIFY_ENABLED) {
		await fsPromises.writeFile(path, result.code)
		await fsPromises.writeFile(path + ".map", result.map)
	}

	results.push({
		path: path.slice(2),
		size: content.length,
		compressed: result.code.length,
		"% reduction": parseFloat((100 - (result.code.length / content.length * 100)).toFixed(1))
	})
}

async function main() {
	await minifyFile("./assets/js/script.js", {
		module: false
	})
	await minifyFile("./assets/js/toasts.js", {
		toplevel: true,
		compress: {
			...defaultOptions.compress,
			top_retain: ["ToastNotification"]
		},
		mangle: {
			reserved: ["ToastNotification"]
		}
	})
	await minifyFile("./assets/js/sockette.js", {
		toplevel: true,
		compress: {
			...defaultOptions.compress,
			top_retain: ["sockette"]
		},
		mangle: {
			reserved: ["sockette"]
		}
	})
	await minifyFile("./assets/js/language.js", {
		toplevel: true,
		compress: {
			...defaultOptions.compress,
			top_retain: ["getLanguage", "reloadText"]
		},
		mangle: {
			reserved: ["getLanguage", "reloadText"]
		}
	})
	await minifyFile("./assets/js/messageeditor.js", {
		toplevel: true,
		compress: {
			...defaultOptions.compress,
			top_retain: ["toggleMsgEditor"]
		},
		mangle: {
			reserved: ["toggleMsgEditor"]
		}
	})
	await minifyFile("./assets/js/instantpage-5.2.0.js", {
		toplevel: true
	})

	results.push({
		path: "= Total",
		size: results.reduce((acc, cur) => acc + cur.size, 0),
		compressed: results.reduce((acc, cur) => acc + cur.compressed, 0),
		"% reduction": parseFloat((100 - (results.reduce((acc, cur) => acc + cur.compressed, 0) / results.reduce((acc, cur) => acc + cur.size, 0) * 100)).toFixed(1))
	})
	console.table(results.sort((a, b) => a["% reduction"] - b["% reduction"]))
}
main()
