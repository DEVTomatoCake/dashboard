function getFormHTML(guild) {
	return new Promise(resolve => {
		getForm(guild)
			.then(json => {
				if (json.status == "success") {
					let text = "<h1 class='greeting'>Formular ausfüllen</h1><h2>" + encode(json.title) + "</h2>"
					text += json.fields.map(field => {
						if (field.type == "short" || field.type == "password" || field.type == "number" || field.type == "range" || field.type == "color")
							return "<label for='field-" + encode(field.name) + "'>" + encode(field.label) + "</label><br>" +
								"<input id='field-" + encode(field.name) + "' type='" + encode(field.type == "short" ? "text" : field.type) +
								"' placeholder='" + encode(field.placeholder) + "' value='" + encode(field.value) + "'>"
						if (field.type == "long") return "<label for='field-" + encode(field.name) + "'>" + encode(field.label) + "</label><br>" +
							"<textarea id='field-" + encode(field.name) + "' placeholder='" + encode(field.placeholder) + "'>" +
							encode(field.value) + "</textarea>"
						return "<i>Unable to display field type <code>" + encode(field.type) + "</code></i>"
					}).join("<br><br>")
					resolve(text)
				} else handleError(resolve, json.message)
			})
			.catch(e => handleError(resolve, e))
	})
}

loadFunc = () => {
	if (getCookie("token")) {
		const rootContainer = document.getElementById("root-container")
		const params = new URLSearchParams(location.search)

		if (params.has("id")) getFormHTML(params.get("id")).then(html => {
			rootContainer.innerHTML = html
			reloadText()
		})
		else {
			rootContainer.innerHTML = "<h1 class='greeting'>You have to enter a form ID/slug using the ID query parameter!</h1>"
			reloadText()
		}
	} else {
		document.getElementById("root-container").innerHTML = "<h1>Redirecting to login...</h1>"
		location.href = "/login?next=" + encodeURIComponent(location.pathname + location.search)
	}
}
