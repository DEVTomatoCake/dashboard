let tiers = []
const calcCredits = () => {
	const elem = document.getElementById("calc-credits")
	const value = Math.abs(parseInt(elem.value || elem.getAttribute("placeholder")))
	if (value < 2 || value > 5000000) return

	let cost = 0
	for (const tier of tiers) {
		if (value >= tier.min) cost = tier.cost + value * tier.percent
	}

	document.getElementById("calc-result").innerHTML = "<b>" + cost.toLocaleString() + "</b> credits per day - that's just voting <b>" +
		Math.ceil(cost / 28).toLocaleString() + "</b> times every 24 hours <small>(and less if members vote more often)</small>!"
}

loadFunc = async () => {
	const json = await getCustomTiers()
	if (json.status == "success") {
		tiers = json.tiers
		calcCredits()

		document.getElementById("tiers-cost").innerHTML = tiers.map((tier, i) =>
			"<tr><td>" + tier.min.toLocaleString() + (tiers[i + 1] ? " - " + (tiers[i + 1].min - 1).toLocaleString() : "+") +
			"</td><td>" + tier.cost.toLocaleString() + "</td><td>" + (tier.percent * 100).toLocaleString() + "% × user count</td></tr>"
		).join("")

		document.getElementById("tiers-upgrade").innerHTML = json.upgrades.map(tier =>
			"<tr><td>" + tier.cost.toLocaleString() + "</td><td>" + encode(tier.text) + "</td></tr>"
		).join("")
	} else {
		document.getElementById("tiers-cost").innerHTML = "<tr><td colspan='3'>Failed to load tiers</td></tr>"
		document.getElementById("tiers-upgrade").innerHTML = "<tr><td colspan='2'>Failed to load tiers</td></tr>"
	}
}
