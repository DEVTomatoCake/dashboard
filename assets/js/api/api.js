const url = "https://api.tomatenkuchen.eu/api/"
async function get(component, auth) {
	const res = await fetch(url + component + (auth && getCookie("token") ? (component.includes("?") ? "&" : "?") + "token=" + getCookie("token") : ""))

	const json = await res.json()
	console.log("Response for \"" + url + component + "\": " + JSON.stringify(json))
	return json
}

function getCommands() {
	return new Promise((resolve, reject) => {
		get("commands/?lang=" + getLanguage(), false)
			.then(data => resolve(data))
			.catch(error => reject(error))
	})
}

function getBotstats() {
	return new Promise((resolve, reject) => {
		get("stats?uptime_ratio=1", false)
			.then(data => resolve(data))
			.catch(error => reject(error))
	})
}

function getGuilds() {
	return new Promise((resolve, reject) => {
		get("guilds", true)
			.then(data => resolve(data))
			.catch(error => reject(error))
	})
}

function getStats(guild) {
	return new Promise((resolve, reject) => {
		get("stats/" + guild, true)
			.then(data => resolve(data))
			.catch(error => reject(error))
	})
}

function login(code) {
	const params = new URLSearchParams(window.location.search)
	return new Promise((resolve, reject) => {
		get("auth/login?code=" + encodeURIComponent(code) + (params.get("state") ? "&dcState=" + params.get("state") : "") + (getCookie("clientState") ? "&state=" + getCookie("clientState") : "") + (location.hostname.startsWith("beta.") ? "&beta=true" : ""), false)
			.then(data => {
				deleteCookie("clientState")
				resolve(data)
			})
			.catch(error => {
				deleteCookie("clientState")
				reject(error)
			})
	})
}

function logout() {
	return new Promise((resolve, reject) => {
		get("auth/logout", true)
			.then(data => resolve(data))
			.catch(error => reject(error))
	})
}

function getLeaderboard(guild) {
	return new Promise((resolve, reject) => {
		get("leaderboard/" + guild, true)
			.then(data => resolve(data))
			.catch(error => reject(error))
	})
}

function getDataexport() {
	return new Promise((resolve, reject) => {
		get("users/dataexport", true)
			.then(data => resolve(data))
			.catch(error => reject(error))
	})
}

function getTickets(guild) {
	return new Promise((resolve, reject) => {
		get("tickets/" + guild, true)
			.then(data => resolve(data))
			.catch(error => reject(error))
	})
}

function getGiveaway(giveaway) {
	return new Promise((resolve, reject) => {
		get("giveaways/" + giveaway, true)
			.then(data => resolve(data))
			.catch(error => reject(error))
	})
}
