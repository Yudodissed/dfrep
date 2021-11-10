
const main = require('../main')
const db = require('../db')

module.exports = {
  
  callsign: "info",
  syntax: "/info",
  description: "Provides important information on dfrep.",
  permission: 0, // Anyone can run
  cooldown: 0,
  trusted_cooldown: 0,

  run: function (sender, args) {
    main.respond(sender, "[ℹ]: dfrep ver. 1.1.0 | First time? Check out our github! [github.cοm/Yudodissed/dfrep]")
  }
}