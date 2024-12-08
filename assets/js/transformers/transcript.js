const params = new URLSearchParams(location.search)
document.addEventListener("DOMContentLoaded", () => {
	if (!params.has("id")) {
		location.href = "/"
		return
	}
	document.getElementById("transcript").src = "https://tk-api.chaoshosting.eu/transcript/" + params.get("id")
})
