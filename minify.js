const fsPromises = require("node:fs").promises
const UglifyJS = require("uglify-js")

const nameCache = {}
const defaultOptions = {
	warnings: "verbose",
	parse: {
		shebang: false
	},
	compress: {
		passes: 2,
		unsafe: true,
		unsafe_Function: true,
		unsafe_math: true,
		unsafe_proto: true,
		unsafe_regexp: true
	},
	nameCache,
	mangle: true
}

async function main() {
	let result = UglifyJS.minify({
		"script.js": await fsPromises.readFile("./assets/js/script.js", "utf8")
	}, {
		sourceMap: {
			root: "https://tomatenkuchen.com/assets/js/",
			filename: "script.js",
			url: "script.js.map"
		},
		module: false,
		...defaultOptions
	})
	if (result.error) throw result.error
	if (result.warnings) console.log(result.warnings)

	if (process.env.MINIFY_ENABLED) {
		await fsPromises.writeFile("./assets/js/script.js", result.code)
		await fsPromises.writeFile("./assets/js/script.js.map", result.map)
	}

	result = UglifyJS.minify({
		"toasts.js": await fsPromises.readFile("./assets/js/toasts.js", "utf8")
	}, {
		sourceMap: {
			root: "https://tomatenkuchen.com/assets/js/",
			filename: "toasts.js",
			url: "toasts.js.map"
		},
		module: false,
		...defaultOptions
	})
	if (result.error) throw result.error
	if (result.warnings) console.log(result.warnings)

	if (process.env.MINIFY_ENABLED) {
		await fsPromises.writeFile("./assets/js/toasts.js", result.code)
		await fsPromises.writeFile("./assets/js/toasts.js.map", result.map)
	}

	result = UglifyJS.minify({
		"instantpage-5.2.0.js": await fsPromises.readFile("./assets/js/instantpage-5.2.0.js", "utf8")
	}, {
		sourceMap: {
			root: "https://tomatenkuchen.com/assets/js/",
			filename: "instantpage-5.2.0.js",
			url: "instantpage-5.2.0.js.map"
		},
		toplevel: true,
		...defaultOptions
	})
	if (result.error) throw result.error
	if (result.warnings) console.log(result.warnings)

	if (process.env.MINIFY_ENABLED) {
		await fsPromises.writeFile("./assets/js/instantpage-5.2.0.js", result.code)
		await fsPromises.writeFile("./assets/js/instantpage-5.2.0.js.map", result.map)
	}
}
main()
