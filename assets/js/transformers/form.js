let form = {}
let currentPage = 1
let maxPage = 1
const selectData = {}
const pickerData = {}
let queue = []
const handleChange = () => {}

function getFormHTML(formId) {
	return new Promise(resolve => {
		get("forms/" + formId + "?lang=" + getLanguage())
			.then(json => {
				if (json.status == "success") {
					if (json.fields.length == 0) return resolve("<p>Das Formular mit dem Titel <b>" + encode(json.title) + "</b> existiert, aber hat keine Felder, die du ausfüllen könntest!</p>")
					form = json
					maxPage = Math.max(...json.fields.map(field => field.page || 1))

					let text = "<h1 class='center'>Formular ausfüllen: " + encode(json.title) + "</h1><br>"
					json.fields.forEach(field => {
						text += "<div id='field-" + encode(field.name) + "-container'" + (field.page && field.page > 1 ? " hidden" : "") + ">" +
							"<label for='field-" + encode(field.name) + "'>" + encode(field.label) + "</label>" +
							(field.required ? "<span class='red-text'>*</span>" : "") + "<br>"

						if (field.type == "short" || field.type == "password" || field.type == "number" || field.type == "range" || field.type == "color")
							text += "<input id='field-" + encode(field.name) + "' type='" + (field.type == "short" ? "text" : encode(field.type)) +
								(field.min ? "' min='" + assertInt(field.min) + "' minlength='" + assertInt(field.min) : "") +
								(field.max ? "' max='" + assertInt(field.max) + "' maxlength='" + assertInt(field.max) : "") +
								(field.step ? "' step='" + assertInt(field.step) : "") + (field.pattern ? "' pattern='" + encode(field.pattern) : "") +
								(field.placeholder ? "' placeholder='" + encode(field.placeholder) : "") +
								(field.value ? "' value='" + encode(field.value) : "") + "'>"
						else if (field.type == "date" || field.type == "time")
							text += "<input id='field-" + encode(field.name) + "' type='" + encode(field.type) +
								(field.min ? "' min='" + assertInt(field.min) : "") +
								(field.max ? "' max='" + assertInt(field.max) : "") +
								(field.value ? "' value='" + encode(field.value) : "") + "'>"
						else if (field.type == "long")
							text += "<textarea id='field-" + encode(field.name) + "' placeholder='" + encode(field.placeholder) + "'>" +
								encode(field.value) + "</textarea>"
						else if (field.type == "checkbox") {
							text += field.options.map(option => {
								const id = Math.random().toString(36).substring(5)
								return "<input id='field-" + encode(field.name) + "-" + id + "' name='" + encode(field.name) + "' " +
									"type='radio' data-value='" + encode(option) + "'>" +
									"<label for='field-" + encode(field.name) + "-" + id + "'>" + encode(option) + "</label>"
							}).join("<br>")
						} else if (field.type == "select") {
							const optionObj = {}
							field.options.forEach(option => optionObj[option] = option)
							pickerData[encode(field.name)] = optionObj
							selectData["field-" + encode(field.name)] = {value: []}

							text += "<channel-picker data-form='1' id='field-" + encode(field.name) + "' " +
								(field.min <= 1 && field.max <= 1 ? "" : "data-multi='1' ") + "type='" + encode(field.name) + "'></channel-picker>"
							queue.push(() => {
								document.getElementById("field-" + encode(field.name)).querySelector(".list").innerHTML =
									"<div class='element'><ion-icon name='build-outline'></ion-icon></div>"
								togglePicker(document.getElementById("field-" + encode(field.name)).querySelector(".list"))
							})
						} else text += "<i>Unable to display field type <code>" + encode(field.type) + "</code> (" + encode(field.name) + ") - please report this!</i>"

						text += "<br><br></div>"
					})

					const hasMultiple = json.fields.some(field => field.page && field.page > 1)
					text += "<br>" +
						(json.anonymous == "always" ? "<p translation='form.anonymous'></p>" : "") +
						(json.anonymous == "optional" ? "<p id='submit-anonymous'" + (hasMultiple ? " hidden" : "") + "><label title='If checked, no one on the server is able to see "+
							"who submitted this form.'>You can decide whether you want to remain anonymous to the server team: <input type='checkbox' id='form-anonymous' checked></label></p>" : "") +
						(json.cooldown ? "<p id='submit-cooldown'" + (hasMultiple ? " hidden" : "") + ">You can only submit something every <b>" + encode(json.cooldown) + "</b>.</p>" : "") +
						(hasMultiple ?
							"<button onclick='pageBack()' id='back-button' hidden>Back</button>" +
							"<button class='green' onclick='pageNext()' id='next-button'>Next</button>" : ""
						) +
						"<button class='green' translation='form.submit' onclick='fs()' id='submit-button'" + (hasMultiple ? " hidden" : "") + "></button>" +
						(maxPage > 1 ? "<br><small>Page <span id='current-page'>1</span> out of " + maxPage + " pages</small>" : "") +
						"<br><br>" +
						"<p translation='form.unverified'></p>"
					resolve(text)
				} else handleError(resolve, json.message)
			})
			.catch(e => handleError(resolve, e))
	})
}

