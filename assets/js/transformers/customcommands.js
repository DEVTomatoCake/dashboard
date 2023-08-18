function getCustomcommandsHTML(json) {
	if (json.status == "success") {
		let text = ""

		json.data.forEach(setting => {
			text +=
				"<label for='" + setting.name + "'><b>" + setting.name + "</b></label>" +
				"<div class='emoji-container'>" +
				"<textarea class='setting' rows='" + Math.round(setting.value.split("\n").length * 1.25) + "' cols='65' id='" + setting.name + "' maxlength='2000' name='" + setting.name + "'>" + setting.value + "</textarea>" +
				"<ion-icon name='at-outline' title='Rolepicker' onclick='mentionPicker(this.parentElement, pickerData.roles)'></ion-icon>" +
				"<ion-icon name='happy-outline' title='Emojipicker' onclick='emojiPicker(this.parentElement, pickerData.emojis, guildName)'></ion-icon>" +
				"</div>" +
				"<br>"
		})

		if (text == "") text = "<p id='no-cc'><b translation='dashboard.cc.nocc'></b></p>"
		return "<h1 class='center'><span translation='dashboard.cc.title'></span> <span class='accent'>" + encode(json.name) + "</span></h1>" +
			"<p translation='dashboard.cc.delete'></p><br><br>" + text
	} else {
		return (
			"<h1>An error occured while handling your request!</h1>" +
			"<h2>" + json.message + "</h2>")
	}
}
