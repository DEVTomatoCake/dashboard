const fsPromises = require("node:fs").promises
const UglifyJS = require("uglify-js")

//(await fsPromises.readdir("./assets/js/transformers")).filter(file => file.endsWith(".js")).map(file => "./assets/js/transformers/" + file)
const nameCache = {}

async function main() {
	const result = UglifyJS.minify({
		"script.js": await fsPromises.readFile("./assets/js/script.js", "utf8")
	}, {
		warnings: "verbose",
		sourceMap: {
			root: "https://tomatenkuchen.com/assets/js/",
			filename: "script.js",
			url: "script.js.map"
		},
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
		mangle: true,
		nameCache
	})
	if (result.error) throw result.error
	if (result.warnings) console.log(result.warnings)

	console.log(process.env)
	if (process.env.MINIFY_ENABLED) {
		await fsPromises.writeFile("./assets/js/script.js", result.code)
		await fsPromises.writeFile("./assets/js/script.js.map", result.map)
	}
}
main()