const pageBack = () => {
	currentPage--
	document.getElementById("current-page").innerText = currentPage
	document.getElementById("next-button").removeAttribute("hidden")
	if (currentPage == 1) document.getElementById("back-button").setAttribute("hidden", "")
	if (currentPage != maxPage) {
		document.getElementById("submit-button").setAttribute("hidden", "")
		document.getElementById("submit-anonymous").setAttribute("hidden", "")
		document.getElementById("submit-cooldown").setAttribute("hidden", "")
	}

	form.fields.forEach(field => {
		if (field.page == currentPage || (!field.page && currentPage <= 1)) document.getElementById("field-" + encode(field.name) + "-container").removeAttribute("hidden")
		else document.getElementById("field-" + encode(field.name) + "-container").setAttribute("hidden", "")
	})
}
const pageNext = () => {
	currentPage++
	document.getElementById("current-page").innerText = currentPage
	document.getElementById("back-button").removeAttribute("hidden")
	if (currentPage == maxPage) {
		document.getElementById("next-button").setAttribute("hidden", "")
		document.getElementById("submit-button").removeAttribute("hidden")
		document.getElementById("submit-anonymous").removeAttribute("hidden")
		document.getElementById("submit-cooldown").removeAttribute("hidden")
	}

	form.fields.forEach(field => {
		if (field.page == currentPage || (!field.page && currentPage <= 1)) document.getElementById("field-" + encode(field.name) + "-container").removeAttribute("hidden")
		else document.getElementById("field-" + encode(field.name) + "-container").setAttribute("hidden", "")
	})
}

const params = new URLSearchParams(location.search)
const fs = async () => {
	const results = {}
	form.fields.forEach(field => {
		if (field.type == "checkbox") {
			const elem = document.querySelector("input[name='" + encode(field.name) + "']:checked")
			if (field.required && !elem) {
				const checkElem = document.querySelector("input[name='" + encode(field.name) + "']")
				checkElem.setCustomValidity("One checkbox is required to be checked")
				return checkElem.reportValidity()
			}
			results[encode(field.name)] = elem.getAttribute("data-value")
		} else {
			const elem = document.getElementById("field-" + encode(field.name))

			if (field.required && field.type != "select" && (!elem.value || elem.value.trim() == "")) {
				elem.scrollIntoView({behavior: "smooth", block: "center", inline: "center"})
				elem.setCustomValidity("This field is required")
				return elem.reportValidity()
			}
			if (field.type != "number" && field.type != "range" && field.type != "select" && field.min && elem.value.length < field.min) {
				elem.scrollIntoView({behavior: "smooth", block: "center", inline: "center"})
				elem.setCustomValidity("This field must be at least " + field.min + " characters long")
				return elem.reportValidity()
			} else if ((field.type == "number" || field.type == "range") && field.min && parseFloat(elem.value) < field.min) {
				elem.scrollIntoView({behavior: "smooth", block: "center", inline: "center"})
				elem.setCustomValidity("This value must be at least " + field.min)
				return elem.reportValidity()
			} else if (field.type == "select" && field.min && selectData["field-" + encode(field.name)].value.length < field.min) {
				elem.scrollIntoView({behavior: "smooth", block: "center", inline: "center"})
				return elem.title = "This value must be at least " + field.min
			}
			if (field.type != "number" && field.type != "range" && field.type != "select" && field.max && elem.value.length > field.max) {
				elem.scrollIntoView({behavior: "smooth", block: "center", inline: "center"})
				elem.setCustomValidity("This field must be at most " + field.max + " characters long")
				return elem.reportValidity()
			} else if ((field.type == "number" || field.type == "range") && field.max && parseFloat(elem.value) > field.max) {
				elem.scrollIntoView({behavior: "smooth", block: "center", inline: "center"})
				elem.setCustomValidity("This value must be at most " + field.max)
				return elem.reportValidity()
			} else if (field.type == "select" && field.max && selectData["field-" + encode(field.name)].value.length > field.max) {
				elem.scrollIntoView({behavior: "smooth", block: "center", inline: "center"})
				return elem.title = "This value must be at most " + field.max
			}
			if (field.pattern && !new RegExp(field.pattern).test(elem.value)) {
				elem.scrollIntoView({behavior: "smooth", block: "center", inline: "center"})
				elem.setCustomValidity("This field must match the pattern " + field.pattern)
				return elem.reportValidity()
			}

			if (field.type != "select") {
				elem.setCustomValidity("")
				elem.reportValidity()
			}

			if (field.type == "select") results[encode(field.name)] = selectData["field-" + encode(field.name)].value
			else if (field.type == "number" || field.type == "range") results[encode(field.name)] = parseFloat(elem.value)
			else results[encode(field.name)] = elem.value
		}
	})

	if (Object.keys(results).length == form.fields.length) {
		const json = await get("forms/" + params.get("id"), true, "POST", {
			fields: results,
			wantAnonymous: document.getElementById("form-anonymous") && document.getElementById("form-anonymous").checked
		})
		if (json.status == "success")
			document.getElementById("root-container").innerHTML = "<h1>Form submitted successfully!</h1>" + (form.submitMessage ? "<br><p>" + encode(form.submitMessage) + "</p>" : "")
		else {
			const error = document.createElement("h1")
			error.innerText = "Your form couldn't be submitted: " + encode(json.message)
			document.getElementById("root-container").insertBefore(error, document.getElementById("submit-button"))

			document.getElementById("submit-button").setAttribute("disabled", "")
			setTimeout(() => {
				document.getElementById("submit-button").removeAttribute("disabled")
			}, 10000)
		}
	}
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
		location.href = "/login?next=" + encodeURIComponent(location.pathname + location.search + location.hash)
	}
}
