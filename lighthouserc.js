module.exports = {
	ci: {
		collect: {
			staticDistDir: "./",
			url: [
				"./index.html#no-cookie-popup",
				"./commands.html#no-cookie-popup",
				"./custom.html#no-cookie-popup",
				"./credits.html#no-cookie-popup",
				"./leaderboard.html?guild=694194461122756649#no-cookie-popup",
				"./stats.html?guild=694194461122756649",
				"./privacy.html#no-cookie-popup"
			]
		},
		upload: {
			target: "lhci",
			serverBaseUrl: "https://lhci.tomatenkuchen.com/"
		}
	}
}
