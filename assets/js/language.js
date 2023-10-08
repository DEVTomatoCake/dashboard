// Modified from https://booky.dev/assets/js/language.js
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

	const resgh = await fetch("https://raw.githubusercontent.com/DEVTomatoCake/TomatenKuchen-i18n/website/" + language + ".json").catch(() => {})
	if (resgh?.ok) {
		const json = await resgh.json()
		langCache[language] = json
		return json
	}
	console.warn("Couldn't load lang file from GitHub")

	const resbackup = await fetch("https://api.tomatenkuchen.com/dashboard/" + language + ".json").catch(() => {})
	if (resbackup?.ok) return await resbackup.json()

	console.error("Couldn't load lang file from backup url")
	alert("The lang file couldn't be loaded, the site might not work probably. Try again later!")
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
