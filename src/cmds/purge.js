
const main = require('../main')
const db = require('../db')

module.exports = {
  
  callsign: "purge",
  syntax: "/purge [all]",
  description: 'Purges all read messages. Adding "all" will also delete all unread messages. ',
  permission: 1, // Registered users only
  cooldown: 200, // 10 second cooldown to prevent halting the bot
  trusted_cooldown: 0,

  run: function (sender, args) {
    db.readInbox(sender).then(data => {
      console.log(Object.keys(data))
      Object.keys(data).forEach((key, i) => {
        if (args[1] === "all") {
          if (key.split('')[0] === "2") {
            let index = i + 1
            console.log(index)
            db.burnLetter(sender, index)
          }
        }
        if (key.split('')[0] === "3") {
          let index = i + 1
          console.log("i: "+i)
          console.log("index: "+index)
          db.burnLetter(sender, index)
        }
      })
      if (args[1] === "all") {
        let timestamp = main.updateTimestamp()
        console.log(timestamp + 'Read/unread messages purged for ' + sender)
        main.respond(sender, '[✔]: All read + unread messages purged!')
      } else {
        let timestamp = main.updateTimestamp()
        console.log(timestamp + 'Unread messages purged for ' + sender)
        main.respond(sender, '[✔]: All unread messages purged!')
      }
    })
  }
}