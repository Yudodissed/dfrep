
const main = require('../main')
const userdata = require('../db/userdata')

module.exports = {
  
  callsign: "-rep",
  syntax: "/-rep <user> [build/dev]",
  description: "Decreases a players reputation score. No category will affect generic reputation.",
  permission: 1, // Registered users only
  cooldown: 1200, // 1 minute
  trusted_cooldown: 600, // 30 seconds

  run: function (sender, args) {
    let repType
    let victim = args[1]
    if (sender !== victim) {
      if (args.length >= 3) {
        if ((args[2] === 'build') || (args[2] === 'dev')) {
          type = args[2]
          repType = type + 'Rating'
        } else {
          let timestamp = main.updateTimestamp()
          console.log(timestamp + 'Invalid argument recieved from ' + sender)
          main.respond(sender, '[❌]: Invalid type. Do /msg dfrep help for more.')
          return
        }
      } else repType = 'friendlyRating'
      userdata.read(victim).then(data => {
        if (data !== false) {
          let validReq = false
          let undoType = "none"
          let senderRating = data.statistics.ratedBy[sender]
          if (!(sender in data.statistics.ratedBy)) {
            validReq = true
          } else if (senderRating === "+1.devRating" || senderRating === "+1.buildRating" || senderRating === "+1.friendlyRating") {
            undoType = data.statistics.ratedBy[sender].split('.')[1]
            validReq = true
          }
          if (validReq) {
            let newData = {}
            newData[`statistics.ratedBy.${sender}`] = `-1.${repType}`
            newData[`reputation.ratings.${repType}`] = --data['reputation']['ratings'][repType]
            if (undoType !== "none") {
              newData[`reputation.ratings.${undoType}`] = --data['reputation']['ratings'][undoType]
            }
            userdata.write(victim, newData)
            main.respond(sender, '[✔]: /-rep completed. Do /msg dfrep profile ' + victim + ' to check!')
            main.cmdCooldown(sender, "-rep")
          } else {
            let timestamp = main.updateTimestamp()
            console.log(timestamp + sender + ' failed -rep for ' + victim)
            main.respond(sender, "[❌]: You've already given this player a -rep!")
          }
        } else {
          let timestamp = main.updateTimestamp()
          console.log(timestamp + 'Invalid argument recieved from ' + sender)
          main.respond(sender, '[❌]: Invalid user. Is that player registered? Do /msg dfrep help for more.')
        }
      })
    } else {
        let timestamp = main.updateTimestamp()
        console.log(timestamp + sender + 'attempted self -rep.')
        main.respond(sender, "[❌]: You can't /-rep yourself! Do /msg dfrep help for more.")
    }
  }
}