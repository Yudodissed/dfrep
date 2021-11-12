
const main = require('../main')
const db = require('../db')

module.exports = {
  
  callsign: "mail",
  syntax: "/mail [del] [index]",
  description: "If no argument is given, lists basic information about inbox. If index argument is given, reads the message at index. If delete argument is given, deleted the message.",
  permission: 1, // Registered users only
  cooldown: 300, // 15 seconds cooldown to prevent halting the bot
  trusted_cooldown: 0,

  run: function (sender, args) {
    if (args.length === 1) {
        db.readInbox(sender).then(data => {
            let timestamp = main.updateTimestamp()
            console.log(timestamp + 'List of messages requested for ' + sender)
            let tidy = "messages"
            if (Object.keys(data).length === 2) {tidy = "message"}
            main.respond(sender, `[✉] You have (${--Object.keys(data).length}) ${tidy}.`)
        })
    } else {
        if (args[1] === "del") {
            let index = parseInt(args[2], 10)
            console.log(index)
            db.readInbox(sender).then(data => {
                let keyCount = --Object.keys(data).length
                if (index > keyCount) {
                    let timestamp = main.updateTimestamp()
                    console.log(timestamp + 'Out of bound index from ' + sender)
                    main.respond(sender, '[❌]: There is no message at that index.')
                } else {
                    db.burnLetter(sender, index).then(result => {
                        if (result === true) {
                            let timestamp = main.updateTimestamp()
                            console.log(timestamp + 'Letter deleted by ' + sender)
                            main.respond(sender, '[✔]: Letter deleted!')
                        } else {
                            let timestamp = main.updateTimestamp()
                            console.log(timestamp + 'Out of bound index from ' + sender)
                            main.respond(sender, '[❌]: There is no message at that index.')
                        }
                    })
                }
            })
        } else {
          let index = parseInt(args[1], 10)
          db.readInbox(sender).then(data => {
              let keyCount = --Object.keys(data).length
              if (index > keyCount || index <= 0) {
                  let timestamp = main.updateTimestamp()
                  console.log(timestamp + 'Out of bound index from ' + sender + "|"+index)
                  main.respond(sender, '[❌]: There is no message at that index.')
              } else {
                  let indexID = Object.keys(data)[--index]
                  let message = data[indexID]["message"]
                  let origin = data[indexID]["sender"]
                  main.respond(sender, `(${++index}) [✉ ${origin}]: ${message}`)
                  main.cmdCooldown(sender, "mail")
              }
          })
        }
    }
  }
}