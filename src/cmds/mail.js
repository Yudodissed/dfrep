
const main = require('../main')
const db = require('../db')

module.exports = {
    
  callsign: "mail",
  syntax: "/mail <del [index]/[index]>",
  description: 'If no argument is given, lists basic information about inbox. Giving an index reads that letter. Adding "del" will delete that letter at that index.',
  permission: 1, // Registered users only
  cooldown: 100, // 5 second cooldown to prevent halting the bot
  trusted_cooldown: 0,

  run: function (sender, args) {

    let arg = args[1]
    if (args.length === 1) arg = "noArg"

    switch(arg) {

      case "noArg":
        db.readInbox(sender).then(data => {
          let timestamp = main.updateTimestamp()
          console.log(timestamp + 'List of messages requested for ' + sender)
          combinedData = data["important"].concat(data["unread"].concat(data["read"]))
          let importantCount = data["important"].length
          let unreadCount = data["unread"].length
          let readCount = data["read"].length
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
          if (combinedData.length === 0) {main.respond(sender, `[✉] You have no mail. Why not send out some?`)} else {main.respond(sender, `[✉] You have (${combinedData.length}) messages | ${importantMsg} ${unreadMsg} ${readMsg} | Use /mail <index> to view a letter.`)}
        })
      break;

      case "del":
        let index = parseInt(args[2], 10)
        db.readInbox(sender).then(data => {
          combinedData = data["important"].concat(data["unread"].concat(data["read"]))
          let keyCount = Object.keys(combinedData).length
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
      break;

      // Default to assuming they intended an index.
      default:
        if (typeof parseInt(args[1]) === "number" && isNaN(parseInt(args[1])) === false) {
          let index = parseInt(args[1], 10)
          db.readInbox(sender).then(data => {
            combinedData = data["important"].concat(data["unread"].concat(data["read"]))
            let keyCount = combinedData.length
            if (index > keyCount || index <= 0) {
              let timestamp = main.updateTimestamp()
              console.log(timestamp + 'Out of bound index from ' + sender + "|"+index)
              main.respond(sender, '[❌]: There is no message at that index.')
            } else {
              let messageData = combinedData[--index]
              let message = unescape(messageData["message"])
              let origin = messageData["sender"]
              main.respond(sender, `(${++index}) [✉ ${origin}]: ${message}`)
              // If the letter is unread, then delete and replace with one marked as read
              if (data["unread"].includes(messageData) === true) {
                db.burnLetter(sender, index).then(result => {
                  db.writeLetter(sender, origin, escape(message), "read")
                })
              }
              /* Temporarily disabled; this seems to like causing problems :)
              db.readSettings(sender).then(settings => {
                if (settings["autoDel"] === true) {
                  db.burnLetter(sender, index).then(result => {
                    let timestamp = main.updateTimestamp()
                    console.log(timestamp + 'Letter deleted by ' + sender)
                  })
                }
              })
              */
              main.cmdCooldown(sender, "mail")
            }
          })
        } else {
          let timestamp = main.updateTimestamp()
          console.log(timestamp + 'Non-index from ' + sender)
          main.respond(sender, '[❌]: Your index must be a number.')
        }
      break;
      
    }
  }
}