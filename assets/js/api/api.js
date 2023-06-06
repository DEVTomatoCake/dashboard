const url = "https://api.tomatenkuchen.eu/api/"
async function get(component, auth = true, method = "GET", body = null) {
	const res = await fetch(url + component + (auth && getCookie("token") ? (component.includes("?") ? "&" : "?") + "token=" + getCookie("token") : ""), {
		method,
		headers: {
			"Content-Type": "application/json"
		},
		body: body ? JSON.stringify(body) : null
	})

	const json = await res.json()
	console.log("Response for \"" + url + component + "\": " + JSON.stringify(json))
	return json
}

const getCommands = () => new Promise((resolve, reject) => {
	get("commands?lang=" + getLanguage(), false)
		.then(d => resolve(d)).catch(e => reject(e))
})

const getBotstats = () => new Promise((resolve, reject) => {
	get("stats?lang=" + getLanguage(), false)
		.then(d => resolve(d)).catch(e => reject(e))
})

const getGuilds = () => new Promise((resolve, reject) => {
	get("guilds")
		.then(d => resolve(d)).catch(e => reject(e))
})

const getStats = guild => new Promise((resolve, reject) => {
	get("stats/" + guild)
		.then(d => resolve(d)).catch(e => reject(e))
})

const login = code => {
	const params = new URLSearchParams(location.search)
	return new Promise((resolve, reject) => {
		get("auth/login?code=" + encodeURIComponent(code) + (params.get("state") ? "&dcState=" + params.get("state") : "") + (getCookie("clientState") ? "&state=" + getCookie("clientState") : "") + (location.hostname.startsWith("beta.") ? "&beta=true" : ""), false)
			.then(d => {
				deleteCookie("clientState")
				resolve(d)
			})
			.catch(e => {
				deleteCookie("clientState")
				reject(e)
			})
	})
}

const logout = () => new Promise((resolve, reject) => {
	get("auth/logout")
		.then(d => resolve(d)).catch(e => reject(e))
})

const getLeaderboard = guild => new Promise((resolve, reject) => {
	get("leaderboard/" + guild)
		.then(d => resolve(d)).catch(e => reject(e))
})

const getDataexport = () => new Promise((resolve, reject) => {
	get("users/dataexport")
		.then(d => resolve(d)).catch(e => reject(e))
})

const getTickets = guild => new Promise((resolve, reject) => {
	get("tickets/" + guild)
		.then(d => resolve(d)).catch(e => reject(e))
})
const searchTickets = (guild, text) => new Promise((resolve, reject) => {
	get("ticketsearch/" + guild + "?search=" + encodeURIComponent(text))
		.then(d => resolve(d)).catch(e => reject(e))
})

const getGiveaway = msg => new Promise((resolve, reject) => {
	get("giveaways/" + msg)
		.then(d => resolve(d)).catch(e => reject(e))
})

const getLogs = guild => new Promise((resolve, reject) => {
	get("logs/" + guild)
		.then(d => resolve(d)).catch(e => reject(e))
})
const deleteLog = (guild, log) => new Promise((resolve, reject) => {
	get("logs/" + guild + "/" + log, true, "DELETE")
		.then(d => resolve(d)).catch(e => reject(e))
})

const getModlogs = guild => new Promise((resolve, reject) => {
	get("modlogs/" + guild)
		.then(d => resolve(d)).catch(e => reject(e))
})
