const verifyDone = async token => {
	const json = await get("dc-verify?response=" + token)

	if (json.status == "success") {
		document.getElementById("root-container").innerHTML = "<h1>You were verified successfully and can now return to Discord.</h1>"

		setTimeout(() => {
			location.href = "https://tomatenkuchen.com"
		}, 5000)
	} else document.getElementById("root-container").innerHTML = "<h1>We're unable to verify you: " + encode(json.message) + "</h1>"
}

const params = new URLSearchParams(location.search)
window.onloadTurnstile = () => {
	if (!params.has("verify")) {
		document.getElementById("root-container").innerHTML = "<h1>Invalid verification request.</h1>"
		return
	}

	turnstile.render("#root-container", {
		sitekey: "0x4AAAAAAAJ-TUw5w4IoLPcJ",
		cData: params.get("verify"),
		callback: verifyDone,
		"error-callback": () => {
			document.getElementById("root-container").innerHTML = "<h1>We're unable to verify you. Please try again later.</h1>"
			return false
		},
		"unsupported-callback": verifyDone,
		theme: getCookie("theme") || "auto",
		"response-field": false,
		appearance: "interaction-only"
	})
}
