const formatServer = server => "" +
	"<img src='" + encode(server.icon) + "' alt='Server icon of " + encode(server.name) + "' crossorigin='anonymous'>" +
	"<div>" +
	"<h3>" + encode(server.name.length > 50 ? server.name.substring(0, 50) + "…" : server.name) + "</h3>" +
	"<p class='members'>🟢 <b>" + server.online?.toLocaleString() + "</b> online⠀🔘 <b>" + server.members.toLocaleString() + "</b> <span translation='main.members'></span></p>" +
	"<p class='since'><span translation='main.botsince'></span>:<br><b>" + encode(server.botsince) + "</b></p>" +
	"</div>"

let servers = []
let currentIndex = 1
getBotstats().then(json => {
	document.getElementById("stats-guilds").textContent = json.guilds
	document.getElementById("stats-uptime").textContent = json.uptime_ratio.toFixed(2) + (getLanguage() == "de" ? " " : "") + "%"
	document.getElementById("stats-tickets").textContent = json.tickets.toLocaleString()
	document.getElementById("stats-users").textContent = Math.round(json.users / 1000) + "k"

	servers = json.public_guilds
	currentIndex = Math.floor(Math.random() * (servers.length / 1.3))

	document.getElementById("server1").innerHTML = formatServer(servers[currentIndex++])
	document.getElementById("server2").innerHTML = formatServer(servers[currentIndex])
	reloadText()
})

let currentServer = 0
setInterval(() => {
	currentServer++
	currentIndex++
	if (currentServer > 2) currentServer = 1
	if (currentIndex >= servers.length) currentIndex = 0

	document.getElementById("server" + currentServer).classList.add("no-opacity")
	setTimeout(() => {
		document.getElementById("server" + currentServer).innerHTML = formatServer(servers[currentIndex])
		document.getElementById("server" + currentServer).classList.remove("no-opacity")
		reloadText()
	}, 500)
}, 8300)
