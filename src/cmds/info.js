
const main = require('../main')
const userdata = require('../db/userdata')

module.exports = {
  
  callsign: "info",
  syntax: "/info",
  description: "Provides important information on dfrep.",
  permission: 0, // Anyone can run
  cooldown: 0,
  trusted_cooldown: 0,

  run: function (sender, args) {
    userdata.fetchUsers().then(users => {
      main.respond(sender, `[ℹ]: dfrep ver. 1.1.4 | ${users.length} users | First time? Check out our github! [github.cοm/Yudodissed/dfrep]`)  
    })
  }
}