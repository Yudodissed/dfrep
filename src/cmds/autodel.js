
const main = require('../main')
const db = require('../db')

module.exports = {
  
  callsign: "autodel",
  syntax: "/autodel",
  description: "Toggles if letters are automatically deleted after reading.",
  permission: 1, // Registered only.
  cooldown: 600, // 30 second cooldown
  trusted_cooldown: 0,

  run: function (sender, args) {
    db.toggleSettings(sender, ["autoDel"])
    db.readSettings(sender).then(data => {
      let timestamp = main.updateTimestamp()
      console.log(timestamp + 'Auto deletion toggled for ' + sender)
      main.respond(sender, `[✔]: Auto deletion toggled: ${data["autoDel"]} -> ${!data["autoDel"]}`)
    })
  }
}