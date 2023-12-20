module.exports = {
	ci: {
		assert: {
			preset: "lighthouse:recommended"
		},
		collect: {
			/*url: ["http://localhost:4269"],
			startServerCommand: "node dev.js",
			startServerReadyPattern: "^Running on .+",
			startServerReadyTimeout: 15000*/
			staticDistDir: "./",
			url: [
				"./index.html",
				"./commands.html",
				"./privacy.html"
			]
		},
		upload: {
			// Longterm: https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/getting-started.md#the-lighthouse-ci-server
			target: "temporary-public-storage"
		}
	}
}
