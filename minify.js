const fsPromises = require("node:fs").promises

const UglifyJS = require("uglify-js")
const CleanCSS = require("clean-css")

const nameCache = {}
const defaultOptions = {
	compress: {
		passes: 5,
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

	let result = {}
	if (filename.endsWith(".js")) {
		result = UglifyJS.minify({
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
	} else if (filename.endsWith(".css")) {
		const clean = new CleanCSS({
			compatibility: {
				colors: {
					hexAlpha: true
				},
				properties: {
					shorterLengthUnits: true,
					urlQuotes: false
				}
			},
			level: {
				2: {
					mergeSemantically: true,
					removeUnusedAtRules: true
				}
			},
			inline: false,
			sourceMap: true,
			...options
		})

		const output = clean.minify(content)
		result = {
			code: output.styles + "\n/*# sourceMappingURL=" + filename + ".map */",
			map: output.sourceMap.toString()
		}

		if (output.warnings.length > 0 || output.errors.length > 0) console.log(path, output.warnings, output.errors)
	} else return console.error("Unknown minify file type: " + path)

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

	await minifyFile("./assets/emojipicker.css")
	await minifyFile("./assets/messageeditor.css")
	await minifyFile("./assets/style.css")
	await minifyFile("./assets/toasts.css")

	results.push({
		path: "= Total",
		size: results.reduce((acc, cur) => acc + cur.size, 0),
		compressed: results.reduce((acc, cur) => acc + cur.compressed, 0),
		"% reduction": parseFloat((100 - (results.reduce((acc, cur) => acc + cur.compressed, 0) / results.reduce((acc, cur) => acc + cur.size, 0) * 100)).toFixed(1))
	})
	console.table(results.sort((a, b) => a["% reduction"] - b["% reduction"]))
}
main()
