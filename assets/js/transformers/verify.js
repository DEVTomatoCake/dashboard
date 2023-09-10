const params = new URLSearchParams(location.search)
const verifyDone = async token => {
	const json = await get("dc-verify?token=" + token)

	if (json.status == "success") {
		document.getElementById("root-container").innerHTML = "<h1>You've been verified successfully and can close this window.</h1>"

		setTimeout(() => {
			location.href = "https://tomatenkuchen.com"
		}, 5000)
	} else document.getElementById("root-container").innerHTML = "<h1>We're unable to verify you: " + encode(json.message) + "</h1>"
}

window.onloadTurnstile = () => {
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
