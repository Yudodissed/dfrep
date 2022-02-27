
const main = require('../main')
const userdata = require('../db/userdata')

module.exports = {
  
  callsign: "register",
  syntax: "/register",
  description: "Registers you in the database. Is required for most commands.",
  permission: 0, // Anyone can run
  cooldown: 0,
  trusted_cooldown: 0,

  run: function (sender, args) {
    userdata.read(sender).then(data => {
      if (data === false) {
        userdata.register(sender).then(output => {
          if (output === true) {
            let timestamp = main.updateTimestamp()
            console.log(timestamp+`${sender} has registered!`)
            main.respond(sender, "[✔]: You've been registered! Welcome to dfrep! Try out /msg dfrep help for more.")
            main.cmdCooldown(sender, "register")
          }
        })
      } else {
        let timestamp = main.updateTimestamp()
        console.log(timestamp + 'Invalid argument recieved from ' + sender)
        main.respond(sender, '[❌]: You already seem to be registered.')
      }
    })
  }
}