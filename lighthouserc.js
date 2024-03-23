module.exports = {
	ci: {
		collect: {
			staticDistDir: "./",
			url: [
				"./index.html#no-cookie-popup",
				"./commands.html#no-cookie-popup",
				"./custom.html#no-cookie-popup",
				"./leaderboard.html?guild=694194461122756649#no-cookie-popup",
				"./privacy.html#no-cookie-popup"
			]
		},
		upload: {
			/*target: "lhci",
			serverBaseUrl: "https://lhci.tomatenkuchen.com/"*/
			target: "temporary-public-storage"
		}
	}
}
