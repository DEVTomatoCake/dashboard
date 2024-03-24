const params = new URLSearchParams(location.search)
if (params.has("next")) localStorage.setItem("next", params.get("next"))

location.href = "https://discord.com/oauth2/authorize?client_id=685166801394335819&redirect_uri=" + encodeURIComponent(location.protocol + "//" + location.host + "/dashboard") +
	"&prompt=none&response_type=code&scope=identify%20guilds"
