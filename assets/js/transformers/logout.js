document.addEventListener("DOMContentLoaded", () => {
	get("auth/logout").then(json => {
		if (getCookie("token")) deleteCookie("token")
		if (getCookie("user")) deleteCookie("user")
		if (getCookie("avatar")) deleteCookie("avatar")

		if (json.status == "success") location.href = location.protocol + "//" + location.host + "/"
		else {
			document.body.innerHTML =
				"<div class='center'>" +
				"<h1>An error occured while handling your request:</h1>" +
				"<h2>" + encode(json.message) + "</h2>" +
				"<h3>You still were logged out in the browser.</h3>" +
				"</div>"

			setTimeout(() => {
				location.href = location.protocol + "//" + location.host + "/"
			}, 3500)
		}
	})
})
