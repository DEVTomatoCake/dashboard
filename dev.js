const { WebSocketServer } = require("ws")
const wss = new WebSocketServer({port: 6942})

wss.on("connection", ws => {
	ws.on("error", console.error)

	setInterval(() => {
		ws.ping()
	}, 45000)
})

const cachingEnabled = process.argv.includes("-c") || process.argv.includes("--cache")
const wsRestart =
	"<script>" +
	"const devSocket = new WebSocket('ws://localhost:6942');" +
	"devSocket.onclose = () => location.reload();" +
	"devSocket.onmessage = () => location.reload();" +
	"</script>"

const fs = require("node:fs").promises
const express = require("express")
const app = express()

app.disable("x-powered-by")
if (!cachingEnabled) {
	app.disable("etag")
	app.disable("view cache")
}

app.listen(4269)
console.log("http://localhost:4269 with" + (cachingEnabled ? "" : "out") + " caching")

app.get("*", async (req, res) => {
	if (req.url.includes("/assets/") || req.url.endsWith(".js") || req.url.endsWith(".json") || req.url.endsWith(".txt") || req.url.endsWith(".xml"))
		return res.sendFile(req.url, { root: ".", lastModified: false, dotfiles: "deny", maxAge: cachingEnabled ? (!req.query.cache || isNaN(req.query.cache) ? 120000 : parseInt(req.query.cache)) : 0 })

	if (req.url == "/") req.url = "/index"
	const path = "." + req.url.replace(/\.[^/.]+$/, "").split("?")[0].split("#")[0] + ".html"

	try {
		const file = await fs.readFile(path, "utf8")
		res.set({
			"Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
			Pragma: "no-cache",
			Expires: 0
		})
		res.send(file + wsRestart)
	} catch (e) {
		console.log(e)
		res.status(404).send({status: "error", message: "Unable to find file: " + path})
	}
})

process.on("SIGINT", () => wss.close())
