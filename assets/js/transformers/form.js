function getFormHTML(guild) {
	return new Promise(resolve => {
		getForm(guild)
			.then(json => {
				if (json.status == "success") {
					let text = "<h1 class='greeting'>Formular ausfüllen</h1><h2>" + encode(json.title) + "</h2>"
					text += json.fields.map(field => {
						if (field.type == "short" || field.type == "password") return "<label for='field-" + encode(field.name) + "'>" + encode(field.label) + "</label>" +
							"<input id='field-" + encode(field.name) + "' name='field-" + encode(field.name) + "' type='" + (field.type == "password" ? "password" : "text") +
							"' placeholder='" + encode(field.placeholder) + "' value='" + field.value + "'>"
						if (field.type == "long") return "<label for='field-" + encode(field.name) + "'>" + encode(field.label) + "</label>" +
							"<textarea id='field-" + encode(field.name) + "' name='field-" + encode(field.name) + "' placeholder='" + encode(field.placeholder) + "'>" + field.value + "</textarea>"
					}).join("")
					resolve(text)
				} else handleError(resolve, json.message)
			})
			.catch(e => handleError(resolve, e))
	})
}

loadFunc = () => {
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
}
