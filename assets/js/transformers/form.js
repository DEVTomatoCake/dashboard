function getFormHTML(formId) {
	return new Promise(resolve => {
		getForm(formId)
			.then(json => {
				if (json.status == "success") {
					if (json.fields.length == 0) return resolve("<p>Das Formular mit dem Titel <b>" + encode(json.title) + "</b> existiert, aber hat keine Felder, die du ausfüllen könntest!</p>")

					let text = "<h1 class='center'>Formular ausfüllen: " + encode(json.title) + "</h1><br>"
					text += json.fields.map(field => {
						if (field.type == "short" || field.type == "password" || field.type == "number" || field.type == "range" || field.type == "color")
							return "<label for='field-" + encode(field.name) + "'>" + encode(field.label) + "</label><br>" +
								"<input id='field-" + encode(field.name) + "' type='" + (field.type == "short" ? "text" : encode(field.type)) +
								(field.min ? "' min='" + field.min + "' minlength='" + field.min + "'": "") +
								(field.max ? "' max='" + field.max + "' maxlength='" + field.max + "'": "") +
								(field.step ? "' step='" + field.step + "'": "") + (field.pattern ? "' pattern='" + encode(field.pattern) : "") +
								(field.placeholder ? "' placeholder='" + encode(field.placeholder) : "") + (field.value ? "' value='" + encode(field.value) : "") + "'>"
						if (field.type == "long")
							return "<label for='field-" + encode(field.name) + "'>" + encode(field.label) + "</label><br>" +
								"<textarea id='field-" + encode(field.name) + "' placeholder='" + encode(field.placeholder) + "'>" +
								encode(field.value) + "</textarea>"
						if (field.type == "checkbox")
							return "<label for='field-" + encode(field.name) + "'>" + encode(field.label) + "</label><br>" +
								"<input id='field-" + encode(field.name) + "' type='radio'>"
						if (field.type == "select")
							return "<label for='field-" + encode(field.name) + "'>" + encode(field.label) + "</label><br>" +
								"<select id='field-" + encode(field.name) + "' " + (field.min <= 1 && field.max <= 1 ? "" : "multiple") + ">" +
								"</select>"
						return "<i>Unable to display field type <code>" + encode(field.type) + "</code> (" + encode(field.name) + ")</i>"
					}).join("<br><br>")

					text += "<br><br>" +
						(json.anonymous ? "<p>Antworten auf dieses Formular sind anonym - Servermitglieder sehen nicht, wer du bist.</p>" : "") +
						(json.cooldown ? "<p>Du kannst nur alle <b>" + json.cooldown + "</b> eine Antwort absenden.</p>" : "") +
						"<button class='green' translation='form.submit'></button><br><br>" +
						"<p>This form is not verified by or associated with TomatenKuchen. Never submit passwords or other sensitive information. " +
						"<a href='./discord' target='_blank' rel='noopener'>Report abuse</a></p>"
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
			rootContainer.innerHTML = "<h1 class='greeting' translation='form.missing'></h1>"
			reloadText()
		}
	} else {
		document.getElementById("root-container").innerHTML = "<h1>Redirecting to login...</h1>"
		location.href = "/login?next=" + encodeURIComponent(location.pathname + location.search)
	}
}
