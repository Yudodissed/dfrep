
const mineflayer = require('mineflayer')
const fs = require('fs')
const { timeStamp } = require('console')
const objectPath = require('object-path')
const crypto = require('crypto');

const main = require('./main')
const db = require('./db')

// Contains messages to be passed through multiple /letter iterations for /letter cconfirm and the like
let letterStorage = {}

//------------------------ /profile ------------------------//      //Change to profile command lol
//Quickly gives an overview of a players data.

exports.profile = function (sender, victim) {
    if (victim === undefined) victim = sender
    db.readData(victim).then(data => {
        if (data !== false) {false
            let displayBadge = data.badges.displayBadge
            if (displayBadge = "false") {
                displayBadge = 'No Badge'
            }
            main.respond(sender, `[✎]: ${victim} | ${data.reputation.ratings.karma} Karma (${data.reputation.ratings.buildRating} build, ${data.reputation.ratings.devRating} dev, ${data.reputation.ratings.friendlyRating} generic) | ${Object.keys(data.statistics.ratedBy).length} Voters | ${displayBadge}`)
        } else {
            let timestamp = main.updateTimestamp()
            console.log(timestamp + 'Invalid argument recieved from ' + sender)
            main.respond(sender, '[❌]: Invalid user. Is that player registered? Do /msg dfrep help for more.')
        }
    })
}

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
                    main.respond(sender, "[✔]: You've been registered! Welcome to dfrep! Try out /msg dfrep help for more.")
                }
            })
        } else {
            let timestamp = main.updateTimestamp()
            console.log(timestamp + 'Invalid argument recieved from ' + sender)
            main.respond(sender, '[❌]: You already seem to be registered.')
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
                main.respond(sender, '[❌]: Invalid type. Do /msg dfrep help for more.')
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
                    main.respond(sender, '[✔]: /-rep completed. Do /msg dfrep profile ' + victim + ' to check!')
                } else {
                    let timestamp = main.updateTimestamp()
                    console.log(timestamp + sender + 'failed -rep for' + victim)
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

exports.unrep = unrep;

//----------------------- /letter -----------------------//
// Leaves a letter in a players inbox. Maximum 100 char
// messages. Long cooldown. Trusted users only.

const letter = function (sender, args) {
    if (args[1] === "confirm") {
        if (sender in letterStorage) {
            let data = letterStorage[sender]
            delete letterStorage[sender]
            data = data.split(".")
            let victim = data[0]
            let message = data[1]
            db.writeLetter(sender, victim, message).then(result => {
                if (result === true) {
                    let timestamp = main.updateTimestamp()
                    console.log(timestamp + 'Message sent from ' + sender + ' to ' + victim)
                    main.respond(sender, '[✔]: Letter sent to ' + victim + '!')
                } else {
                    let timestamp = main.updateTimestamp()
                    console.log(timestamp + 'Message failed for ' + sender + ' to ' + victim + ". Their mailbox is full!")
                    main.respond(sender, '[❌]: ' + victim + 's mailbox is full!')
                }
            })
        } else {
            let timestamp = main.updateTimestamp()
            console.log(timestamp + 'No letter to confirm from ' + sender)
            main.respond(sender, '[❌]: No letter to confirm!')
        }
    } else {
        let victim = args[1]
        db.readData(victim).then(data => {
            if (data !== false) {
                let message = args.slice(2)
                message = message.join(" ")
                if (message.length <= 100) {
                    letterStorage[`${sender}`] = victim + "." + message
                    let timestamp = main.updateTimestamp()
                    console.log(timestamp + 'Letter added to storage by ' + sender + ": " + '"' + message + '"')
                    main.respond(sender, '[?]: Are you sure? /msg dfrep letter confirm.')
                } else {
                    let timestamp = main.updateTimestamp()
                    console.log(timestamp + 'Too large a message recieved from ' + sender)
                    main.respond(sender, '[❌]: Your letter can at most be 100 characters. Your message is ' + message.length + ' characters long.')
                }
            } else {
                let timestamp = main.updateTimestamp()
                console.log(timestamp + 'Invalid argument recieved from ' + sender)
                main.respond(sender, '[❌]: Invalid user. Is that player registered? Do /msg dfrep help for more.')
            }
        })
    }
}

exports.letter = letter;

//----------------------- /mail -----------------------//
// Reads, deletes, or lists letters in your inbox.
// 99 Messages maximum.

const mail = function (sender, args) {
    if (args.length === 1) {
        db.readInbox(sender).then(data => {
            let timestamp = main.updateTimestamp()
            console.log(timestamp + 'List of messages requested for ' + sender)
            let tidy = "messages"
            if (Object.keys(data).length === 2) {tidy = "message"}
            main.respond(sender, `[✉] You have (${--Object.keys(data).length}) ${tidy}.`)
        })
    } else {
        if (args[1] === "del") {
            let index = parseInt(args[2], 10)
            console.log(index)
            db.readInbox(sender).then(data => {
                let keyCount = --Object.keys(data).length
                if (index > keyCount) {
                    let timestamp = main.updateTimestamp()
                    console.log(timestamp + 'Out of bound index from ' + sender)
                    main.respond(sender, '[❌]: There is no message at that index.')
                } else {
                    db.burnLetter(sender, index).then(result => {
                        if (result === true) {
                            let timestamp = main.updateTimestamp()
                            console.log(timestamp + 'Letter deleted by ' + sender)
                            main.respond(sender, '[✔]: Letter deleted!')
                        } else {
                            let timestamp = main.updateTimestamp()
                            console.log(timestamp + 'Out of bound index from ' + sender)
                            main.respond(sender, '[❌]: There is no message at that index.')
                        }
                    })
                }
            })
        } else {
            let index = parseInt(args[1], 10)
            db.readInbox(sender).then(data => {
                let keyCount = --Object.keys(data).length
                if (index > keyCount || index <= 0) {
                    let timestamp = main.updateTimestamp()
                    console.log(timestamp + 'Out of bound index from ' + sender + "|"+index)
                    main.respond(sender, '[❌]: There is no message at that index.')
                } else {
                    let indexID = Object.keys(data)[--index]
                    let message = data[indexID]["message"]
                    let origin = data[indexID]["sender"]
                    main.respond(sender, `(${++index}) [✉ ${origin}]: ${message}`)                
                }
            })
        }
    }
}

exports.mail = mail;