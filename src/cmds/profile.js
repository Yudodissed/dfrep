
const main = require('../main')
const db = require('../db')

//------------------------ /profile ------------------------//
//Quickly gives an overview of a players data.

module.exports = {
  
  callsign: "profile",
  syntax: "/profile [user]",
  description: "Provides reputation scores, amount of ratings, and the featured badge of a player. Giving no user will show your own profile.",
  permission: 1, // Registered users only
  cooldown: 0,
  trusted_cooldown: 0,

  run: function (sender, args) {
    let victim = args[1]
    if (victim === undefined) victim = sender
    db.readData(victim).then(data => {
      if (data !== false) {false
        let displayBadge = data.badges.displayBadge
        if (displayBadge = "false") {
          displayBadge = 'No Badge'
        }
        main.respond(sender, `[✎]: ${victim} | ${data.reputation.ratings.karma} Karma (${data.reputation.ratings.buildRating} build, ${data.reputation.ratings.devRating} dev, ${data.reputation.ratings.friendlyRating} generic) | ${Object.keys(data.statistics.ratedBy).length} Voters | ${displayBadge}`)
        main.cmdCooldown(sender, "profile")
      } else {
        let timestamp = main.updateTimestamp()
        console.log(timestamp + 'Invalid argument recieved from ' + sender)
        main.respond(sender, '[❌]: Invalid user. Is that player registered? Do /msg dfrep help for more.')
      }
    })
  }
}