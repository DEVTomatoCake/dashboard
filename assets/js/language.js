// Modified from https://booky.dev/assets/js/language.js

const getLanguage = () => {
	if (getCookie("lang")) return getCookie("lang");

	const userLang = navigator.language || navigator.userLanguage;
	return userLang ? (userLang.split("-")[0] == "de" ? "de" : "en") : "en";
};

var reloadText = language => {
	const i18n = document.querySelectorAll("[translation]");
	const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

	if (i18n.length <= 0) return;
	retrieveJson("https://raw.githubusercontent.com/DEVTomatoCake/TomatenKuchen-i18n/website/" + language + ".json").then(json => {
		for (let i = 0; i < i18n.length; i++) {
			const element = i18n.item(i);
			const key = element.getAttribute("translation");
			const splitted = key.split(".");

			var text = "";
			if (json[splitted[0]][splitted[1]]) {
			    if (json[splitted[0]][splitted[1]][splitted[2]]) {
			    	if (json[splitted[0]][splitted[1]][splitted[2]][splitted[3]]) text = json[splitted[0]][splitted[1]][splitted[2]][splitted[3]];
			    	else text = json[splitted[0]][splitted[1]][splitted[2]];
			    } else text = json[splitted[0]][splitted[1]];
			} else text = json[splitted[0]];

			if (element.hasAttribute("arguments")) {
				const arguments = JSON.parse(element.getAttribute("arguments"));
				Object.keys(arguments).forEach(replaceKey => text = text.replaceAll(replaceKey, arguments[replaceKey]));
			};

			element.innerHTML = text;
		};

		document.documentElement.scrollTop = document.body.scrollTop = scrollTop;
	}).catch(console.error);
};

const retrieveJson = url => {
	return new Promise((resolve, reject) => {
		try {
		  	const request = new XMLHttpRequest();
		  	request.overrideMimeType("application/json");

		  	request.open("GET", url, true);
		  	request.onreadystatechange = () => {
				if (request.readyState == 4) {
			  		if (request.status == 200) resolve(JSON.parse(request.responseText));
			  		else reject("Status " + request.status + " (" + request.statusText + ")");
				};
			};

			request.send(null);
		} catch (error) {
			reject(error);
		};
	});
};
