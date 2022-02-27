
const main = require('../main')
const mail = require('../db/mail')

module.exports = {
  
  callsign: "purge",
  syntax: "/purge [all]",
  description: 'Purges all read messages. Adding "all" will also delete all unread messages. ',
  permission: 1, // Registered users only
  cooldown: 200, // 10 second cooldown to prevent halting the bot
  trusted_cooldown: 0,

  run: function (sender, args) {
    mail.readInbox(sender).then(data => {
      if (args[1] === "all") {
        data["unread"] = []
        data["read"] = []
        let stringyData = JSON.stringify(data)
        con.query("UPDATE maindb SET inbox = ? WHERE user = ?", [stringyData, sender], (error, results) => {
          if (error) {
            return console.error(error.message)
          }
        })
        let timestamp = main.updateTimestamp()
        console.log(timestamp + 'Read/unread messages purged for ' + sender)
        main.respond(sender, '[✔]: All read + unread messages purged!')
      } else {
        data["read"] = []
        let stringyData = JSON.stringify(data)
        con.query("UPDATE maindb SET inbox = ? WHERE user = ?", [stringyData, sender], (error, results) => {
          if (error) {
            return console.error(error.message)
          }
        })
        let timestamp = main.updateTimestamp()
        console.log(timestamp + 'Read messages purged for ' + sender)
        main.respond(sender, '[✔]: All read messages purged!')
      }
    })
  }
}