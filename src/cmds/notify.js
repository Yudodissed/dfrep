
const main = require('../main')
const db = require('../db')

module.exports = {
  
  callsign: "notify",
  syntax: "/notify",
  description: "Toggles notifications for when you have a message in your inbox.",
  permission: 1, // Registered only.
  cooldown: 600, // 30 second cooldown
  trusted_cooldown: 0,

  run: function (sender, args) {
    db.toggleSettings(sender, ["msgNotify"])
    db.readSettings(sender).then(data => {
      let timestamp = main.updateTimestamp()
      console.log(timestamp + 'Inbox notifications toggled for ' + sender)
      main.respond(sender, `[✔]: Inbox notification toggled: ${data["msgNotify"]} -> ${!data["msgNotify"]}`)
    })
  }
}