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

const minifyFile = async (path, options = {}) => {
	const content = await fsPromises.readFile(path, "utf8")
	const result = UglifyJS.minify({
		[path]: content
	}, {
		sourceMap: {
			root: "https://tomatenkuchen.com/assets/js/",
			filename: path.split("/").pop(),
			url: path.split("/").pop() + ".map"
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
		await fsPromises.writeFile("./assets/js/script.js", result.code)
		await fsPromises.writeFile("./assets/js/script.js.map", result.map)
	}
}

async function main() {
	await minifyFile("./assets/js/script.js", {
		module: false
	})
	await minifyFile("./assets/js/toasts.js", {
		module: false
	})
	await minifyFile("./assets/js/instantpage-5.2.0.js", {
		toplevel: true
	})
}
main()
