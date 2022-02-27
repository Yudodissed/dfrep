
const main = require('../main')
const mail = require('../db/mail')
const userdata = require('../db/userdata')

let letterStorage = {}

module.exports = {
  
  callsign: "letter",
  syntax: "/letter <user> <message>",
  description: "Sends a letter to the inbox of a player that can be read later. Afterwards, running /letter confirm is required.",
  permission: 1, // Registered users only
  cooldown: 6000, // 5 minutes
  trusted_cooldown: 1200, // 1 minute

  run: function (sender, args) {
  
    // Confirm a message
    if (args[1] === "confirm") {
      if (sender in letterStorage) {

        // Fetch the data of their message from letterStorage
        let data = letterStorage[sender]
        delete letterStorage[sender]
        let victim = data[0]
        let message = data[1]

        // Send the letter
        mail.writeLetter(sender, victim, message, "unread").then(result => {
          if (result === true) {
            let timestamp = main.updateTimestamp()
            console.log(timestamp + 'Message sent from ' + sender + ' to ' + victim)
            main.respond(sender, '[✔]: Letter sent to ' + victim + '!')
            main.cmdCooldown(sender, "letter")
          
          // If the function returns false, their mailbox is full
          } else {
            let timestamp = main.updateTimestamp()
            console.log(timestamp + 'Message failed for ' + sender + ' to ' + victim + ". Their mailbox is full!")
            main.respond(sender, '[❌]: ' + victim + 's mailbox is full!')
          }
        })
      
      // If theres no letter to confirm
      } else {
        let timestamp = main.updateTimestamp()
        console.log(timestamp + 'No letter to confirm from ' + sender)
        main.respond(sender, '[❌]: No letter to confirm!')
      }

    // If the argument isn't "confirm", assume it's a player
    } else {

      // Read user data, simultaneously checking if they exist
      let victim = args[1]
      userdata.read(victim).then(data => {
        if (data !== false) {

          // Get the message and add it to letterStorage to be confirmed later
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

        // If user isn't real
        } else {
          let timestamp = main.updateTimestamp()
          console.log(timestamp + 'Invalid argument recieved from ' + sender)
          main.respond(sender, '[❌]: Invalid user. Is that player registered? Do /msg dfrep help for more.')
        }
      })
    }
  }
}