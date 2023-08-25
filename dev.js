const { WebSocketServer } = require("ws")
const wss = new WebSocketServer({port: 6942})

wss.on("connection", ws => {
	ws.on("error", console.error)

	setInterval(() => {
		ws.ping()
	}, 45000)
})

const wsRestart =
	"<script>" +
	"const socket = new WebSocket('ws://localhost:6942');" +
	"socket.onclose = () => location.reload();" +
	"socket.onmessage = () => location.reload();" +
	"</script>"

const fs = require("node:fs").promises
const express = require("express")
const app = express()

app.listen(4269)
console.log("http://localhost:4269")

app.get("*", async (req, res) => {
	if (req.url.includes("/assets/") || req.url.endsWith(".js") || req.url.endsWith(".json") || req.url.endsWith(".txt") || req.url.endsWith(".xml"))
		return res.sendFile(req.url, { root: ".", lastModified: false, dotfiles: "deny", maxAge: req.query.nocache ? 0 : 60000 })

	if (req.url == "/") req.url = "/index"
	try {
		const file = await fs.readFile("." + req.url.replace(/\.[^/.]+$/, "") + ".html", "utf8")
		res.send(file + wsRestart)
	} catch (e) {
		console.log(e)
		res.status(404).send({status: "error", message: "Unable to find file: ." + req.url.replace(/\.[^/.]+$/, "") + ".html"})
	}
})

process.on("SIGINT", () => wss.close())
