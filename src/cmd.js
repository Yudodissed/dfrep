
const mineflayer = require('mineflayer')
const fs = require('fs')
const { timeStamp } = require('console')
const objectPath = require('object-path')

const main = require('./main')
const db = require('./db')

//------------------------ /quickrep ------------------------//
//Quickly gives an overview of a players data.

const quickrep = function (sender, victim) {
    if (victim === undefined) victim = sender
    db.readData(victim).then(data => {
        if (data !== false) {false
            let displayBadge = data.badges.displayBadge
            if (displayBadge = "false") {
                displayBadge = 'No Badge'
            }
            main.respond(sender, `${victim}: | ${data.reputation.ratings.karma} Karma | ${Object.keys(data.statistics.ratedBy).length} Voters | ${displayBadge}`)
        } else {
            let timestamp = main.updateTimestamp()
            console.log(timestamp + 'Invalid argument recieved from ' + sender)
            main.respond(sender, 'Invalid user. Is that player registered? Do /msg dfrep help for more.')
        }
    })
}

exports.quickrep = quickrep;

//------------------------ /register ------------------------//
// Creates a players data file. Most code is spaghetti'd
// into db.js.

const register = function (sender) {
    db.readData(sender).then(data => {
        if (data === false) {
            db.register(sender).then(output => {
                if (output === true) {
                    let timestamp = main.updateTimestamp()
                    console.log(timestamp+`${sender} has registered!`)
                    main.respond(sender, "You've been registered! Welcome to dfrep! Try out /msg dfrep help for more.")  
                }
            })
        } else {
            let timestamp = main.updateTimestamp()
            console.log(timestamp + 'Invalid argument recieved from ' + sender)
            main.respond(sender, 'You already seem to be registered.')
        }
    })
}

exports.register = register;

//------------------------ /+rep ------------------------//
// Arguments must be inputed using an array of the args to
// auto-detect the rep type.

const plusRep = function (sender, args) {
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
                main.respond(sender, '☒ Invalid type. Do /msg dfrep help for more.')
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
                    main.respond(sender, '☑ /+rep completed. Do /msg dfrep karma ' + victim + ' to check!')
                } else {
                    let timestamp = main.updateTimestamp()
                    console.log(timestamp + sender + ' failed +rep for ' + victim)
                    main.respond(sender, "☒ You've already given this player a +rep!")
                }
            } else {
                let timestamp = main.updateTimestamp()
                console.log(timestamp + 'Invalid argument recieved from ' + sender)
                main.respond(sender, '☒ Invalid user. Is that player registered? Do /msg dfrep help for more.')
            }
        })
    } else {
        let timestamp = main.updateTimestamp()
        console.log(timestamp + sender + 'attempted self +rep.')
        main.respond(sender, "☒ You can't /+rep yourself! Do /msg dfrep help for more.")
    }
}

exports.plusRep = plusRep;

//------------------------ /-rep ------------------------//
// Arguments must be inputed using an array of the args to
// auto-detect the rep type.

const minusRep = function (sender, args) {
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
                main.respond(sender, '☒ Invalid type. Do /msg dfrep help for more.')
                return
            }
        } else repType = 'friendlyRating'
        db.readData(victim).then(data => {
            if (data !== false) {
                let validReq = false
                let undoType
                if (!(sender in data.statistics.ratedBy)) {
                    validReq = true
                } else {
                    if (data.statistics.ratedBy[sender] === "+1.devRating" || 
                    data.statistics.ratedBy[sender] === "+1.buildRating" || 
                    data.statistics.ratedBy[sender] === "+1.friendlyRating") {
                        undoType = data.statistics.ratedBy[sender].split('.')[1]
                        validReq = true
                    }
                }
                if (validReq) {
                    db.readData(victim).then(data => {
                        objectPath.set(data, `reputation.ratings.${repType}`, --data['reputation']['ratings'][repType])
                        if (undoType !== "none") {
                            objectPath.set(data, `reputation.ratings.${undoType}`, --data['reputation']['ratings'][undoType])
                        }
                        data.statistics.ratedBy[sender] = `-1.${repType}`
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
                    main.respond(sender, '☑ /-rep completed. Do /msg dfrep karma ' + victim + ' to check!')
                } else {
                    let timestamp = main.updateTimestamp()
                    console.log(timestamp + sender + 'failed -rep for' + victim)
                    main.respond(sender, "☒ You've already given this player a -rep!")
                }
            } else {
                let timestamp = main.updateTimestamp()
                console.log(timestamp + 'Invalid argument recieved from ' + sender)
                main.respond(sender, '☒ Invalid user. Is that player registered? Do /msg dfrep help for more.')
            }
        })
    } else {
        let timestamp = main.updateTimestamp()
        console.log(timestamp + sender + 'attempted self -rep.')
        main.respond(sender, "☒ You can't /-rep yourself! Do /msg dfrep help for more.")
    }
}

exports.minusRep = minusRep;

//----------------------- /unrep -----------------------//
// Removes a +rep/-rep from a player. This is
// different from either of the above, as it is
// entirely neutral.

const unrep = function (sender, victim) {
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
                    main.respond(sender, "☒ You haven't +/-repped this player!")
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
                        main.respond(sender, '☑ /unrep completed. Do /msg dfrep karma ' + victim + ' to check!')
                    }
                })
            } else {
                let timestamp = main.updateTimestamp()
                console.log(timestamp + 'Invalid argument recieved from ' + sender)
                main.respond(sender, '☒ Invalid user. Is that player registered? Do /msg dfrep help for more.')
            }
        } else {
            let timestamp = main.updateTimestamp()
            console.log(timestamp + sender + 'attempted self unrep.')
            main.respond(sender, "☒ You can't unrep yourself! Do /msg dfrep help for more.")
        }
    })
}

exports.unrep = unrep;