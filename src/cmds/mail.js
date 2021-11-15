
const main = require('../main')
const db = require('../db')

module.exports = {
    
  callsign: "mail",
  syntax: "/mail <del/clear/[index]>",
  description: "If no argument is given, lists basic information about inbox. If index argument is given, reads the message at index. If delete argument is given, deleted the message.",
  permission: 1, // Registered users only
  cooldown: 200, // 10 seconds cooldown to prevent halting the bot
  trusted_cooldown: 0,

  run: function (sender, args) {
    if (args.length === 1) {
      db.readInbox(sender).then(data => {
        let timestamp = main.updateTimestamp()
        console.log(timestamp + 'List of messages requested for ' + sender)
        let importantCount = 0, unreadCount = 0, readCount = 0
        Object.keys(data).forEach(function(key) {
          if (key.split('')[0] === "1") ++importantCount
          if (key.split('')[0] === "2") ++unreadCount
          if (key.split('')[0] === "3") ++readCount
        })
        if (importantCount > 0) {
          if (importantCount > 1) {
            importantMsg = ` [1-${importantCount}]: Important `
          } else {
            importantMsg = ` [${importantCount}]: Important `
          }
        } else importantMsg = ''
        if (unreadCount > 0) {
          if (unreadCount > 1) {
            unreadMsg = ` [${importantCount + 1}-${unreadCount + importantCount}]: Unread `
          } else {
            unreadMsg = ` [${unreadCount + importantCount}]: Unread `
          }
        } else unreadMsg = ''
        if (readCount > 0) {
          if (readCount > 1) {
            readMsg = ` [${unreadCount + importantCount + 1}-${readCount + unreadCount + importantCount}]: Read `
          } else {
            readMsg = ` [${readCount + unreadCount + importantCount}]: Read `
          }
        } else readMsg = ''
        if (Object.keys(data).length === 1) {main.respond(sender, `[✉] You have no mail. Why not send out some?`)} else {main.respond(sender, `[✉] You have (${--Object.keys(data).length}) messages | ${importantMsg} ${unreadMsg} ${readMsg} | Use /mail <index> to view a letter.`)}
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
        if (typeof parseInt(args[1]) === "number" && isNaN(parseInt(args[1])) === false) {
          let index = parseInt(args[1], 10)
          db.readInbox(sender).then(data => {
            let keyCount = --Object.keys(data).length
            if (index > keyCount || index <= 0) {
              let timestamp = main.updateTimestamp()
              console.log(timestamp + 'Out of bound index from ' + sender + "|"+index)
              main.respond(sender, '[❌]: There is no message at that index.')
            } else {
              let key = Object.keys(data)[--index]
              let message = unescape(data[key]["message"])
              let origin = data[key]["sender"]
              main.respond(sender, `(${++index}) [✉ ${origin}]: ${message}`)
              // If the letter is unread, then delete and replace with one marked as read
              if (key.split('')[0] === "2") {
                db.burnLetter(sender, index).then(result => {
                  db.writeLetter(sender, origin, escape(message), 3)
                })
              }
              // Autodel
              db.readSettings(sender).then(settings => {
                if (settings["autoDel"] === true) {
                  db.burnLetter(sender, index).then(result => {
                    let timestamp = main.updateTimestamp()
                    console.log(timestamp + 'Letter deleted by ' + sender)
                  })
                }
              })
              main.cmdCooldown(sender, "mail")
            }
          })
        } else {
          let timestamp = main.updateTimestamp()
          console.log(timestamp + 'Non-index from ' + sender)
          main.respond(sender, '[❌]: Your index must be a number.')
        }
      }
    }
  }
}