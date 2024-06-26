const calcCredits = () => {
	const elem = document.getElementById("calc-credits")
	const userCount = Math.abs(Number.parseInt(elem.value || elem.getAttribute("placeholder")))
	if (userCount < 2 || userCount > 9999999) return

	const cost = (Math.pow(21 * (userCount + 95), 0.6) - 90).toFixed(1)
	document.getElementById("calc-result").innerHTML = "<b>" + Number.parseFloat(cost).toLocaleString() + "</b> credits per day - that's just voting <b>" +
		Math.ceil(cost / 28).toLocaleString() + "</b> times every 24 hours <small>(and less if members vote more often)</small>!"
}

document.addEventListener("DOMContentLoaded", async () => {
	calcCredits()

	const json = await get("custom-tiers", false)
	if (json.status == "success") {
		document.getElementById("tiers-upgrade").innerHTML = json.upgrades.map(tier =>
			"<tr><td>" + tier.cost.toLocaleString() + "</td><td>" + tier.text + "</td></tr>"
		).join("")
	} else document.getElementById("tiers-upgrade").innerHTML = "<tr><td colspan='2'>Failed to load upgrades</td></tr>"
})
