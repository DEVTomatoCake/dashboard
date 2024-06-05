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
const minifyFile = async (inputPath, options = {}) => {
	const filename = inputPath.split("/").pop()
	const content = await fsPromises.readFile(inputPath, "utf8")

	let result = {}
	if (filename.endsWith(".js")) {
		result = UglifyJS.minify({
			[inputPath]: content
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
			toplevel: true,
			nameCache,
			//mangle: true,
			...defaultOptions,
			...options,
			mangle: false // temp override to fix re-defined variables
		})

		if (result.error) throw result.error
		if (result.warnings && result.warnings.length > defaultOptions.compress.passes) console.log(inputPath, result.warnings)
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
			map: output.sourceMap.toString().replace("$stdin", filename)
		}

		if (output.warnings.length > 0 || output.errors.length > 0) console.log(inputPath, output.warnings, output.errors)
	} else if (filename.endsWith(".json")) {
		result = {
			code: JSON.stringify(JSON.parse(content))
		}
	} else return console.error("Unknown minify file type: " + inputPath)

	if (result.code.length >= content.length) return console.log("No reduction for " + inputPath + " (" + content.length + " -> " + result.code.length + ")")

	if (process.env.MINIFY_ENABLED) {
		await fsPromises.writeFile(inputPath, result.code)
		if (result.map) await fsPromises.writeFile(inputPath + ".map", result.map)
	}

	results.push({
		path: inputPath.slice(2),
		size: content.length,
		compressed: result.code.length,
		"% reduction": parseFloat((100 - (result.code.length / content.length * 100)).toFixed(1))
	})
}

const generateSitemap = async () => {
	const files = await fsPromises.readdir("./")

	for await (const file of files.filter(f => f.endsWith(".html"))) {
		console.log(file + ": c: " + new Date((await fsPromises.stat(file)).ctimeMs).toISOString().slice(0, -1) + "+00:00, m: " +
			new Date((await fsPromises.stat(file)).mtimeMs).toISOString().slice(0, -1) + "+00:00")
	}
}

const minify = async () => {
	await generateSitemap()

	await minifyFile("./assets/js/script.js", {
		compress: {
			...defaultOptions.compress,
			top_retain: ["get", "getCookie", "setCookie", "deleteCookie", "encode", "assertInt", "handleError", "handleClickAndEnter", "sidebar", "fadeOut", "fadeIn", "openDialog"]
		},
		mangle: {
			reserved: ["get", "getCookie", "setCookie", "deleteCookie", "encode", "assertInt", "handleError", "handleClickAndEnter", "sidebar", "fadeOut", "fadeIn", "openDialog"]
		}
	})
	await minifyFile("./assets/js/emojipicker.js", {
		compress: {
			...defaultOptions.compress,
			top_retain: ["emojiPicker", "insertMention", "mentionPicker", "togglePicker", "updateSelected", "updateMultiSelected"]
		},
		mangle: {
			reserved: ["emojiPicker", "insertMention", "mentionPicker", "togglePicker", "updateSelected", "updateMultiSelected"]
		}
	})
	await minifyFile("./assets/js/language.js", {
		compress: {
			...defaultOptions.compress,
			top_retain: ["getLanguage", "reloadText"]
		},
		mangle: {
			reserved: ["getLanguage", "reloadText"]
		}
	})
	await minifyFile("./assets/js/sockette.js", {
		compress: {
			...defaultOptions.compress,
			top_retain: ["sockette"]
		},
		mangle: {
			reserved: ["sockette"]
		}
	})
	await minifyFile("./assets/js/toasts.js", {
		compress: {
			...defaultOptions.compress,
			top_retain: ["ToastNotification"]
		},
		mangle: {
			reserved: ["ToastNotification"]
		}
	})
	await minifyFile("./assets/js/messageeditor.js", {
		compress: {
			...defaultOptions.compress,
			top_retain: ["toggleMsgEditor"]
		},
		mangle: {
			reserved: ["toggleMsgEditor"]
		}
	})
	await minifyFile("./assets/js/instantpage-5.2.0.js")

	await minifyFile("./assets/js/transformers/invite.js")
	await minifyFile("./assets/js/transformers/login.js")
	await minifyFile("./assets/js/transformers/logout.js")
	await minifyFile("./assets/js/transformers/transcript.js")

	await minifyFile("./assets/emojipicker.css")
	await minifyFile("./assets/messageeditor.css")
	await minifyFile("./assets/style.css")
	await minifyFile("./assets/toasts.css")
	await minifyFile("./assets/transcript.css")

	const langFiles = await fsPromises.readdir("./assets/lang")
	for await (const file of langFiles) {
		await minifyFile("./assets/lang/" + file)
	}

	results.push({
		path: "= Total",
		size: results.reduce((acc, cur) => acc + cur.size, 0),
		compressed: results.reduce((acc, cur) => acc + cur.compressed, 0),
		"% reduction": parseFloat((100 - (results.reduce((acc, cur) => acc + cur.compressed, 0) / results.reduce((acc, cur) => acc + cur.size, 0) * 100)).toFixed(1))
	})
	console.table(results.sort((a, b) => a["% reduction"] - b["% reduction"]))
}
minify()
