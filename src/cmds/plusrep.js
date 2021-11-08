
const main = require('../main')
const db = require('../db')

const objectPath = require('object-path')

module.exports = {
  
  callsign: "+rep",
  syntax: "/+rep <user> [build|dev]",
  description: "Increases a players reputation score. Not providing a category will increase a players generic reputation. Providing a category will increase their rep of that type.",
  permission: "registered",
  cooldown: 0,

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
        db.readData(victim).then(data => {
            if (data !== false) {
                let validReq = false
                let undoType = "none"
                if (!(sender in data.statistics.ratedBy)) {
                    validReq = true
                } else {
                    if (
                    data.statistics.ratedBy[sender] === "-1.devRating" || 
                    data.statistics.ratedBy[sender] === "-1.buildRating" || 
                    data.statistics.ratedBy[sender] === "-1.friendlyRating") {
                        undoType = data.statistics.ratedBy[sender].split('.')[1]
                        validReq = true
                    }5
                }
                if (validReq) {
                    db.readData(victim).then(data => {
                        //You know, I wrote a whole function for this, but it only works when I post modified vers. here
                        objectPath.set(data, `reputation.ratings.${repType}`, ++data['reputation']['ratings'][repType])
                        if (undoType !== "none") {
                            objectPath.set(data, `reputation.ratings.${undoType}`, ++data['reputation']['ratings'][undoType])
                        }
                        data.statistics.ratedBy[sender] = `+1.${repType}`
                        objectPath.set(data, `statistics.ratedBy`, data.statistics.ratedBy)
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
                    })
                    main.respond(sender, '[✔]: /+rep completed. Do /msg dfrep profile ' + victim + ' to check!')
                } else {
                    let timestamp = main.updateTimestamp()
                    console.log(timestamp + sender + ' failed +rep for ' + victim)
                    main.respond(sender, "[❌]: You've already given this player a +rep!")
                }
            } else {
                let timestamp = main.updateTimestamp()
                console.log(timestamp + 'Invalid argument recieved from ' + sender)
                main.respond(sender, '[❌]: Invalid user. Is that player registered? Do /msg dfrep help for more.')
            }
        })
    } else {
        let timestamp = main.updateTimestamp()
        console.log(timestamp + sender + 'attempted self +rep.')
        main.respond(sender, "[❌]: You can't /+rep yourself! Do /msg dfrep help for more.")
    }
  }
}