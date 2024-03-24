const params = new URLSearchParams(location.search)
const loadTranscript = () => {
	if (!params.has("id")) return location.href = "/"
	document.getElementById("transcript").src = "https://api.tomatenkuchen.com/transcript/" + params.get("id")
}
