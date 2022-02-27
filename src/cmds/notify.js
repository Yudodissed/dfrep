
const main = require('../main')
const settings = require('../db/settings')

module.exports = {
  
  callsign: "notify",
  syntax: "/notify",
  description: "Toggles notifications for when you have an unread message in your inbox.",
  permission: 1, // Registered only.
  cooldown: 600, // 30 second cooldown
  trusted_cooldown: 0,

  run: function (sender, args) {
    settings.toggle(sender, ["msgNotify"])
    settings.read(sender).then(data => {
      let timestamp = main.updateTimestamp()
      console.log(timestamp + 'Inbox notifications toggled for ' + sender)
      main.respond(sender, `[✔]: Inbox notification toggled: ${data["msgNotify"]} -> ${!data["msgNotify"]}`)
    })
  }
}