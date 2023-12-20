module.exports = {
	ci: {
		assert: {
			preset: "lighthouse:recommended"
		},
		collect: {
			staticDistDir: "./",
			url: [
				"./index.html#no-cookie-popup",
				"./commands.html#no-cookie-popup",
				"./custom.html#no-cookie-popup",
				"./credits.html#no-cookie-popup",
				"./leaderboard.html?guild=694194461122756649#no-cookie-popup",
				"./stats.html?guild=694194461122756649",
				"./privacy.html#no-cookie-popup",
				"./form.html?id=tksupport#no-cookie-popup"
			]
		},
		upload: {
			// Longterm: https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/getting-started.md#the-lighthouse-ci-server
			target: "temporary-public-storage"
		}
	}
}
