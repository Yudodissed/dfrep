
const main = require('../main')
const db = require('../db')

module.exports = {
  
  callsign: "unrep",
  syntax: "/unrep <user>",
  description: "Undoes a +rep or -rep you've given a player.",
  permission: "registered",
  cooldown: 0,

  run: function (sender, args) {
    db.readData(victim).then(data => {
      let validReq
      if (sender !== victim) {
          if (data !== false) {
              if (sender in data.statistics.ratedBy) {
                  if (data.statistics.ratedBy[sender] === "+1.devRating" || 
                  data.statistics.ratedBy[sender] === "+1.buildRating" || 
                  data.statistics.ratedBy[sender] === "+1.friendlyRating" ||
                  data.statistics.ratedBy[sender] === "-1.devRating" || 
                  data.statistics.ratedBy[sender] === "-1.buildRating" || 
                  data.statistics.ratedBy[sender] === "-1.friendlyRating") {
                      increment = data.statistics.ratedBy[sender].split('.')[0] * -1
                      repType = data.statistics.ratedBy[sender].split('.')[1]
                      validReq = true
                      console.log(increment)
                  }
              } else {
                  let timestamp = main.updateTimestamp()
                  console.log(timestamp + sender + 'failed unrep for' + victim)
                  main.respond(sender, "[❌]: You haven't +/-repped this player!")
              }
              db.readData(victim).then(data => {
                  if (validReq) {
                      objectPath.set(data, `reputation.ratings.${repType}`, data['reputation']['ratings'][repType] + increment)
                      objectPath.set(data, `statistics.ratedBy.${sender}`, undefined)
                      data.reputation.ratings.karma = data.reputation.ratings.buildRating + 
                                                      data.reputation.ratings.devRating + 
                                                      data.reputation.ratings.friendlyRating
                      let stringyData = JSON.stringify(data)
                      let sql = `UPDATE maindb SET data = '${stringyData}' WHERE user = "${victim}"`
                      con.query(sql, (error, results) => {
                          if (error) {
                            return console.error(error.message)
                          }
                      })
                      main.respond(sender, '[✔]: /unrep completed. Do /msg dfrep profile ' + victim + ' to check!')
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