const langCache = {}

const getLanguage = () => {
	if (getCookie("lang")) return getCookie("lang")

	const userLang = navigator.language || navigator.userLanguage
	if (userLang) {
		const lang = userLang.split("-")[0]
		return lang == "de" || lang == "fr" || lang == "hu" || lang == "ja" ? lang : "en"
	}
	return "en"
}

const resolveValue = (obj, keySplit) => {
	if (keySplit.length == 1) return obj[keySplit[0]]
	return resolveValue(obj[keySplit[0]], keySplit.slice(1))
}

const reloadText = async language => {
	if (!language) language = getLanguage()
	setCookie("lang", language, 60, true)
	document.documentElement.lang = language

	const i18n = document.querySelectorAll("[translation]")
	if (i18n.length == 0) return

	const scrollTop = document.documentElement.scrollTop || document.body.scrollTop

	let json = langCache[language]
	if (!json) {
		json = await (await fetch("/assets/lang/" + language + ".json")).json()
		langCache[language] = json
	}

	for (let i = 0; i < i18n.length; i++) {
		const element = i18n.item(i)
		const key = element.getAttribute("translation")
		if (key == "global.login" && getCookie("user")) {
			element.innerHTML = getCookie("user")
			continue
		}

		let text = resolveValue(json, key.split("."))
		if (element.hasAttribute("arguments")) {
			const args = JSON.parse(element.getAttribute("arguments"))
			Object.keys(args).forEach(replaceKey => text = text.replaceAll(replaceKey, args[replaceKey]))
		}

		if (typeof text == "string") element.innerHTML = text
		else console.warn("Couldn't load lang string " + key + ", got " + typeof text + " instead", text)
	}

	document.documentElement.scrollTop = document.body.scrollTop = scrollTop
}
