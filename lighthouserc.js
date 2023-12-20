module.exports = {
	ci: {
		assert: {
			preset: "lighthouse:recommended"
		},
		collect: {
			staticDistDir: "./"
		},
		upload: {
			// Longterm: https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/getting-started.md#the-lighthouse-ci-server
			target: "temporary-public-storage"
		}
	}
}
