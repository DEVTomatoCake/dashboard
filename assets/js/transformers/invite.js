const params = new URLSearchParams(location.search)
location.href = "https://discord.com/oauth2/authorize?client_id=" + (params.has("bot") ? encodeURIComponent(params.get("bot")) : "685166801394335819") +
	(params.has("bot") ? "" : "&response_type=code&redirect_uri=" + encodeURIComponent(location.protocol + "//" + location.host + "/dashboard/settings")) +
	"&scope=" + (params.has("bot") ? "" : "identify+guilds+") + "bot&permissions=27893563780342" + (params.has("guild") ? "&guild_id=" + encodeURIComponent(params.get("guild")) : "")
