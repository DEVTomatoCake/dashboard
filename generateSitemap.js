const fsPromises = require("node:fs").promises

const priorities = {
	index: 1,
	commands: 1,
	dashboard: 1,
	"dashboard/settings": 0.9,
	invite: 0.9,
	user: 0.8,
	custom: 0.8,
	login: 0.7,
	"dashboard/integrations": 0.7,
	"dashboard/tickets": 0.7,
	"dashboard/reactionroles": 0.7,
	"dashboard/modlogs": 0.7,
	"dashboard/custom": 0.7,
	"dashboard/dataexport": 0.6,
	"dashboard/logs": 0.6,
	credits: 0.6,
	privacy: 0.5,
	leaderboard: 0.4,
	logout: 0.4,
	"dashboard/images": 0.4,
	legal: 0.2,
	stats: 0.2,
	giveaway: 0.1,
	form: 0.1,
	verify: 0.1,
	ticket: 0.1
}

const generateSitemap = async () => {
	const files = await fsPromises.readdir("./")
	for await (const dir of files) {
		if (dir != "dashboard") continue
		const filesDir = await fsPromises.readdir(dir)
		files.push(...filesDir.map(f => dir + "/" + f))
	}

	let content =
		"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
		"<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" " +
		"xsi:schemaLocation=\"http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd\"" +
		">\n"
	for await (const file of files.filter(f => f.endsWith(".html"))) {
		if (!priorities[file.replace(".html", "")]) {
			if (file != "404.html" && file != "offline.html") console.log("Sitemap generator: No priority for " + file)
			continue
		}

		content +=
			"\t<url>\n" +
			"\t\t<loc>https://tomatenkuchen.com/" + (file == "index.html" ? "" : file.replace(".html", "")) + "</loc>\n" +
			"\t\t<lastmod>" + new Date((await fsPromises.stat(file)).mtimeMs).toISOString().slice(0, -1) + "+00:00</lastmod>\n" +
			"\t\t<priority>" + priorities[file.replace(".html", "")].toFixed(1) + "</priority>\n" +
			"\t\t<changefreq>monthly</changefreq>\n" +
			"\t</url>\n"
	}

	fsPromises.writeFile("sitemap.xml", content + "</urlset>\n")
}
generateSitemap()
