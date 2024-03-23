const getLocalIpAddress = () => {
	for (const iface of Object.values(require("node:os").networkInterfaces())) {
		const ipv4 = iface.find(info => !info.internal && info.family == "IPv4")
		if (ipv4) return ipv4.address
	}
}

const { WebSocketServer } = require("ws")
const wss = new WebSocketServer({noServer: true})

wss.on("connection", ws => {
	ws.on("error", console.error)

	setInterval(() => {
		ws.ping()
	}, 45000)
})

const wsRestart =
	// eslint-disable-next-line no-useless-escape
	"<script\>" +
	"const devSocket = new WebSocket('ws://' + location.hostname + ':4269');" +
	"devSocket.onclose = () => location.reload();" +
	"</script>"

const fs = require("node:fs").promises
const express = require("express")
const app = express()

app.disable("x-powered-by")
app.disable("etag")
app.disable("view cache")

const httpServer = app.listen(4269)
httpServer.on("upgrade", (request, socket, head) => {
	wss.handleUpgrade(request, socket, head, ws => {
		wss.emit("connection", ws, request)
	})
})

const localIP = getLocalIpAddress()
app.listen(4269, localIP)
console.log("Running on http://" + localIP + ":4269 (no backend) and http://localhost:4269")

const redirects = {}
const loadRedirects = async () => {
	const redirectFile = await fs.readFile("./_redirects", "utf8")
	redirectFile.split("\n").filter(line => line.trim().length > 0).forEach(line => {
		const [from, to, status] = line.split(" ")
		redirects[from] = {
			to,
			status: status ? parseInt(status) : 301
		}
	})
}
loadRedirects()

const headers = {}
const loadHeaders = async () => {
	const headerFile = await fs.readFile("./_headers", "utf8")
	headerFile.split("\n").filter(line => line.trim().length > 0 && line.split(": ").length > 1).forEach(line => {
		const [key, ...value] = line.split(": ").map(part => part.trim())
		headers[key] = value.join(": ")
	})
}
loadHeaders()

app.get("*", async (req, res) => {
	if (redirects[req.url]) return res.redirect(redirects[req.url].status, redirects[req.url].to)
	if (req.url.includes("/assets/") || req.url.endsWith(".js") || req.url.endsWith(".json") || req.url.endsWith(".txt") || req.url.endsWith(".xml"))
		return res.sendFile(req.url, { root: ".", lastModified: false, dotfiles: "deny", maxAge: 0 })

	if (req.url == "/") req.url = "/index"
	const path = "." + req.url.replace(/\.[^/.]+$/, "").split("?")[0].split("#")[0] + ".html"

	try {
		const file = await fs.readFile(path, "utf8")
		res.set({
			...headers,
			"Cache-Control": "max-age=0, no-store, no-cache, must-revalidate"
		})
		res.send(file + wsRestart)
	} catch (e) {
		console.log(e)
		res.status(404).send({status: "error", message: "Unable to find file: " + path})
	}
})

process.on("SIGINT", () => wss.close())
