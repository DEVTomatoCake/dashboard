let form = {}
const selectData = {}
const pickerData = {}
let queue = []

function getFormHTML(formId) {
	return new Promise(resolve => {
		getForm(formId)
			.then(json => {
				if (json.status == "success") {
					if (json.fields.length == 0) return resolve("<p>Das Formular mit dem Titel <b>" + encode(json.title) + "</b> existiert, aber hat keine Felder, die du ausfüllen könntest!</p>")
					form = json

					let text = "<h1 class='center'>Formular ausfüllen: " + encode(json.title) + "</h1><br>"
					json.fields.forEach(field => {
						text += "<label for='field-" + encode(field.name) + "'>" + encode(field.label) + "</label>" +
							(field.required ? "<span class='red-text'>*</span>" : "") + "<br>"

						if (field.type == "short" || field.type == "password" || field.type == "number" || field.type == "range" || field.type == "color")
							text += "<input id='field-" + encode(field.name) + "' type='" + (field.type == "short" ? "text" : encode(field.type)) +
								(field.min ? "' min='" + field.min + "' minlength='" + field.min : "") +
								(field.max ? "' max='" + field.max + "' maxlength='" + field.max : "") +
								(field.step ? "' step='" + field.step : "") + (field.pattern ? "' pattern='" + encode(field.pattern) : "") +
								(field.placeholder ? "' placeholder='" + encode(field.placeholder) : "") +
								(field.value ? "' value='" + encode(field.value) : "") + "'>"
						else if (field.type == "long") text += "<textarea id='field-" + encode(field.name) + "' placeholder='" + encode(field.placeholder) + "'>" +
								encode(field.value) + "</textarea>"
						else if (field.type == "checkbox") text += "<input id='field-" + encode(field.name) + "' name='" + encode(field.name) + "' type='radio'>"
						else if (field.type == "select") {
							pickerData[field.name] = field.options
							selectData[field.name] = { value: [] }
							text += "<channel-picker data-form='1' id='field-" + encode(field.name) + "' " +
							(field.min <= 1 && field.max <= 1 ? "" : "data-multi='1' ") + "type='" + encode(field.name) + "'></channel-picker>"
							queue.push(() => {
								document.getElementById("field-" + encode(field.name)).querySelector(".list").innerHTML =
									"<div class='element'><ion-icon name='build-outline'></ion-icon></div>"
							})
						} else text += "<i>Unable to display field type <code>" + encode(field.type) + "</code> (" + encode(field.name) + ")</i>"

						text += "<br><br>"
					})

					text += "<br>" +
						(json.anonymous ? "<p>Antworten auf dieses Formular sind anonym - Servermitglieder sehen nicht, wer du bist.</p>" : "") +
						(json.cooldown ? "<p>Du kannst nur alle <b>" + json.cooldown + "</b> eine Antwort absenden.</p>" : "") +
						"<button class='green' translation='form.submit' onclick='fs()'></button><br><br>" +
						"<p>This form is not verified by or associated with TomatenKuchen. Never submit passwords or other sensitive information. " +
						"<a href='./discord' target='_blank' rel='noopener'>Report abuse</a></p>"
					resolve(text)
				} else handleError(resolve, json.message)
			})
			.catch(e => handleError(resolve, e))
	})
}

const params = new URLSearchParams(location.search)
function fs() {
	const results = {}
	form.fields.forEach(field => {
		const elem = document.getElementById("field-" + encode(field.name))

		if (field.required && (!elem.value || elem.value.trim() == "")) {
			elem.setCustomValidity("This field is required")
			return elem.reportValidity()
		}
		if (field.type != "number" && field.type != "range" && field.min && elem.value.length < field.min) {
			elem.setCustomValidity("This field must be at least " + field.min + " characters long")
			return elem.reportValidity()
		} else if ((field.type == "number" || field.type == "range") && field.min && parseFloat(elem.value) < field.min) {
			elem.setCustomValidity("This value must be at least " + field.min)
			return elem.reportValidity()
		}
		if (field.type != "number" && field.type != "range" && field.max && elem.value.length > field.max) {
			elem.setCustomValidity("This field must be at most " + field.max + " characters long")
			return elem.reportValidity()
		} else if ((field.type == "number" || field.type == "range") && field.max && parseFloat(elem.value) > field.max) {
			elem.setCustomValidity("This value must be at most " + field.max)
			return elem.reportValidity()
		}
		if (field.pattern && !new RegExp(field.pattern).test(elem.value)) {
			elem.setCustomValidity("This field must match the pattern " + field.pattern)
			return elem.reportValidity()
		}

		if (field.type != "select") {
			elem.setCustomValidity("")
			elem.reportValidity()
		}

		if (field.type == "select" && elem.hasAttribute("multiple")) {
			results[encode(field.name)] = []
			for (const child of elem.children) if (child.selected) results[encode(field.name)].push(child.value)
		} else if (field.type == "check") results[encode(field.name)] = elem.checked
		else if (field.type == "number" || field.type == "range") results[encode(field.name)] = parseFloat(elem.value)
		else results[encode(field.name)] = elem.value
	})

	if (Object.keys(results).length == form.fields.length) get("forms/" + params.get("id"), true, "POST", results)
}

loadFunc = () => {
	if (getCookie("token")) {
		const rootContainer = document.getElementById("root-container")

		if (params.has("id")) getFormHTML(params.get("id")).then(html => {
			rootContainer.innerHTML = html
			queue.forEach(f => f())
			queue = []
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
