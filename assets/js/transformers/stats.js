const createChart = apiresponse => {
	const datasets = []

	if (apiresponse.data.members.length > 0) datasets.push({
		label: getLanguage() == "de" ? "Mitglieder" : "Members",
		backgroundColor: "rgb(255, 99, 132)",
		borderColor: "rgb(255, 99, 132)",
		data: apiresponse.data.members.split(",")
	})
	if (apiresponse.data.messages.length > 0) datasets.push({
		label: getLanguage() == "de" ? "Nachrichten pro Tag" : "Messages per day",
		backgroundColor: "rgb(110, 255, 180)",
		borderColor: "rgb(110, 255, 180)",
		data: apiresponse.data.messages.split(",")
	})
	if (apiresponse.data.boosts.length > 0) datasets.push({
		label: "Boosts",
		backgroundColor: "rgb(244, 127, 255)",
		borderColor: "rgb(244, 127, 255)",
		data: apiresponse.data.boosts.split(",")
	})
	if (apiresponse.data.chatters.length > 0) datasets.push({
		label: getLanguage() == "de" ? "Aktive Chatter" : "Active Chatters",
		backgroundColor: "rgb(2, 129, 247)",
		borderColor: "rgb(2, 129, 247)",
		data: apiresponse.data.chatters.split(",")
	})

	document.getElementById("loading-text").remove()
	new Chart(document.getElementById("stats"), {
		type: "line",
		data: {
			labels: apiresponse.data.labels.split(","),
			datasets
		},
		options: {
			plugins: {
				title: {
					display: true,
					text: (getLanguage() == "de" ? "Statistiken von" : "Statistics of") + " " + apiresponse.name
				}
			}
		}
	})
}

const params = new URLSearchParams(location.search)
document.addEventListener("DOMContentLoaded", async () => {
	if (params.has("guild")) {
		const filters = []
		if (params.has("time")) filters.push("time=" + params.get("time"))
		if (params.has("type")) filters.push("type=" + params.get("type"))

		const json = await get("stats/" + params.get("guild") + (filters.length > 0 ? "?" : "") + filters.join("&"))
		if (json.status == "success") createChart(json)
		else document.body.innerHTML =
			"<div class='center'>" +
			"<h1>An error occured while executing the API request:</h1>" +
			"<h2>" + encode(json.message) + "</h2>" +
			"</div>"
	} else {
		localStorage.setItem("next", location.pathname)
		location.href = "/dashboard"
	}
})
