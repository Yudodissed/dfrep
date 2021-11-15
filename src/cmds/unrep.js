
const main = require('../main')
const db = require('../db')

const objectPath = require('object-path')

module.exports = {
  
  callsign: "unrep",
  syntax: "/unrep <user>",
  description: "Undoes a +rep or -rep you've given a player.",
  permission: 1, // Registered users only
  cooldown: 0,
  trusted_cooldown: 0,

  run: function (sender, args) {
    let victim = args[1]
    db.readData(victim).then(data => {
      let validReq
      if (sender !== victim) {
        if (data !== false) {
          if (sender in data.statistics.ratedBy) {
            if (data.statistics.ratedBy[sender] === "+1.devRating" || 
            data.statistics.ratedBy[sender] === "+1.buildRating" || 
            data.statistics.ratedBy[sender] === "+1.friendlyRating" ||  // I'm sorry
            data.statistics.ratedBy[sender] === "-1.devRating" || 
            data.statistics.ratedBy[sender] === "-1.buildRating" || 
            data.statistics.ratedBy[sender] === "-1.friendlyRating") {
              increment = data.statistics.ratedBy[sender].split('.')[0] * -1
              repType = data.statistics.ratedBy[sender].split('.')[1]
              validReq = true
            }
          } else {
            let timestamp = main.updateTimestamp()
            console.log(timestamp + sender + 'failed unrep for' + victim)
            main.respond(sender, "[❌]: You haven't +/-repped this player!")
          }
          db.readData(victim).then(data => {
            if (validReq) {
              let newData = {}
              newData[`reputation.ratings.${repType}`] = data['reputation']['ratings'][repType] + increment
              newData[`statistics.ratedBy.${sender}`] = undefined
              db.writeData(victim, newData)
              main.respond(sender, '[✔]: /unrep completed. Do /msg dfrep profile ' + victim + ' to check!')
              main.cmdCooldown(sender, "unrep")
            }
          })
        } else {
          let timestamp = main.updateTimestamp()
          console.log(timestamp + 'Invalid argument recieved from ' + sender)
          main.respond(sender, '[❌]: Invalid user. Is that player registered? Do /msg dfrep help for more.')
        }
      } else {
        let timestamp = main.updateTimestamp()
        console.log(timestamp + sender + 'attempted self unrep.')
        main.respond(sender, "[❌]: You can't unrep yourself! Do /msg dfrep help for more.")
      }
    })
  }
}