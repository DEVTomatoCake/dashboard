const calcCredits = () => {
	const elem = document.getElementById("calc-credits")
	const userCount = Math.abs(parseInt(elem.value || elem.getAttribute("placeholder")))
	if (userCount < 2 || userCount > 5000000) return

	const cost = (Math.pow(33 * (userCount + 110), 0.6) - 115).toFixed(1)
	document.getElementById("calc-result").innerHTML = "<b>" + parseFloat(cost).toLocaleString() + "</b> credits per day - that's just voting <b>" +
		Math.ceil(cost / 28).toLocaleString() + "</b> times every 24 hours <small>(and less if members vote more often)</small>!"
}

loadFunc = async () => {
	calcCredits()

	const json = await getCustomTiers()
	if (json.status == "success") {
		document.getElementById("tiers-upgrade").innerHTML = json.upgrades.map(tier =>
			"<tr><td>" + tier.cost.toLocaleString() + "</td><td>" + encode(tier.text) + "</td></tr>"
		).join("")
	} else document.getElementById("tiers-upgrade").innerHTML = "<tr><td colspan='2'>Failed to load upgrades</td></tr>"
}
