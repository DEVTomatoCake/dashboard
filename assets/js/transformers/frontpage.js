const formatServer = server => "" +
	"<img src='" + encode(server.icon) + "' alt='Server icon of " + encode(server.name) + "'>" +
	"<div>" +
	"<h3>" + encode(server.name) + "</h3>" +
	"<p>🟢 <b>" + server.online?.toLocaleString() + "</b> online⠀🔘 <b>" + server.members.toLocaleString() + "</b> <span translation='main.members'></span></p>" +
	"<p class='since'><span translation='main.botsince'></span><br><b>" + encode(server.botsince) + "</b></p>" +
	"</div>"

let servers = []
getBotstats().then(json => {
	document.getElementById("stats-guilds").textContent = json.guilds
	document.getElementById("stats-uptime").textContent = json.uptime_ratio.toFixed(2) + (getLanguage() == "de" ? " " : "") + "%"
	document.getElementById("stats-tickets").textContent = json.tickets.toLocaleString()
	document.getElementById("stats-users").textContent = Math.round(json.users / 1000) + "k"

	servers = json.public_guilds
	for (let i = 1; i <= 3; i++) {
		const server = servers[i - 1]
		document.getElementById("server" + i).innerHTML = formatServer(server)
	}
	reloadText()
})

let currentServer = 0
let currentIndex = 2
setInterval(() => {
	currentServer++
	currentIndex++
	if (currentServer > 3) currentServer = 1
	if (currentIndex >= servers.length) currentIndex = 0

	document.getElementById("server" + currentServer).classList.add("no-opacity")
	setTimeout(() => {
		document.getElementById("server" + currentServer).innerHTML = formatServer(servers[currentIndex])
		document.getElementById("server" + currentServer).classList.remove("no-opacity")
		reloadText()
	}, 700)
}, 13000)
