const langCache = {}

const getLanguage = () => {
	if (getCookie("lang")) return getCookie("lang")

	const userLang = navigator.language || navigator.userLanguage
	return userLang ? (userLang.split("-")[0] == "de" || userLang.split("-")[0] == "fr" || userLang.split("-")[0] == "hu" || userLang.split("-")[0] == "ja" ? userLang.split("-")[0] : "en") : "en"
}

const resolveValue = (obj, keySplit) => {
	if (keySplit.length == 1) return obj[keySplit[0]]
	return resolveValue(obj[keySplit[0]], keySplit.slice(1))
}

const loadLangFile = async language => {
	if (langCache[language]) return langCache[language]

	const res = await fetch("/assets/lang/" + language + ".json")
	const json = await res.json()
	langCache[language] = json
	return json
}

const reloadText = async language => {
	if (!language) language = getLanguage()
	setCookie("lang", language, 60, true)
	document.documentElement.lang = language

	const i18n = document.querySelectorAll("[translation]")
	if (i18n.length <= 0) return

	const scrollTop = document.documentElement.scrollTop || document.body.scrollTop

	const json = await loadLangFile(language)
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
