const fs = require("node:fs")
const fsPromises = require("node:fs").promises
const UglifyJS = require("uglify-js")

async function main() {
	const jsFiles = [...await fsPromises.readdir("./assets/js"), ...(await fsPromises.readdir("./assets/js/transformers")).map(file => "transformers/" + file)]
		.filter(file => file.endsWith(".js")).map(file => "./assets/js/" + file)
	const fileContents = {}
	for (const file of jsFiles) {
		fileContents[file] = await fsPromises.readFile(file, "utf8")
	}

	const result = UglifyJS.minify(fileContents, {
		compress: false,
		mangle: false,
		sourceMap: {
			filename: "minified.js",
			root: "https://tomatenkuchen.com/assets/js/",
			url: "minified.js.map"
		}
	})
	console.log(result.code)
	console.log(result.map)
	await fsPromises.writeFile("./assets/js/minified.js", result.code)
	await fsPromises.writeFile("./assets/js/minified.js.map", result.map)
}
main()
