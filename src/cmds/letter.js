
const main = require('../main')
const db = require('../db')

let letterStorage = {}

module.exports = {
  
  callsign: "letter",
  syntax: "/letter <user> <message>",
  description: "Sends a letter to the inbox of a player that can be read later. Afterwards, running /letter confirm is required.",
  permission: 1, // Registered users only
  cooldown: 6000, // 5 minutes
  trusted_cooldown: 1200, // 1 minute

  run: function (sender, args) {
    if (args[1] === "confirm") {
      if (sender in letterStorage) {
        let data = letterStorage[sender]
        delete letterStorage[sender]
        let victim = data[0]
        let message = data[1]
        db.writeLetter(sender, victim, message, "unread").then(result => {
          if (result === true) {
            let timestamp = main.updateTimestamp()
            console.log(timestamp + 'Message sent from ' + sender + ' to ' + victim)
            main.respond(sender, '[✔]: Letter sent to ' + victim + '!')
            main.cmdCooldown(sender, "letter")
          } else {
            let timestamp = main.updateTimestamp()
            console.log(timestamp + 'Message failed for ' + sender + ' to ' + victim + ". Their mailbox is full!")
            main.respond(sender, '[❌]: ' + victim + 's mailbox is full!')
          }
        })
      } else {
        let timestamp = main.updateTimestamp()
        console.log(timestamp + 'No letter to confirm from ' + sender)
        main.respond(sender, '[❌]: No letter to confirm!')
      }
    } else {
      let victim = args[1]
      db.readData(victim).then(data => {
        if (data !== false) {
          let msgList = args.slice(2)
          let message = escape(msgList.join(" "))
          if (message.length <= 100) {
            letterStorage[`${sender}`] = [victim, message]
            let timestamp = main.updateTimestamp()
            console.log(timestamp + 'Letter added to storage by ' + sender + ": " + '"' + message + '"')
            main.respond(sender, '[?]: Are you sure? There is a large cooldown for sending letters. /msg dfrep letter confirm.')
          } else {
            let timestamp = main.updateTimestamp()
            console.log(timestamp + 'Too large a message recieved from ' + sender)
            main.respond(sender, '[❌]: Your letter can at most be 100 characters. Your message is ' + message.length + ' characters long.')
          }
        } else {
          let timestamp = main.updateTimestamp()
          console.log(timestamp + 'Invalid argument recieved from ' + sender)
          main.respond(sender, '[❌]: Invalid user. Is that player registered? Do /msg dfrep help for more.')
        }
      })
    }
  }
}